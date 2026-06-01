import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { appBaseUrl, oidcConfigured, oidcRedirectUri } from "@/lib/auth/oidc";

export async function GET() {
  if (!oidcConfigured()) {
    return NextResponse.json({ error: "OIDC is not configured on this deployment." }, { status: 503 });
  }
  const issuer = process.env.AUTH_OIDC_ISSUER!.replace(/\/$/, "");
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("qtangl_oidc_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  const params = new URLSearchParams({
    client_id: process.env.AUTH_OIDC_CLIENT_ID!,
    redirect_uri: oidcRedirectUri(),
    response_type: "code",
    scope: process.env.AUTH_OIDC_SCOPES || "openid profile email",
    state,
  });
  return NextResponse.redirect(`${issuer}/authorize?${params.toString()}`);
}
