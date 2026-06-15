import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { qtanglApiBaseUrlServer, SESSION_ASSERTION_COOKIE } from "@/lib/auth/workos";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const assertion = cookieStore.get(SESSION_ASSERTION_COOKIE)?.value;
  if (!assertion) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = `${qtanglApiBaseUrlServer()}/tenant/dashboard/events`;
  const upstream = await fetch(target, {
    headers: {
      Accept: "text/event-stream",
      "X-Qtangl-Session": assertion,
    },
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
