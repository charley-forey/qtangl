import { NextResponse } from "next/server";

import {
  workosAuthEnabled,
  workosAuthKitMissing,
  workosAuthKitReady,
} from "@/lib/auth/workos";

export const runtime = "nodejs";

/** Diagnostic booleans for WorkOS dashboard auth — no secrets exposed. */
export async function GET() {
  return NextResponse.json({
    workosAuthEnabled: workosAuthEnabled(),
    workosAuthKitReady: workosAuthKitReady(),
    missing: workosAuthKitMissing(),
    hasBffSessionSecret: Boolean(process.env.QTANGL_BFF_SESSION_SECRET),
    redirectUriConfigured: Boolean(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim()),
    cookiePasswordConfigured: (process.env.WORKOS_COOKIE_PASSWORD ?? "").length >= 32,
  });
}
