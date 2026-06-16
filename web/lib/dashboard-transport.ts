import type { DashboardBootstrap } from "@/lib/dashboard-data";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";
import type { WeeklyDigest } from "@/components/dashboard/ExecutiveDigestCard";
import type {
  DashboardSummary,
  DashboardTabBundle,
  LatestScanDetail,
  MonitorTabBundle,
  PortfolioTabBundle,
  RemediateTabBundle,
  ScansTabBundle,
  SettingsTabBundle,
} from "@/lib/dashboard-state";

export type { DashboardSummary } from "@/lib/dashboard-state";

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
    latestScanDetail: LatestScanDetail | null;
    forecast: DashboardSummary["forecast"];
    remediationVelocity: DashboardSummary["remediationVelocity"];
    sloMetrics: DashboardSummary["sloMetrics"];
    integrationsSummary: DashboardSummary["integrationsSummary"];
    layoutDefaults: DashboardSummary["layoutDefaults"];
    membershipHealth: DashboardSummary["membershipHealth"];
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
    latestScanDetail: payload.latestScanDetail ?? null,
    forecast: payload.forecast ?? null,
    remediationVelocity: payload.remediationVelocity ?? null,
    sloMetrics: payload.sloMetrics ?? null,
    integrationsSummary: payload.integrationsSummary ?? null,
    layoutDefaults: payload.layoutDefaults ?? { persona: "operator", pinned: [], hidden: [] },
    membershipHealth: payload.membershipHealth ?? [],
  };
}

export async function fetchTabBundle(tab: string): Promise<DashboardTabBundle> {
  const payload = await fetchDashboardJson<{ data: DashboardTabBundle }>(`/tenant/dashboard/tab/${tab}`);
  const data = payload.data;
  if (tab === "monitor") {
    const monitor = data as MonitorTabBundle;
    let cbomAggregate = monitor.cbomAggregate ?? null;
    if (!cbomAggregate) {
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
      } catch {
        cbomAggregate = null;
      }
    }
    return { ...monitor, cbomAggregate };
  }
  return data;
}

export async function fetchPortfolioSummary(): Promise<PortfolioTabBundle> {
  const payload = await fetchDashboardJson<PortfolioTabBundle>("/tenant/partner/portfolio-summary");
  return payload;
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
    cbomAggregate: null,
    cbomConflicts: [],
    cbomDrift: null,
  };
}

export { fetchDashboardBootstrap } from "@/lib/dashboard-data";
