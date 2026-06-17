import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
  if (!assertion && !sessionKey) {
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

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (assertion) {
    upstreamHeaders["X-Qtangl-Session"] = assertion;
  } else if (sessionKey) {
    upstreamHeaders.Authorization = `Bearer ${sessionKey}`;
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
