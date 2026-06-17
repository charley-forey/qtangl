import { NextResponse } from "next/server";

import {
  bffSessionSecret,
  qtanglApiBaseUrlServer,
  workosAuthEnabled,
  workosAuthKitMissing,
  workosAuthKitReady,
} from "@/lib/auth/workos";

export const runtime = "nodejs";

async function probeBootstrapReachable(): Promise<boolean | null> {
  const secret = bffSessionSecret();
  if (!secret) {
    return null;
  }
  try {
    const response = await fetch(`${qtanglApiBaseUrlServer()}/internal/dashboard/user?workos_user_id=probe`, {
      headers: { "X-Qtangl-Bff-Secret": secret },
      cache: "no-store",
    });
    return response.status !== 503;
  } catch {
    return false;
  }
}

/** Probe that Vercel BFF secret matches Railway (bootstrap accepts the header). */
async function probeBffSecretMatchesBackend(): Promise<boolean | null> {
  const secret = bffSessionSecret();
  if (!secret) {
    return null;
  }
  try {
    const response = await fetch(
      `${qtanglApiBaseUrlServer()}/internal/dashboard/bootstrap?workos_user_id=probe&email=probe@example.com`,
      {
        headers: { "X-Qtangl-Bff-Secret": secret },
        cache: "no-store",
      }
    );
    return response.status === 403 || response.status === 200;
  } catch {
    return false;
  }
}

/** Diagnostic booleans for WorkOS dashboard auth — no secrets exposed. */
export async function GET() {
  const bootstrapReachable = await probeBootstrapReachable();
  const bffSecretMatchesBackend = await probeBffSecretMatchesBackend();
  return NextResponse.json({
    workosAuthEnabled: workosAuthEnabled(),
    workosAuthKitReady: workosAuthKitReady(),
    missing: workosAuthKitMissing(),
    hasBffSessionSecret: Boolean(process.env.QTANGL_BFF_SESSION_SECRET),
    bffSecretMatchesBackend,
    clientWorkosFlagSet: process.env.NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_WORKOS === "true",
    redirectUriConfigured: Boolean(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim()),
    cookiePasswordConfigured: (process.env.WORKOS_COOKIE_PASSWORD ?? "").length >= 32,
    bootstrapReachable,
  });
}
