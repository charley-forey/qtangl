import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { clearQtanglSessionCookies, clearQtanglSessionCookieStore } from "@/lib/auth/dashboard-session-cookies";
import { BFF_SESSION_TTL_SECONDS, resolveBootstrapCredentials } from "@/lib/auth/bff-session";
import {
  ACTIVE_TENANT_COOKIE,
  bffSessionSecret,
  qtanglApiBaseUrlServer,
  SESSION_ASSERTION_COOKIE,
  SESSION_KEY_COOKIE,
  workosAuthEnabled,
} from "@/lib/auth/workos";

type BootstrapResponse = {
  status: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: string;
  userId: string;
  authMode: string;
  memberships: Array<{ tenantId: string; tenantName: string; role: string; authMode?: string }>;
  sessionAssertion: string | null;
  sessionKey?: {
    sessionKey?: string;
    sessionKeyId?: string;
    expiresAt?: string;
    role?: string;
  } | null;
  capabilities?: {
    canAdmin: boolean;
    canWrite: boolean;
    canViewCompliance: boolean;
    canManageKeys: boolean;
    canInvite: boolean;
  };
  onboarding?: { complete: boolean; nextStep: string };
};

type BootstrapResult =
  | { ok: true; data: BootstrapResponse }
  | { ok: false; reason: "no_membership" | "bff_secret_missing" | "database_unavailable" };

async function resolveWorkosUser(): Promise<{ id: string; email: string; firstName?: string; lastName?: string } | null> {
  if (!workosAuthEnabled()) {
    return null;
  }
  try {
    const { withAuth } = await import("@workos-inc/authkit-nextjs");
    const { user } = await withAuth();
    if (!user?.id || !user.email) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    };
  } catch {
    return null;
  }
}

const ONBOARDING_COOKIE = "qtangl_onboarding";

async function bootstrapFromBackend(
  workosUserId: string,
  email: string,
  name: string | undefined,
  activeTenantId: string | undefined,
  onboardingToken?: string
): Promise<BootstrapResult> {
  const secret = bffSessionSecret();
  if (!secret) {
    return { ok: false, reason: "bff_secret_missing" };
  }
  const params = new URLSearchParams({
    workos_user_id: workosUserId,
    email,
  });
  if (name) {
    params.set("name", name);
  }
  if (activeTenantId) {
    params.set("active_tenant_id", activeTenantId);
  }
  if (onboardingToken) {
    params.set("onboarding_token", onboardingToken);
  }
  const response = await fetch(
    `${qtanglApiBaseUrlServer()}/internal/dashboard/bootstrap?${params.toString()}`,
    {
      headers: { "X-Qtangl-Bff-Secret": secret },
      cache: "no-store",
    }
  );
  if (response.status === 403) {
    return { ok: false, reason: "no_membership" };
  }
  if (response.status === 503) {
    return { ok: false, reason: "database_unavailable" };
  }
  if (!response.ok) {
    return { ok: false, reason: "no_membership" };
  }
  return { ok: true, data: (await response.json()) as BootstrapResponse };
}

const SESSION_KEY_MAX_AGE_SECONDS = BFF_SESSION_TTL_SECONDS;

function applySessionCookies(
  response: NextResponse,
  bootstrap: BootstrapResponse,
  credentials: ReturnType<typeof resolveBootstrapCredentials>
) {
  if (credentials.assertion) {
    response.cookies.set(SESSION_ASSERTION_COOKIE, credentials.assertion, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 3600,
    });
  } else {
    response.cookies.delete(SESSION_ASSERTION_COOKIE);
  }

  const rawSessionKey = credentials.sessionKey;
  if (rawSessionKey) {
    response.cookies.set(SESSION_KEY_COOKIE, rawSessionKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_KEY_MAX_AGE_SECONDS,
    });
  } else {
    response.cookies.delete(SESSION_KEY_COOKIE);
  }

  response.cookies.set(ACTIVE_TENANT_COOKIE, bootstrap.tenantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 3600,
  });
}

