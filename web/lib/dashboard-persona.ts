import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";

/** Normalize legacy viewer role to executive. */
export function normalizeDashboardRole(role: string | undefined | null): string {
  const key = (role ?? "executive").toLowerCase();
  if (key === "viewer") return "executive";
  return key;
}

/** Derive dashboard layout persona from assigned membership role. */
export function roleToPersona(role: string | undefined | null): DashboardPersona {
  const normalized = normalizeDashboardRole(role);
  if (normalized === "admin") return "admin";
  if (normalized === "operator") return "operator";
  return "executive";
}

export function roleLabel(role: string | undefined | null): string {
  const normalized = normalizeDashboardRole(role);
  if (normalized === "admin") return "Admin";
  if (normalized === "operator") return "Operator";
  return "Executive";
}
