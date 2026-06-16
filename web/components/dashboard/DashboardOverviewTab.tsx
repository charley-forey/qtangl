"use client";

import dynamic from "next/dynamic";

import DashboardActionQueue from "@/components/dashboard/DashboardActionQueue";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import ComplianceFrameworkRail from "@/components/dashboard/ComplianceFrameworkRail";
import DashboardInsightsGrid from "@/components/dashboard/DashboardInsightsGrid";
import DashboardTrendSection from "@/components/dashboard/DashboardTrendSection";
import DashboardWidgetGate from "@/components/dashboard/DashboardWidgetGate";
import ExecutiveDigestCard from "@/components/dashboard/ExecutiveDigestCard";
import FirstRunChecklist from "@/components/dashboard/FirstRunChecklist";
import ForecastCard from "@/components/dashboard/ForecastCard";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSummary } from "@/lib/dashboard-state";
import { summaryTrendPoints } from "@/lib/dashboard-state";

const ExecutiveAiExplainCard = dynamic(() => import("@/components/dashboard/ExecutiveAiExplainCard"), {
  loading: () => null,
});

type Props = {
  summary: DashboardSummary;
  persona: DashboardPersona;
  signedIn: boolean;
  canAdmin: boolean;
  canWrite: boolean;
  tenantSettings: Record<string, unknown> | null;
  welcomeInvite?: boolean;
  onTabChange: (tab: DashboardTabId) => void;
  onSaveChecklist: (checklist: Record<string, boolean>) => Promise<void>;
  onOpenComplianceReport?: () => void;
  onAction: (action: string) => void;
};

export default function DashboardOverviewTab({
  summary,
  persona,
  signedIn,
  canAdmin,
  canWrite,
  tenantSettings,
  welcomeInvite,
  onTabChange,
  onSaveChecklist,
  onOpenComplianceReport,
  onAction,
}: Props) {
  const layout = summary.layoutDefaults;
  const detail = summary.latestScanDetail;
  const compliance =
    detail?.compliancePack || detail?.complianceSummary
      ? { pack: detail.compliancePack, summary: detail.complianceSummary }
      : null;

  return (
    <div className="space-y-4">
      <DashboardWidgetGate widgetId="checklist" layout={layout}>
        <FirstRunChecklist
          signedIn={signedIn}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          isAdmin={canAdmin}
          settings={tenantSettings as { firstRunChecklist?: Record<string, boolean> } | undefined}
          onSave={onSaveChecklist}
          highlightInvite={welcomeInvite}
          onRunBaseline={() => onTabChange("scans")}
          scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
        />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="trend" layout={layout}>
        <DashboardTrendSection points={summaryTrendPoints(summary)} />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="digest" layout={layout}>
        <ExecutiveDigestCard digest={summary.digest} />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="actions" layout={layout}>
        <DashboardActionQueue
          role={typeof summary.me.role === "string" ? summary.me.role : undefined}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          canWrite={canWrite}
          onAction={onAction}
        />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="compliance" layout={layout}>
        <ComplianceFrameworkRail
          scanId={detail?.scanId ?? null}
          compliance={compliance}
          onOpenReport={onOpenComplianceReport}
        />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="forecast" layout={layout}>
        <ForecastCard forecast={summary.forecast} />
      </DashboardWidgetGate>

      {persona === "executive" ? (
        <DashboardWidgetGate widgetId="ai-explain" layout={layout}>
          <ExecutiveAiExplainCard scanId={detail?.scanId ?? null} />
        </DashboardWidgetGate>
      ) : null}

      <DashboardWidgetGate widgetId="insights" layout={layout}>
        <DashboardInsightsGrid
          remediationVelocity={summary.remediationVelocity}
          sloMetrics={summary.sloMetrics}
          anomalyAlerts={[]}
          forecast={summary.forecast}
        />
      </DashboardWidgetGate>

      {summary.commandCenter && persona !== "executive" ? (
        <DashboardWidgetGate widgetId="heatmap" layout={layout}>
          <BusinessUnitHeatmap
            businessUnits={summary.commandCenter.businessUnits}
            deltas={summary.commandCenter.businessUnitDeltas}
            onSelectUnit={() => onTabChange("monitor")}
          />
        </DashboardWidgetGate>
      ) : null}
    </div>
  );
}
