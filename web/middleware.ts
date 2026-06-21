import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { workosAuthKitReady } from "@/lib/auth/workos";

async function statusRewrite(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (host === "status.qtangl.com") {
    const url = request.nextUrl.clone();
    url.pathname = "/status";
    return NextResponse.rewrite(url);
  }
  return null;
}

function pathUsesAuthKit(pathname: string): boolean {
  return (
    pathname === "/auth/callback" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/ops")
  );
}

export async function middleware(request: NextRequest) {
  const rewrite = await statusRewrite(request);
  if (rewrite) {
    return rewrite;
  }

  const pathname = request.nextUrl.pathname;
  if (workosAuthKitReady() && pathUsesAuthKit(pathname)) {
    try {
      const { authkitMiddleware } = await import("@workos-inc/authkit-nextjs");
      const handler = authkitMiddleware({
        // Session refresh only — do not force AuthKit login on marketing pages.
        middlewareAuth: { enabled: false, unauthenticatedPaths: [] },
      });
      return await handler(request, {} as never);
    } catch (error) {
      console.error("AuthKit middleware error:", error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