function sessionPayload(bootstrap: BootstrapResponse) {
  return {
    email: bootstrap.email,
    tenantId: bootstrap.tenantId,
    tenantName: bootstrap.tenantName,
    role: bootstrap.role,
    userId: bootstrap.userId,
    authMode: bootstrap.authMode,
    memberships: bootstrap.memberships,
  };
}

function capabilitiesFromRole(role: string) {
  const canAdmin = role === "admin";
  const canWrite = role === "admin" || role === "operator";
  return {
    canAdmin,
    canWrite,
    canViewCompliance: true,
    canManageKeys: canAdmin,
    canInvite: canAdmin,
  };
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const onboardingFromQuery = request.nextUrl.searchParams.get("onboarding")?.trim();
  const onboardingToken =
    onboardingFromQuery || cookieStore.get(ONBOARDING_COOKIE)?.value || undefined;
  const legacyRaw = cookieStore.get("qtangl_session")?.value;
  if (legacyRaw && !workosAuthEnabled()) {
    try {
      const session = JSON.parse(legacyRaw) as { email: string; tenantId: string; role: string };
      return NextResponse.json({
        authenticated: true,
        session,
        authMethod: "legacy_oidc",
        capabilities: capabilitiesFromRole(session.role),
      });
    } catch {
      /* fall through */
    }
  }

  const workosUser = await resolveWorkosUser();
  if (!workosUser) {
    return NextResponse.json({ authenticated: false, reason: "workos_user_missing" });
  }

  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  const name = [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ").trim() || undefined;
  const bootstrap = await bootstrapFromBackend(
    workosUser.id,
    workosUser.email,
    name,
    activeTenantId,
    onboardingToken
  );
  if (!bootstrap.ok) {
    return NextResponse.json({
      authenticated: false,
      reason: bootstrap.reason,
      authMethod: "workos",
      workosSignedIn: true,
    });
  }

  const credentials = resolveBootstrapCredentials(bootstrap.data);
  const response = NextResponse.json({
    authenticated: true,
    authMethod: "workos",
    session: sessionPayload(bootstrap.data),
    capabilities: bootstrap.data.capabilities ?? capabilitiesFromRole(bootstrap.data.role),
    onboarding: bootstrap.data.onboarding ?? { complete: false, nextStep: "baseline" },
    credentialsReady: credentials.ready,
    sessionSignedOnWeb: Boolean(!bootstrap.data.sessionAssertion && credentials.assertion),
  });
  applySessionCookies(response, bootstrap.data, credentials);
  if (onboardingToken) {
    response.cookies.delete(ONBOARDING_COOKIE);
  }
  return response;
}

export async function POST(request: NextRequest) {
  const workosUser = await resolveWorkosUser();
  if (!workosUser) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const body = (await request.json()) as { tenantId?: string };
  const name = [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ").trim() || undefined;
  const bootstrap = await bootstrapFromBackend(workosUser.id, workosUser.email, name, body.tenantId);
  if (!bootstrap.ok) {
    return NextResponse.json({ error: "Unable to switch tenant.", reason: bootstrap.reason }, { status: 403 });
  }
  const credentials = resolveBootstrapCredentials(bootstrap.data);
  const response = NextResponse.json({
    authenticated: true,
    session: sessionPayload(bootstrap.data),
    capabilities: bootstrap.data.capabilities ?? capabilitiesFromRole(bootstrap.data.role),
    credentialsReady: credentials.ready,
  });
  applySessionCookies(response, bootstrap.data, credentials);
  return response;
}

export async function DELETE() {
  await clearQtanglSessionCookieStore();
  const response = NextResponse.json({ ok: true, signOutUrl: "/api/dashboard/sign-out" });
  clearQtanglSessionCookies(response);
  return response;
}
