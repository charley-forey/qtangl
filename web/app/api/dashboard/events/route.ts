import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { buildBffUpstreamAuthHeaders } from "@/lib/auth/bff-auth-headers";
import { qtanglApiBaseUrlServer, SESSION_ASSERTION_COOKIE, SESSION_KEY_COOKIE } from "@/lib/auth/workos";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const assertion = cookieStore.get(SESSION_ASSERTION_COOKIE)?.value;
  const sessionKey = cookieStore.get(SESSION_KEY_COOKIE)?.value;
  if (!assertion && !sessionKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const upstreamHeaders: Record<string, string> = {
    Accept: "text/event-stream",
    ...buildBffUpstreamAuthHeaders({ assertion, sessionKey }),
  };

  const target = `${qtanglApiBaseUrlServer()}/tenant/dashboard/events`;
  const upstream = await fetch(target, {
    headers: upstreamHeaders,
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Stream unavailable" }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
