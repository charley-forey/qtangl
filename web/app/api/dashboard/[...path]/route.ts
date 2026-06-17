import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { buildBffUpstreamAuthHeaders } from "@/lib/auth/bff-auth-headers";
import { qtanglApiBaseUrlServer, SESSION_ASSERTION_COOKIE, SESSION_KEY_COOKIE } from "@/lib/auth/workos";

const ALLOWED_PREFIXES = ["/tenant/", "/pqc/"];

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const backendPath = `/${pathSegments.join("/")}`;
  if (!ALLOWED_PREFIXES.some((prefix) => backendPath.startsWith(prefix))) {
    return NextResponse.json({ error: "Path not allowed." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const assertion = cookieStore.get(SESSION_ASSERTION_COOKIE)?.value;
  const sessionKey = cookieStore.get(SESSION_KEY_COOKIE)?.value;
  const legacySession = cookieStore.get("qtangl_session")?.value;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("authorization");

  const upstreamAuth = buildBffUpstreamAuthHeaders({ assertion, sessionKey });
  for (const [key, value] of Object.entries(upstreamAuth)) {
    headers.set(key, value);
  }

  if (!assertion && !sessionKey && legacySession) {
    try {
      const session = JSON.parse(legacySession) as { apiKey?: string };
      if (session.apiKey) {
        headers.set("Authorization", `Bearer ${session.apiKey}`);
      }
    } catch {
      /* ignore */
    }
  }

  const url = new URL(request.url);
  const target = `${qtanglApiBaseUrlServer()}${backendPath}${url.search}`;

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");

  if (!assertion && !sessionKey && !legacySession && backendPath.includes("/dashboard/summary")) {
    return NextResponse.json(
      {
        detail:
          "Missing credentials. Sign out, sign in again, or check /api/dashboard/session-debug for cookie status.",
      },
      { status: 401 }
    );
  }

  if (backendPath.includes("/report") && upstream.ok) {
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
