import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { appBaseUrl, mapEmailToTenant, oidcConfigured, oidcRedirectUri } from "@/lib/auth/oidc";

type TokenResponse = {
  access_token?: string;
  id_token?: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split(".")[1];
  if (!part) return {};
  const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}

export async function GET(request: Request) {
  if (!oidcConfigured()) {
    return NextResponse.redirect(`${appBaseUrl()}/dashboard?sso=unconfigured`);
  }
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("qtangl_oidc_state")?.value;
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(`${appBaseUrl()}/dashboard?sso=error`);
  }
  cookieStore.delete("qtangl_oidc_state");

  const issuer = process.env.AUTH_OIDC_ISSUER!.replace(/\/$/, "");
  const tokenRes = await fetch(`${issuer}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: oidcRedirectUri(),
      client_id: process.env.AUTH_OIDC_CLIENT_ID!,
      client_secret: process.env.AUTH_OIDC_CLIENT_SECRET!,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appBaseUrl()}/dashboard?sso=token_error`);
  }
  const tokens = (await tokenRes.json()) as TokenResponse;
  const claims = tokens.id_token ? decodeJwtPayload(tokens.id_token) : {};
  const email = String(claims.email || claims.preferred_username || claims.sub || "");
  const mapping = mapEmailToTenant(email);
  const session = {
    email,
    tenantId: mapping.tenantId,
    role: mapping.role,
    issuedAt: new Date().toISOString(),
  };
  cookieStore.set("qtangl_session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return NextResponse.redirect(`${appBaseUrl()}/dashboard`);
}
