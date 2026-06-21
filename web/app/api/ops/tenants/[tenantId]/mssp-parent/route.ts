import { NextRequest } from "next/server";

import { proxyAdminApi } from "@/lib/ops-admin-proxy";

export const runtime = "nodejs";

type Params = { params: Promise<{ tenantId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { tenantId } = await params;
  const body = await request.text();
  return proxyAdminApi(`/admin/tenants/${encodeURIComponent(tenantId)}/mssp-parent`, {
    method: "PUT",
    body,
  });
}
