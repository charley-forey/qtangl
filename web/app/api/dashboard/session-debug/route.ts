import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACTIVE_TENANT_COOKIE,
  bffSessionSecret,
  qtanglApiBaseUrlServer,
  SESSION_ASSERTION_COOKIE,
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

/** Admin-only session diagnostics (no secrets). */
export async function GET() {
  const cookieStore = await cookies();
  const hasAssertionCookie = Boolean(cookieStore.get(SESSION_ASSERTION_COOKIE)?.value);
  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value ?? null;
  const workosUserId = await resolveWorkosUserId();

  let bootstrapOk: boolean | null = null;
  let summaryOk: boolean | null = null;

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

  if (hasAssertionCookie && activeTenantId) {
    try {
      const summaryResponse = await fetch(
        `${qtanglApiBaseUrlServer()}/tenant/dashboard/summary`,
        {
          headers: {
            "X-Qtangl-Session": cookieStore.get(SESSION_ASSERTION_COOKIE)!.value,
          },
          cache: "no-store",
        }
      );
      summaryOk = summaryResponse.ok;
    } catch {
      summaryOk = false;
    }
  }

  return NextResponse.json({
    hasAssertionCookie,
    activeTenantId,
    bootstrapOk,
    summaryOk,
    workosAuthenticated: Boolean(workosUserId),
  });
}
