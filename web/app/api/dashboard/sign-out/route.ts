import { NextRequest, NextResponse } from "next/server";

import {
  clearQtanglSessionCookieStore,
  clearQtanglSessionCookies,
  DASHBOARD_LOGIN_PATH,
} from "@/lib/auth/dashboard-sign-out";
import { workosAuthEnabled } from "@/lib/auth/workos";

export const runtime = "nodejs";

/** Full-page sign out: clear Qtangl cookies and WorkOS session, then redirect. */
export async function GET(request: NextRequest) {
  await clearQtanglSessionCookieStore();

  const returnTo = new URL(DASHBOARD_LOGIN_PATH, request.url).toString();

  if (workosAuthEnabled()) {
    const { signOut } = await import("@workos-inc/authkit-nextjs");
    return signOut({ returnTo });
  }

  const response = NextResponse.redirect(new URL(DASHBOARD_LOGIN_PATH, request.url));
  clearQtanglSessionCookies(response);
  return response;
}
