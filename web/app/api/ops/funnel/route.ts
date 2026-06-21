import { NextRequest } from "next/server";

import { proxyAdminApi } from "@/lib/ops-admin-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const days = url.searchParams.get("days") ?? "30";
  return proxyAdminApi(`/admin/analytics/funnel?days=${encodeURIComponent(days)}`);
}
