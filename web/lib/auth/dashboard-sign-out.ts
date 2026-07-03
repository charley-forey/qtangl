import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import {
  ACTIVE_TENANT_COOKIE,
  SESSION_ASSERTION_COOKIE,
  SESSION_KEY_COOKIE,
} from "@/lib/auth/workos";

export const QTANGL_SESSION_COOKIE_NAMES = [
  SESSION_ASSERTION_COOKIE,
  SESSION_KEY_COOKIE,
  ACTIVE_TENANT_COOKIE,
  "qtangl_session",
] as const;

const COOKIE_CLEAR_OPTS = { path: "/", maxAge: 0 } as const;

/** Clear Qtangl dashboard session cookies on a response. */
export function clearQtanglSessionCookies(response: NextResponse): void {
  for (const name of QTANGL_SESSION_COOKIE_NAMES) {
    response.cookies.set(name, "", COOKIE_CLEAR_OPTS);
  }
}

/** Clear Qtangl cookies from the server cookie store (before WorkOS signOut redirect). */
export async function clearQtanglSessionCookieStore(): Promise<void> {
  const cookieStore = await cookies();
  for (const name of QTANGL_SESSION_COOKIE_NAMES) {
    cookieStore.delete(name);
  }
}

export const DASHBOARD_LOGIN_PATH = "/command-center/login";
