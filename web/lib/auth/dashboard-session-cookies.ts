import type { NextResponse } from "next/server";

import {
  ACTIVE_TENANT_COOKIE,
  SESSION_ASSERTION_COOKIE,
  SESSION_KEY_COOKIE,
} from "@/lib/auth/workos";

/** Clear Qtangl dashboard session cookies on a response. */
export function clearQtanglSessionCookies(response: NextResponse): void {
  response.cookies.delete(SESSION_ASSERTION_COOKIE);
  response.cookies.delete(SESSION_KEY_COOKIE);
  response.cookies.delete(ACTIVE_TENANT_COOKIE);
  response.cookies.delete("qtangl_session");
}
