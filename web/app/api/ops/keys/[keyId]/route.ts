import { proxyAdminApi } from "@/lib/ops-admin-proxy";

export const runtime = "nodejs";

type Params = { params: Promise<{ keyId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { keyId } = await params;
  return proxyAdminApi(`/admin/keys/${encodeURIComponent(keyId)}`, { method: "DELETE" });
}
