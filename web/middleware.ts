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

function customDomainHeaders(request: NextRequest): Headers | null {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (!host || host === "localhost" || host.endsWith(".qtangl.com") || host === "qtangl.com") {
    return null;
  }
  let map: Record<string, string> = {};
  try {
    const raw = process.env.QTANGL_CUSTOM_DOMAIN_MAP;
    if (raw) map = JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
  const tenantId = map[host];
  if (!tenantId) return null;
  const headers = new Headers(request.headers);
  headers.set("x-qtangl-tenant-id", tenantId);
  headers.set("x-qtangl-custom-domain", host);
  return headers;
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

  const customHeaders = customDomainHeaders(request);
  const pathname = request.nextUrl.pathname;
  if (workosAuthKitReady() && pathUsesAuthKit(pathname)) {
    try {
      const { authkitMiddleware } = await import("@workos-inc/authkit-nextjs");
      const handler = authkitMiddleware({
        // Session refresh only — do not force AuthKit login on marketing pages.
        middlewareAuth: { enabled: false, unauthenticatedPaths: [] },
      });
      const response = await handler(request, {} as never);
      if (!response) {
        if (customHeaders) {
          return NextResponse.next({ request: { headers: customHeaders } });
        }
        return NextResponse.next();
      }
      if (customHeaders) {
        customHeaders.forEach((value, key) => response.headers.set(key, value));
      }
      return response;
    } catch (error) {
      console.error("AuthKit middleware error:", error);
      if (customHeaders) {
        return NextResponse.next({ request: { headers: customHeaders } });
      }
      return NextResponse.next();
    }
  }

  if (customHeaders) {
    return NextResponse.next({ request: { headers: customHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
