import { NextRequest, NextResponse } from "next/server";

import { clearQtanglSessionCookies } from "@/lib/auth/dashboard-session-cookies";
import { workosAuthEnabled } from "@/lib/auth/workos";

export const runtime = "nodejs";

/** Full-page sign out: clear Qtangl cookies and WorkOS session, then redirect. */
export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/dashboard/login", request.url);
  const response = NextResponse.redirect(redirectUrl);
  clearQtanglSessionCookies(response);

  if (workosAuthEnabled()) {
    try {
      const { signOut } = await import("@workos-inc/authkit-nextjs");
      await signOut({ returnTo: "/dashboard/login" });
    } catch {
      /* WorkOS cookie may already be cleared */
    }
  }

  return response;
}
