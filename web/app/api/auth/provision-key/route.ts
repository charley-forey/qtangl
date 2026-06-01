import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Map SSO session tenant to a pre-provisioned API key (server-side only).
 * Set AUTH_OIDC_TENANT_API_KEYS='{"tenant-acme":"qtangl_..."}' in deploy env.
 */
export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("qtangl_session")?.value;
  if (!raw) {
    return NextResponse.json({ apiKey: null }, { status: 401 });
  }
  try {
    const session = JSON.parse(raw) as { tenantId: string };
    const mapRaw = process.env.AUTH_OIDC_TENANT_API_KEYS;
    if (!mapRaw) {
      return NextResponse.json({ apiKey: null, reason: "not_configured" });
    }
    const map = JSON.parse(mapRaw) as Record<string, string>;
    const apiKey = map[session.tenantId];
    if (!apiKey) {
      return NextResponse.json({ apiKey: null, reason: "tenant_not_mapped" });
    }
    return NextResponse.json({ apiKey });
  } catch {
    return NextResponse.json({ apiKey: null }, { status: 400 });
  }
}
