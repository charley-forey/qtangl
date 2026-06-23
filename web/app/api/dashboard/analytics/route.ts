import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { buildBffUpstreamAuthHeaders } from "@/lib/auth/bff-auth-headers";
import { qtanglApiBaseUrlServer, SESSION_ASSERTION_COOKIE, SESSION_KEY_COOKIE } from "@/lib/auth/workos";

export const runtime = "nodejs";

type TrackBody = {
  event?: string;
  properties?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const assertion = cookieStore.get(SESSION_ASSERTION_COOKIE)?.value;
  const sessionKey = cookieStore.get(SESSION_KEY_COOKIE)?.value;
  const legacySession = cookieStore.get("qtangl_session")?.value;

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...buildBffUpstreamAuthHeaders({ assertion, sessionKey }),
  };

  if (!upstreamHeaders["X-Qtangl-Session"] && !upstreamHeaders.Authorization && legacySession) {
    try {
      const session = JSON.parse(legacySession) as { apiKey?: string };
      if (session.apiKey) {
        upstreamHeaders.Authorization = `Bearer ${session.apiKey}`;
      }
    } catch {
      /* ignore */
    }
  }

  if (!upstreamHeaders["X-Qtangl-Session"] && !upstreamHeaders.Authorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.event?.trim()) {
    return NextResponse.json({ error: "event is required" }, { status: 400 });
  }

  const upstream = await fetch(`${qtanglApiBaseUrlServer()}/tenant/analytics/track`, {
    method: "POST",
    headers: upstreamHeaders,
    body: JSON.stringify({ event: body.event, properties: body.properties ?? {} }),
    cache: "no-store",
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    return new NextResponse(text || JSON.stringify({ error: "Track failed" }), {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
    });
  }
  return new NextResponse(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
