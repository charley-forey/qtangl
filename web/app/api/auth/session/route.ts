import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("qtangl_session")?.value;
  if (!raw) {
    return NextResponse.json({ authenticated: false });
  }
  try {
    const session = JSON.parse(raw) as {
      email: string;
      tenantId: string;
      role: string;
    };
    return NextResponse.json({ authenticated: true, session });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("qtangl_session");
  return NextResponse.json({ ok: true });
}
