"use client";

import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";
import type { DashboardSession } from "@/lib/dashboard-bff";
import type { DashboardSummary, ScanProgressState } from "@/lib/dashboard-state";
import DashboardWorkspaceHeader from "@/components/dashboard/DashboardWorkspaceHeader";
import DashboardRoleBadge from "@/components/dashboard/DashboardRoleBadge";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import ReadinessCopilotDrawer from "@/components/dashboard/ReadinessCopilotDrawer";
import NpsMicroSurvey from "@/components/dashboard/NpsMicroSurvey";
import DashboardCommandPalette from "@/components/dashboard/DashboardCommandPalette";
import SystemHealthBar from "@/components/dashboard/SystemHealthBar";
import DashboardKpiStrip from "@/components/dashboard/DashboardKpiStrip";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import EvidenceToolbar from "@/components/dashboard/EvidenceToolbar";
import type { DashboardCommandAction } from "@/hooks/useDashboardCommandActions";
import type { RolePolicy } from "@/lib/dashboard-role-policies";

type Props = {
  summary: DashboardSummary;
  dashboardSession: DashboardSession | null;
  persona: DashboardPersona;
  activeTab: DashboardTabId;
  density: "comfortable" | "compact";
  alerts: DashboardAlert[];
  commandActions: DashboardCommandAction[];
  scanProgress: ScanProgressState | null;
  sessionWarning?: string | null;
  reportUrlForScan: (scanId: string, format?: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor") => string;
  rolePolicy?: RolePolicy;
  sessionRole?: string;
  onTabChange: (tab: DashboardTabId) => void;
  onDensityToggle: () => void;
  onSessionChange: (session: DashboardSession) => void;
  onMarkAlertsRead: (ids: string[]) => void;
  onRefreshAlerts?: () => void;
  tenantSettings?: Record<string, unknown> | null;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  children: React.ReactNode;
};

export default function DashboardShell({
  summary,
  dashboardSession,
  persona,
  activeTab,
  density,
  alerts,
  commandActions,
  scanProgress,
  sessionWarning,
  reportUrlForScan,
  onTabChange,
  onDensityToggle,
  onSessionChange,
  onMarkAlertsRead,
  onRefreshAlerts,
  tenantSettings,
  onSettingsChange,
  children,
  rolePolicy,
  sessionRole,
}: Props) {
  const me = summary.me;
  const latestScan = summary.recentScans.find((s) => s.readinessScore != null);
  const childrenCount = summary.portfolioSummary?.childrenCount ?? 0;
  const showPortfolio = childrenCount > 0 || (dashboardSession?.memberships?.length ?? 0) > 1;

  return (
    <div className={density === "compact" ? "space-y-4" : "space-y-8"}>
      {sessionWarning ? (
        <div className="rounded-[var(--radius-xl)] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {sessionWarning}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardWorkspaceHeader
          tier={(me.entitlements as { tier?: string } | undefined)?.tier}
          membershipHealth={summary.membershipHealth}
          onSessionChange={onSessionChange}
        />
        <div className="flex flex-wrap items-center gap-2">
          <DashboardRoleBadge role={sessionRole ?? dashboardSession?.role} />
          <ReadinessCopilotDrawer persona={persona === "executive" ? "executive" : "operator"} />
          <NotificationCenter
            alerts={alerts}
            onMarkRead={onMarkAlertsRead}
            onNavigateTab={onTabChange}
            onRefresh={onRefreshAlerts}
          />
          <DashboardCommandPalette actions={commandActions} />
          <button
            type="button"
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--color-gray-400)]"
            onClick={onDensityToggle}
          >
            {density === "compact" ? "Comfortable" : "Compact"}
          </button>
        </div>
      </div>

      <SystemHealthBar
        schedulerEnabled={Boolean(me.schedulerEnabled ?? summary.health.schedulerEnabled)}
        lastScanAt={summary.health.lastScanAt ?? null}
        scansThisMonth={summary.kpis.scansThisMonth ?? (me.scansThisMonth as number | undefined)}
        quotaLimit={summary.kpis.quotaLimit ?? (me.entitlements as { maxScansPerMonth?: number })?.maxScansPerMonth ?? null}
        apiOk
        scanProgress={scanProgress}
      />

      <DashboardKpiStrip
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
