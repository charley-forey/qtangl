import { NextResponse } from "next/server";

import { resolveOpsEmail } from "@/lib/ops-auth";
import { isQtanglOpsEmail } from "@/lib/ops-gate";
import { qtanglApiBaseUrlServer } from "@/lib/auth/workos";

export async function requireOpsApiAccess(): Promise<{ email: string } | NextResponse> {
  const email = await resolveOpsEmail();
  if (!isQtanglOpsEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const adminKey = process.env.QTANGL_ADMIN_API_KEY?.trim();
  if (!adminKey) {
    return NextResponse.json({ error: "Admin API not configured on web" }, { status: 503 });
  }
  return { email: email! };
}

export async function proxyAdminApi(
  path: string,
  init?: RequestInit & { actorEmail?: string }
): Promise<NextResponse> {
  const access = await requireOpsApiAccess();
  if (access instanceof NextResponse) {
    return access;
  }

  const actorEmail = init?.actorEmail ?? access.email;
  const adminKey = process.env.QTANGL_ADMIN_API_KEY!.trim();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${adminKey}`);
  headers.set("Accept", "application/json");
  headers.set("X-Qtangl-Ops-Actor", actorEmail);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const upstream = await fetch(`${qtanglApiBaseUrlServer()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
