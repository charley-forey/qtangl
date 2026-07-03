import { redirect } from "next/navigation";

import { isQtanglOpsEmail } from "@/lib/ops-gate";
import { workosAuthEnabled } from "@/lib/auth/workos";

export async function resolveOpsEmail(): Promise<string | null> {
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

export async function requireOpsEmail(): Promise<string> {
  const email = await resolveOpsEmail();
  if (!isQtanglOpsEmail(email)) {
    redirect("/command-center/login");
  }
  return email!;
}

export function isQtanglOpsFromSessionEmail(email?: string | null): boolean {
  return isQtanglOpsEmail(email);
}
