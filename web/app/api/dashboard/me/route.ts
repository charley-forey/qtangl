import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ACTIVE_TENANT_COOKIE,
  bffSessionSecret,
  qtanglApiBaseUrlServer,
  SESSION_ASSERTION_COOKIE,
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
};

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

async function bootstrapFromBackend(
  workosUserId: string,
  email: string,
  name: string | undefined,
  activeTenantId: string | undefined
): Promise<BootstrapResponse | null> {
  const secret = bffSessionSecret();
  if (!secret) {
    return null;
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
  const response = await fetch(
    `${qtanglApiBaseUrlServer()}/internal/dashboard/bootstrap?${params.toString()}`,
    {
      headers: { "X-Qtangl-Bff-Secret": secret },
      cache: "no-store",
    }
  );
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as BootstrapResponse;
}

function applySessionCookies(response: NextResponse, bootstrap: BootstrapResponse) {
  if (bootstrap.sessionAssertion) {
    response.cookies.set(SESSION_ASSERTION_COOKIE, bootstrap.sessionAssertion, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 3600,
    });
  }
  response.cookies.set(ACTIVE_TENANT_COOKIE, bootstrap.tenantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 3600,
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const legacyRaw = cookieStore.get("qtangl_session")?.value;
  if (legacyRaw && !workosAuthEnabled()) {
    try {
      const session = JSON.parse(legacyRaw) as { email: string; tenantId: string; role: string };
      return NextResponse.json({ authenticated: true, session, authMethod: "legacy_oidc" });
    } catch {
      /* fall through */
    }
  }

  const workosUser = await resolveWorkosUser();
  if (!workosUser) {
    return NextResponse.json({ authenticated: false });
  }

  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  const name = [workosUser.firstName, workosUser.lastName].filter(Boolean).join(" ").trim() || undefined;
  const bootstrap = await bootstrapFromBackend(workosUser.id, workosUser.email, name, activeTenantId);
  if (!bootstrap) {
    return NextResponse.json({ authenticated: false, reason: "no_membership" });
  }

  const response = NextResponse.json({
    authenticated: true,
    authMethod: "workos",
    session: {
      email: bootstrap.email,
      tenantId: bootstrap.tenantId,
      tenantName: bootstrap.tenantName,
      role: bootstrap.role,
      userId: bootstrap.userId,
      authMode: bootstrap.authMode,
      memberships: bootstrap.memberships,
    },
  });
  applySessionCookies(response, bootstrap);
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
  if (!bootstrap) {
    return NextResponse.json({ error: "Unable to switch tenant." }, { status: 403 });
  }
  const response = NextResponse.json({
    authenticated: true,
    session: {
      email: bootstrap.email,
      tenantId: bootstrap.tenantId,
      tenantName: bootstrap.tenantName,
      role: bootstrap.role,
      userId: bootstrap.userId,
      authMode: bootstrap.authMode,
      memberships: bootstrap.memberships,
    },
  });
  applySessionCookies(response, bootstrap);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_ASSERTION_COOKIE);
  response.cookies.delete(ACTIVE_TENANT_COOKIE);
  response.cookies.delete("qtangl_session");
  if (workosAuthEnabled()) {
    try {
      const { signOut } = await import("@workos-inc/authkit-nextjs");
      await signOut();
    } catch {
      /* ignore */
    }
  }
  return response;
}
