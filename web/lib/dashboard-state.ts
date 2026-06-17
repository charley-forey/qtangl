import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";
import type { WeeklyDigest } from "@/components/dashboard/ExecutiveDigestCard";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardBootstrap } from "@/lib/dashboard-data";
import type { ScheduledScan, TenantScanSummary } from "@/lib/tenant-api";
import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";
import type { CompliancePack, ComplianceSummary } from "@/lib/pqc";

export type DashboardKpis = {
  latestReadiness?: number | null;
  latestBand?: string | null;
  delta?: number | null;
  openCritical?: number;
  nextScheduleAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
};

export type LatestScanDetail = {
  scanId: string;
  readinessScore?: number | null;
  readinessBand?: string | null;
  scanDiff?: ScanDiff | null;
  complianceSummary?: ComplianceSummary;
  compliancePack?: CompliancePack;
  openCriticalItems?: Array<{ id?: string; title?: string; severity?: string }>;
};

export type DashboardRecommendation = {
  id: string;
  priority: number;
  category: string;
  what: string;
  soWhat: string;
  nowWhat: string;
  proof?: {
    type?: string;
    scanId?: string | null;
    deepLink?: string;
  };
  source: string;
  dismissible?: boolean;
};

export type MaturityStage = {
  stage: number;
  name: string;
  tier: string;
  nextStage?: number | null;
  nextStageName?: string | null;
  nextStageTier?: string | null;
  progressPct?: number;
};

export type DashboardSummary = {
  me: Record<string, unknown>;
  kpis: DashboardKpis;
  trend: Array<{ date: string; score: number; scanId: string; band?: string }>;
  digest: WeeklyDigest | null;
  commandCenter: {
    businessUnits: Record<string, number>;
    businessUnitDeltas?: Record<string, number | null>;
    highRiskTargets?: Array<{ target: string; readinessScore: number }>;
    recommendedActions?: string[];
  } | null;
  alerts: DashboardAlert[];
  recommendations?: DashboardRecommendation[];
  maturity?: MaturityStage | null;
  recentScans: TenantScanSummary[];
  schedulesSummary: { active: number; nextRunAt?: string | null };
  health: {
    schedulerEnabled?: boolean;
    persistenceEnabled?: boolean;
    lastScanAt?: string | null;
    score?: number;
    band?: "green" | "yellow" | "red";
    signals?: Record<string, { score: number; status: string }>;
  };
  firstScanAt?: string | null;
  latestScanDetail: LatestScanDetail | null;
  forecast: { projected?: number; current?: number; slope?: number } | null;
  remediationVelocity: {
    closedCount: number;
    openCount: number;
    completionRatePct: number | null;
  } | null;
  sloMetrics: {
    scanSuccessRatePct: number;
    reportAvailabilityPct: number;
    sampleSize: number;
    targetSloPct: number;
  } | null;
  integrationsSummary: {
    jiraConfigured?: boolean;
    webhookConfigured?: boolean;
    providers?: Array<{ provider: string; configured: boolean }>;
  } | null;
  layoutDefaults: {
    persona?: DashboardPersona;
    pinned?: string[];
    hidden?: string[];
    tier?: string;
  };
  membershipHealth?: Array<{
    tenantId: string;
    tenantName?: string;
    latestReadinessScore?: number | null;
    latestReadinessBand?: string | null;
  }>;
  portfolioSummary?: { childrenCount?: number };
  coaching?: {
    phase?: string;
    milestones?: Record<string, string>;
    bannersDismissed?: string[];
  };
};

export type ScansTabBundle = {
  scans: TenantScanSummary[];
  latestScanDetail: LatestScanDetail | null;
};

export type MonitorTabBundle = {
  schedules: ScheduledScan[];
  schedulesSummary: { active: number; nextRunAt?: string | null };
  integrationsSummary: DashboardSummary["integrationsSummary"];
  cbomAggregate: DashboardBootstrap["cbomAggregate"];
  commandCenter: DashboardSummary["commandCenter"];
};

export type RemediateTabBundle = {
  remediationScan: {
    scanId: string;
    items: Array<{ id: string; title: string; severity: string }>;
    statuses: Array<{ remediationId: string; status: string; owner?: string | null }>;
  } | null;
  remediationVelocity: DashboardSummary["remediationVelocity"];
  sloMetrics: DashboardSummary["sloMetrics"];
};

export type SettingsTabBundle = {
  settings: Record<string, unknown>;
  layoutDefaults: DashboardSummary["layoutDefaults"];
  billingPortalConfigured?: boolean;
};

export type PortfolioTabBundle = {
  children: Array<Record<string, unknown>>;
  rollup: Record<string, unknown> | null;
  aggregateReadiness: number;
  customersBelowThreshold: number;
  atRiskCount: number;
  totalOpenAlerts?: number;
};

export type DashboardTabBundle =
  | ScansTabBundle
  | MonitorTabBundle
  | RemediateTabBundle
  | SettingsTabBundle
  | PortfolioTabBundle;

export type ScanProgressState = {
  scanId: string;
  status: string;
  progressPct: number;
  targetDomain?: string;
  readinessScore?: number | null;
  readinessBand?: string | null;
};

export function patchSummaryScan(
  summary: DashboardSummary,
  event: {
    scanId: string;
    status: string;
    readinessScore?: number | null;
    readinessBand?: string | null;
    targetDomain?: string;
    updatedAt?: string;
  }
): DashboardSummary {
  const scans = [...summary.recentScans];
  const idx = scans.findIndex((s) => s.scanId === event.scanId);
  const row: TenantScanSummary = {
    scanId: event.scanId,
    status: event.status as TenantScanSummary["status"],
    readinessScore: event.readinessScore ?? scans[idx]?.readinessScore,
    readinessBand: event.readinessBand ?? scans[idx]?.readinessBand,
    targetDomain: event.targetDomain ?? scans[idx]?.targetDomain,
    createdAt: scans[idx]?.createdAt ?? event.updatedAt ?? new Date().toISOString(),
    updatedAt: event.updatedAt ?? scans[idx]?.updatedAt,
    scenarioId: scans[idx]?.scenarioId,
    error: scans[idx]?.error,
  };
  if (idx >= 0) {
    scans[idx] = { ...scans[idx], ...row };
  } else {
    scans.unshift(row);
  }
  const nextKpis = { ...summary.kpis };
  if (event.status === "done" && event.readinessScore != null) {
    nextKpis.latestReadiness = event.readinessScore;
    nextKpis.latestBand = event.readinessBand ?? nextKpis.latestBand;
  }
  return { ...summary, recentScans: scans, kpis: nextKpis };
}

export function summaryTrendPoints(summary: DashboardSummary) {
  if (summary.trend.length > 0) {
    return summary.trend.map((p) => ({
      scanId: p.scanId,
      createdAt: p.date,
      readinessScore: p.score,
      readinessBand: p.band,
    }));
  }
  return summary.recentScans
    .filter((scan) => scan.readinessScore != null)
    .map((scan) => ({
      scanId: scan.scanId,
      createdAt: scan.createdAt,
      readinessScore: scan.readinessScore ?? 0,
      readinessBand: scan.readinessBand ?? undefined,
    }));
}

export function defaultTabForPersona(persona: DashboardPersona): DashboardTabId {
  return persona === "executive" ? "overview" : "scans";
}

export function isWidgetHidden(layout: DashboardSummary["layoutDefaults"], widgetId: string) {
  return (layout.hidden ?? []).includes(widgetId);
}

export function isWidgetPinned(layout: DashboardSummary["layoutDefaults"], widgetId: string) {
  return (layout.pinned ?? []).includes(widgetId);
}
