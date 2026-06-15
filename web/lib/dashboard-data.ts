import { createQtanglClient } from "@/lib/qtangl-client";
import type { MergeConflict } from "@/components/pqc/MergeConflictPanel";
import type { TenantScanSummary } from "@/lib/tenant-api";

export type DashboardMe = {
  tenantId: string;
  persistenceEnabled: boolean;
  role?: string;
  entitlements?: Record<string, unknown>;
};

export type CbomAggregateSummary = {
  componentCount: number;
  openConflicts: number;
  readiness: Record<string, unknown> | null;
};

export type DashboardBootstrap = {
  me: DashboardMe;
  scans: TenantScanSummary[];
  billingPortalUrl: string | null;
  cbomAggregate: CbomAggregateSummary | null;
  cbomConflicts: MergeConflict[];
  cbomDrift: Record<string, unknown> | null;
};

export async function fetchDashboardBootstrap(apiKey: string): Promise<DashboardBootstrap> {
  const client = createQtanglClient(apiKey);

  const mePayload = await client.me();
  const scansPayload = await client.listScans(100);

  let billingPortalUrl: string | null = null;
  try {
    const portal = await client.billingPortal();
    billingPortalUrl = typeof portal.portalUrl === "string" ? portal.portalUrl : null;
  } catch {
    billingPortalUrl = null;
  }

  let cbomAggregate: CbomAggregateSummary | null = null;
  let cbomConflicts: MergeConflict[] = [];
  let cbomDrift: Record<string, unknown> | null = null;
  try {
    const aggPayload = await client.cbom.aggregate();
    const aggregate = aggPayload.aggregate as Record<string, unknown> | undefined;
    cbomAggregate = {
      componentCount: Number(aggregate?.componentCount ?? 0),
      openConflicts: Number(aggregate?.openConflicts ?? 0),
      readiness: (aggregate?.readiness as Record<string, unknown> | null) ?? null,
    };
    const conflictPayload = await client.cbom.conflicts();
    cbomConflicts = (conflictPayload.conflicts as MergeConflict[] | undefined) ?? [];
    const driftPayload = await client.cbom.diff();
    cbomDrift = (driftPayload.drift as Record<string, unknown> | undefined) ?? null;
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
      entitlements: mePayload.entitlements as Record<string, unknown> | undefined,
    },
    scans: (scansPayload.scans as TenantScanSummary[] | undefined) ?? [],
    billingPortalUrl,
    cbomAggregate,
    cbomConflicts,
    cbomDrift,
  };
}
