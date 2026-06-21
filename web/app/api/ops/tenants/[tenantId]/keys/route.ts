import { NextRequest } from "next/server";

import { proxyAdminApi } from "@/lib/ops-admin-proxy";

export const runtime = "nodejs";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { tenantId } = await params;
  return proxyAdminApi(`/admin/tenants/${encodeURIComponent(tenantId)}/keys`);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { tenantId } = await params;
  const body = await request.text();
  return proxyAdminApi(`/admin/tenants/${encodeURIComponent(tenantId)}/keys`, { method: "POST", body });
}
