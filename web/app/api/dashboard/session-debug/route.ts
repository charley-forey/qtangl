import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  bffAuthForwardMode,
  buildBffUpstreamAuthHeaders,
} from "@/lib/auth/bff-auth-headers";
import {
  ACTIVE_TENANT_COOKIE,
  bffSessionSecret,
  qtanglApiBaseUrlServer,
  SESSION_ASSERTION_COOKIE,
  SESSION_KEY_COOKIE,
  workosAuthEnabled,
} from "@/lib/auth/workos";

export const runtime = "nodejs";

async function resolveWorkosUserId(): Promise<string | null> {
  if (!workosAuthEnabled()) {
    return null;
  }
  try {
    const { withAuth } = await import("@workos-inc/authkit-nextjs");
    const { user } = await withAuth();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function probeSummary(headers: Record<string, string>) {
  const response = await fetch(`${qtanglApiBaseUrlServer()}/tenant/dashboard/summary`, {
    headers,
    cache: "no-store",
  });
  let detail: string | null = null;
  try {
    const text = await response.text();
    detail = text.slice(0, 280) || null;
  } catch {
    detail = null;
  }
  return { ok: response.ok, status: response.status, detail };
}

/** Session diagnostics (no secrets). */
export async function GET() {
  const cookieStore = await cookies();
  const assertion = cookieStore.get(SESSION_ASSERTION_COOKIE)?.value ?? null;
  const sessionKey = cookieStore.get(SESSION_KEY_COOKIE)?.value ?? null;
  const hasAssertionCookie = Boolean(assertion);
  const hasSessionKeyCookie = Boolean(sessionKey);
  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value ?? null;
  const workosUserId = await resolveWorkosUserId();
  const credentialsReady = hasAssertionCookie || hasSessionKeyCookie;
  const summaryAuthMethod = bffAuthForwardMode(assertion, sessionKey);

  let bootstrapOk: boolean | null = null;
  let summaryOk: boolean | null = null;
  let summaryStatus: number | null = null;
  let summaryDetail: string | null = null;
  let assertionSummaryOk: boolean | null = null;
  let sessionKeySummaryOk: boolean | null = null;

  const secret = bffSessionSecret();
  if (secret && workosUserId) {
    try {
      const bootstrapResponse = await fetch(
        `${qtanglApiBaseUrlServer()}/internal/dashboard/user?workos_user_id=${encodeURIComponent(workosUserId)}`,
        {
          headers: { "X-Qtangl-Bff-Secret": secret },
          cache: "no-store",
        }
      );
      bootstrapOk = bootstrapResponse.ok;
    } catch {
      bootstrapOk = false;
    }
  }

  if (credentialsReady && activeTenantId) {
    try {
      if (assertion) {
        const assertionProbe = await probeSummary(buildBffUpstreamAuthHeaders({ assertion }));
        assertionSummaryOk = assertionProbe.ok;
      }
      if (sessionKey) {
        const sessionKeyProbe = await probeSummary(buildBffUpstreamAuthHeaders({ sessionKey }));
        sessionKeySummaryOk = sessionKeyProbe.ok;
      }
      const combinedProbe = await probeSummary(
        buildBffUpstreamAuthHeaders({ assertion, sessionKey })
      );
      summaryOk = combinedProbe.ok;
      summaryStatus = combinedProbe.status;
      summaryDetail = combinedProbe.detail;
    } catch {
      summaryOk = false;
    }
  }

  let recommendedAction: string | null = null;
  if (workosUserId && !credentialsReady) {
    recommendedAction =
      "Set QTANGL_BFF_SESSION_SECRET on Railway and Vercel (same value), redeploy, then sign out and sign in.";
  } else if (credentialsReady && summaryOk === false) {
    if (assertionSummaryOk === false && sessionKeySummaryOk === true) {
      recommendedAction =
        "Session key works but assertion failed — stale assertion cookie or BFF secret mismatch on Railway. Sign out and sign in, or align QTANGL_BFF_SESSION_SECRET on Vercel and Railway.";
    } else if (summaryStatus === 403) {
      recommendedAction = "Authenticated but membership or role denied — verify tenant membership in Railway database.";
    } else if (summaryStatus && summaryStatus >= 500) {
      recommendedAction = "Railway API error loading summary — check API logs and database health (not a cookie issue).";
    } else {
      recommendedAction = "Session cookies present but summary failed — check Railway API health and membership.";
    }
  }

  return NextResponse.json({
    hasAssertionCookie,
    hasSessionKeyCookie,
    credentialsReady,
    activeTenantId,
    bootstrapOk,
    summaryOk,
    summaryStatus,
    summaryAuthMethod,
    assertionSummaryOk,
    sessionKeySummaryOk,
    summaryDetail,
    workosAuthenticated: Boolean(workosUserId),
    recommendedAction,
  });
}
