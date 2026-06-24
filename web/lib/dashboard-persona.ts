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
  if (normalized === "admin" || normalized === "partner_admin") return "admin";
  if (normalized === "operator" || normalized === "partner_analyst") return "operator";
  if (normalized === "customer_executive" || normalized === "customer_viewer") return "executive";
  return "executive";
}

export function roleLabel(role: string | undefined | null): string {
  const normalized = normalizeDashboardRole(role);
  if (normalized === "admin" || normalized === "partner_admin") return normalized === "partner_admin" ? "Partner admin" : "Admin";
  if (normalized === "operator" || normalized === "partner_analyst") return normalized === "partner_analyst" ? "Partner analyst" : "Operator";
  if (normalized === "customer_executive") return "Customer executive";
  if (normalized === "customer_viewer") return "Customer viewer";
  return "Executive";
}
