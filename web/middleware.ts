import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { workosAuthEnabled } from "@/lib/auth/workos";

async function statusRewrite(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (host === "status.qtangl.com") {
    const url = request.nextUrl.clone();
    url.pathname = "/status";
    return NextResponse.rewrite(url);
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const rewrite = await statusRewrite(request);
  if (rewrite) {
    return rewrite;
  }

  if (workosAuthEnabled()) {
    try {
      const { authkitMiddleware } = await import("@workos-inc/authkit-nextjs");
      const handler = authkitMiddleware({
        middlewareAuth: {
          enabled: true,
          unauthenticatedPaths: [
            "/",
            "/assess",
            "/access",
            "/pricing",
            "/docs",
            "/monitor",
            "/convert",
            "/verify",
            "/auth/callback",
            "/api/dashboard/me",
            "/api/auth",
          ],
        },
      });
      return handler(request, {} as never);
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
