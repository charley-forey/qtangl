import { proxyAdminApi } from "@/lib/ops-admin-proxy";

export const runtime = "nodejs";

export async function GET() {
  return proxyAdminApi("/admin/platform/summary");
}
