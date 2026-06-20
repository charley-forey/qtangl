import { NextResponse } from "next/server";

import { isQtanglOpsEmail } from "@/lib/ops-gate";
import { qtanglApiBaseUrlServer, workosAuthEnabled } from "@/lib/auth/workos";

export const runtime = "nodejs";

async function resolveOpsEmail(): Promise<string | null> {
  if (!workosAuthEnabled()) {
    return null;
  }
  try {
    const { withAuth } = await import("@workos-inc/authkit-nextjs");
    const { user } = await withAuth();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const email = await resolveOpsEmail();
  if (!isQtanglOpsEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminKey = process.env.QTANGL_ADMIN_API_KEY?.trim();
  if (!adminKey) {
    return NextResponse.json({ error: "Admin API not configured on web" }, { status: 503 });
  }

  const url = new URL(request.url);
  const days = url.searchParams.get("days") ?? "30";
  const upstream = await fetch(`${qtanglApiBaseUrlServer()}/admin/analytics/funnel?days=${days}`, {
    headers: { Authorization: `Bearer ${adminKey}`, Accept: "application/json" },
    cache: "no-store",
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
