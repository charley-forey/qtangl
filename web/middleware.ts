import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  if (host === "status.qtangl.com") {
    const url = request.nextUrl.clone();
    url.pathname = "/status";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
