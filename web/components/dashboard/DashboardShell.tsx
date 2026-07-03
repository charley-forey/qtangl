"use client";

import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSession } from "@/lib/dashboard-bff";
import type { DashboardSummary, ScanProgressState } from "@/lib/dashboard-state";
import NpsMicroSurvey from "@/components/dashboard/NpsMicroSurvey";
import SystemHealthBar from "@/components/dashboard/SystemHealthBar";
import DashboardKpiStrip from "@/components/dashboard/DashboardKpiStrip";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import EvidenceToolbar from "@/components/dashboard/EvidenceToolbar";
import type { RolePolicy } from "@/lib/dashboard-role-policies";

type Props = {
  summary: DashboardSummary;
  dashboardSession: DashboardSession | null;
  persona: DashboardPersona;
  activeTab: DashboardTabId;
  density: "comfortable" | "compact";
  scanProgress: ScanProgressState | null;
  sessionWarning?: string | null;
  reportUrlForScan: (scanId: string, format?: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor") => string;
  rolePolicy?: RolePolicy;
  sessionRole?: string;
  onTabChange: (tab: DashboardTabId) => void;
  tenantSettings?: Record<string, unknown> | null;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  eventsConnected?: boolean;
  eventsDegraded?: boolean;
  children: React.ReactNode;
};

export default function DashboardShell({
  summary,
  dashboardSession,
  persona,
  activeTab,
  density,
  scanProgress,
  sessionWarning,
  reportUrlForScan,
  onTabChange,
  tenantSettings,
  onSettingsChange,
  eventsConnected,
  eventsDegraded,
  children,
  rolePolicy,
  sessionRole,
}: Props) {
  const me = summary.me;
  const latestScan = summary.recentScans.find((s) => s.readinessScore != null);
  const childrenCount = summary.portfolioSummary?.childrenCount ?? 0;
  const roleKey = (sessionRole ?? dashboardSession?.role ?? "").toLowerCase();
  const isCustomerRole = roleKey === "customer_executive" || roleKey === "customer_viewer";
  const portfolioAllowed = !isCustomerRole && (rolePolicy?.tabs.includes("*") || rolePolicy?.tabs.includes("portfolio"));
  const showPortfolio =
    portfolioAllowed && (childrenCount > 0 || (dashboardSession?.memberships?.length ?? 0) > 1);

  return (
    <div className={`motion-reduce:transition-none ${density === "compact" ? "space-y-4" : "space-y-8"}`}>
      {sessionWarning ? (
        <div className="rounded-[var(--radius-xl)] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {sessionWarning}
        </div>
      ) : null}

      <SystemHealthBar
        schedulerEnabled={Boolean(me.schedulerEnabled ?? summary.health.schedulerEnabled)}
        lastScanAt={summary.health.lastScanAt ?? null}
        scansThisMonth={summary.kpis.scansThisMonth ?? (me.scansThisMonth as number | undefined)}
        quotaLimit={summary.kpis.quotaLimit ?? (me.entitlements as { maxScansPerMonth?: number })?.maxScansPerMonth ?? null}
        apiOk
        scanProgress={scanProgress}
        eventsConnected={eventsConnected}
        eventsDegraded={eventsDegraded}
      />

      <DashboardKpiStrip
        activeTab={activeTab}
        kpis={{
          latestReadiness: summary.kpis.latestReadiness ?? (me.latestReadinessScore as number | null | undefined),
          latestBand: summary.kpis.latestBand ?? latestScan?.readinessBand,
          delta: summary.kpis.delta,
          openCritical: summary.kpis.openCritical ?? (me.openCriticalCount as number | undefined),
          nextScheduleAt: summary.kpis.nextScheduleAt ?? summary.schedulesSummary.nextRunAt ?? null,
          scansThisMonth: summary.kpis.scansThisMonth ?? (me.scansThisMonth as number | undefined),
          quotaLimit: summary.kpis.quotaLimit ?? (me.entitlements as { maxScansPerMonth?: number })?.maxScansPerMonth ?? null,
        }}
      />

      <DashboardTabs
        active={activeTab}
        onChange={onTabChange}
        showPortfolio={showPortfolio}
        persona={persona}
        rolePolicy={rolePolicy}
      />

      <div role="tabpanel" aria-live="polite" aria-label={`${activeTab} tab`}>
        {children}
      </div>

      <EvidenceToolbar scanId={latestScan?.scanId ?? null} reportUrlForScan={reportUrlForScan} />

      <NpsMicroSurvey
        firstScanAt={summary.firstScanAt}
        tenantSettings={tenantSettings}
        onDismissed={() => {
          if (tenantSettings && onSettingsChange) {
            onSettingsChange(tenantSettings);
          }
        }}
      />
    </div>
  );
}
