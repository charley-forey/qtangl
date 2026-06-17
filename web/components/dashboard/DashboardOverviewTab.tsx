"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";

import DashboardActionQueue from "@/components/dashboard/DashboardActionQueue";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import ComplianceFrameworkRail from "@/components/dashboard/ComplianceFrameworkRail";
import DashboardInsightsGrid from "@/components/dashboard/DashboardInsightsGrid";
import DashboardTrendSection from "@/components/dashboard/DashboardTrendSection";
import DashboardWidgetGate from "@/components/dashboard/DashboardWidgetGate";
import ExecutiveDigestCard from "@/components/dashboard/ExecutiveDigestCard";
import FirstRunChecklist from "@/components/dashboard/FirstRunChecklist";
import OnboardingWizard from "@/components/dashboard/onboarding/OnboardingWizard";
import ForecastCard from "@/components/dashboard/ForecastCard";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSummary } from "@/lib/dashboard-state";
import { summaryTrendPoints } from "@/lib/dashboard-state";
import type { RolePolicy } from "@/lib/dashboard-role-policies";

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
  onMessage?: (message: string) => void;
  rolePolicy?: RolePolicy;
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
  onMessage,
  rolePolicy,
}: Props) {
  const { onboarding, capabilities } = useDashboardSession();
  const [wizardDismissed, setWizardDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWizardDismissed(window.localStorage.getItem("qtangl_onboarding_dismissed") === "true");
    }
  }, []);

  const layout = summary.layoutDefaults;
  const detail = summary.latestScanDetail;
  const compliance =
    detail?.compliancePack || detail?.complianceSummary
      ? { pack: detail.compliancePack, summary: detail.complianceSummary }
      : null;

  return (
    <div className="space-y-4">
      {!wizardDismissed && onboarding && !onboarding.complete && summary.recentScans.length === 0 ? (
        <OnboardingWizard
          tenantName={String(summary.me.tenantName ?? summary.me.tenantId ?? "")}
          tier={String((summary.me.entitlements as { tier?: string } | undefined)?.tier ?? "free")}
          canInvite={capabilities?.canInvite ?? false}
          onboarding={onboarding}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
          onDismiss={() => {
            window.localStorage.setItem("qtangl_onboarding_dismissed", "true");
            setWizardDismissed(true);
          }}
          onRenamed={() => undefined}
          onOpenScans={() => onTabChange("scans")}
          onOpenMonitor={() => onTabChange("monitor")}
          onOpenTeam={() => onTabChange("settings")}
          onMessage={onMessage}
        />
      ) : null}

      <DashboardWidgetGate widgetId="checklist" layout={layout} rolePolicy={rolePolicy}>
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

      <DashboardWidgetGate widgetId="trend" layout={layout} rolePolicy={rolePolicy}>
        <DashboardTrendSection points={summaryTrendPoints(summary)} />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="digest" layout={layout} rolePolicy={rolePolicy}>
        <ExecutiveDigestCard digest={summary.digest} />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="actions" layout={layout} rolePolicy={rolePolicy}>
        <DashboardActionQueue
          role={typeof summary.me.role === "string" ? summary.me.role : undefined}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          canWrite={canWrite}
          onAction={onAction}
        />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="compliance" layout={layout} rolePolicy={rolePolicy}>
        <ComplianceFrameworkRail
          scanId={detail?.scanId ?? null}
          compliance={compliance}
          onOpenReport={onOpenComplianceReport}
        />
      </DashboardWidgetGate>

      <DashboardWidgetGate widgetId="forecast" layout={layout} rolePolicy={rolePolicy}>
        <ForecastCard forecast={summary.forecast} />
      </DashboardWidgetGate>

      {persona === "executive" ? (
        <DashboardWidgetGate widgetId="ai-explain" layout={layout} rolePolicy={rolePolicy}>
          <ExecutiveAiExplainCard scanId={detail?.scanId ?? null} />
        </DashboardWidgetGate>
      ) : null}

      <DashboardWidgetGate widgetId="insights" layout={layout} rolePolicy={rolePolicy}>
        <DashboardInsightsGrid
          remediationVelocity={summary.remediationVelocity}
          sloMetrics={summary.sloMetrics}
          anomalyAlerts={[]}
          forecast={summary.forecast}
        />
      </DashboardWidgetGate>

      {summary.commandCenter && persona !== "executive" ? (
        <DashboardWidgetGate widgetId="heatmap" layout={layout} rolePolicy={rolePolicy}>
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
