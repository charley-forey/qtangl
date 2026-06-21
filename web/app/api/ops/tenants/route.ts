import { NextRequest } from "next/server";

import { proxyAdminApi } from "@/lib/ops-admin-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return proxyAdminApi(`/admin/tenants${qs ? `?${qs}` : ""}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyAdminApi("/admin/tenants", { method: "POST", body });
}
