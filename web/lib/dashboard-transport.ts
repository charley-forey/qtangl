import type { DashboardBootstrap } from "@/lib/dashboard-data";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";
import type { WeeklyDigest } from "@/components/dashboard/ExecutiveDigestCard";

export type DashboardSummary = {
  me: Record<string, unknown>;
  kpis: {
    latestReadiness?: number | null;
    latestBand?: string | null;
    delta?: number | null;
    openCritical?: number;
    nextScheduleAt?: string | null;
    scansThisMonth?: number;
    quotaLimit?: number | null;
  };
  trend: Array<{ date: string; score: number; scanId: string; band?: string }>;
  digest: WeeklyDigest | null;
  commandCenter: {
    businessUnits: Record<string, number>;
    businessUnitDeltas?: Record<string, number | null>;
    highRiskTargets?: Array<{ target: string; readinessScore: number }>;
  } | null;
  alerts: DashboardAlert[];
  recentScans: DashboardBootstrap["scans"];
  schedulesSummary: { active: number; nextRunAt?: string | null };
  health: {
    schedulerEnabled?: boolean;
    persistenceEnabled?: boolean;
    lastScanAt?: string | null;
  };
};

export async function fetchDashboardSummaryViaBff(): Promise<DashboardSummary> {
  const payload = await fetchDashboardJson<{
    me: Record<string, unknown>;
    kpis: DashboardSummary["kpis"];
    trend: DashboardSummary["trend"];
    digest: WeeklyDigest | null;
    commandCenter: DashboardSummary["commandCenter"];
    alerts: DashboardAlert[];
    recentScans: DashboardBootstrap["scans"];
    schedulesSummary: DashboardSummary["schedulesSummary"];
    health: DashboardSummary["health"];
  }>("/tenant/dashboard/summary");

  return {
    me: payload.me ?? {},
    kpis: payload.kpis ?? {},
    trend: payload.trend ?? [],
    digest: payload.digest ?? null,
    commandCenter: payload.commandCenter ?? null,
    alerts: payload.alerts ?? [],
    recentScans: payload.recentScans ?? [],
    schedulesSummary: payload.schedulesSummary ?? { active: 0 },
    health: payload.health ?? {},
  };
}

export async function fetchDashboardBootstrapViaBff(): Promise<DashboardBootstrap> {
  const summary = await fetchDashboardSummaryViaBff();
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
      tenantId: String(summary.me.tenantId ?? ""),
      persistenceEnabled: Boolean(summary.me.persistenceEnabled),
      role: typeof summary.me.role === "string" ? summary.me.role : undefined,
      entitlements: summary.me.entitlements as Record<string, unknown> | undefined,
      scanCount: summary.me.scanCount as number | undefined,
      scansThisMonth: summary.me.scansThisMonth as number | undefined,
      latestReadinessScore: summary.me.latestReadinessScore as number | undefined,
      scheduleCount: summary.me.scheduleCount as number | undefined,
      openCriticalCount: summary.me.openCriticalCount as number | undefined,
    },
    scans: summary.recentScans,
    billingPortalUrl,
    cbomAggregate,
    cbomConflicts,
    cbomDrift,
  };
}

export { fetchDashboardBootstrap } from "@/lib/dashboard-data";
