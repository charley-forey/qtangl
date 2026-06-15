import { fetchDashboardBootstrap } from "@/lib/dashboard-data";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type { DashboardBootstrap } from "@/lib/dashboard-data";

export async function fetchDashboardBootstrapViaBff(): Promise<DashboardBootstrap> {
  const mePayload = await fetchDashboardJson<{
    tenantId: string;
    persistenceEnabled: boolean;
    role?: string;
    entitlements?: Record<string, unknown>;
  }>("/tenant/me");

  const scansPayload = await fetchDashboardJson<{ scans: DashboardBootstrap["scans"] }>(
    "/tenant/scans?limit=100"
  );

  let billingPortalUrl: string | null = null;
  try {
    const portal = await fetchDashboardJson<{ portalUrl?: string }>("/tenant/billing/portal");
    billingPortalUrl = typeof portal.portalUrl === "string" ? portal.portalUrl : null;
  } catch {
    billingPortalUrl = null;
  }

  let cbomAggregate: DashboardBootstrap["cbomAggregate"] = null;
  let cbomConflicts: DashboardBootstrap["cbomConflicts"] = [];
  let cbomDrift: DashboardBootstrap["cbomDrift"] = null;
  try {
    const aggPayload = await fetchDashboardJson<{ aggregate?: Record<string, unknown> }>(
      "/tenant/cbom/aggregate"
    );
    const aggregate = aggPayload.aggregate;
    cbomAggregate = {
      componentCount: Number(aggregate?.componentCount ?? 0),
      openConflicts: Number(aggregate?.openConflicts ?? 0),
      readiness: (aggregate?.readiness as Record<string, unknown> | null) ?? null,
    };
    const conflictPayload = await fetchDashboardJson<{ conflicts?: DashboardBootstrap["cbomConflicts"] }>(
      "/tenant/cbom/conflicts"
    );
    cbomConflicts = conflictPayload.conflicts ?? [];
    const driftPayload = await fetchDashboardJson<{ drift?: Record<string, unknown> }>("/tenant/cbom/diff");
    cbomDrift = driftPayload.drift ?? null;
  } catch {
    cbomAggregate = null;
    cbomConflicts = [];
    cbomDrift = null;
  }

  return {
    me: {
      tenantId: String(mePayload.tenantId ?? ""),
      persistenceEnabled: Boolean(mePayload.persistenceEnabled),
      role: typeof mePayload.role === "string" ? mePayload.role : undefined,
      entitlements: mePayload.entitlements,
    },
    scans: scansPayload.scans ?? [],
    billingPortalUrl,
    cbomAggregate,
    cbomConflicts,
    cbomDrift,
  };
}

export { fetchDashboardBootstrap };
