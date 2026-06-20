"use client";

import dynamic from "next/dynamic";

import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";

import DashboardActionQueue from "@/components/dashboard/DashboardActionQueue";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import ComplianceFrameworkRail from "@/components/dashboard/ComplianceFrameworkRail";
import DashboardInsightsGrid from "@/components/dashboard/DashboardInsightsGrid";
import DashboardTrendSection from "@/components/dashboard/DashboardTrendSection";
import DashboardWidgetGate from "@/components/dashboard/DashboardWidgetGate";
import ExecutiveDigestCard from "@/components/dashboard/ExecutiveDigestCard";
import FirstRunChecklist from "@/components/dashboard/FirstRunChecklist";
import CoachingBanner from "@/components/dashboard/CoachingBanner";
import PeerBenchmarkSummary from "@/components/dashboard/PeerBenchmarkSummary";
import { BoardMeetingMode } from "@/components/dashboard/FrameworkDeadlineRoadmap";
import EvidenceFreshnessCard from "@/components/dashboard/EvidenceFreshnessCard";
import RoiCalculatorCard from "@/components/dashboard/RoiCalculatorCard";
import ExecutivePriorities from "@/components/pqc/ExecutivePriorities";
import OnboardingWizard from "@/components/dashboard/onboarding/OnboardingWizard";
import AlgorithmBreakdown from "@/components/dashboard/charts/AlgorithmBreakdown";
import SeverityDonut from "@/components/dashboard/charts/SeverityDonut";
import ForecastCard from "@/components/dashboard/ForecastCard";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSummary } from "@/lib/dashboard-state";
import { summaryTrendPoints } from "@/lib/dashboard-state";
import DogfoodPostureCard from "@/components/dashboard/DogfoodPostureCard";
import MaturityStageCard from "@/components/dashboard/MaturityStageCard";
import { patchDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";
import { isQtanglHqTenant } from "@/lib/dogfood";
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
  onOpenUpgrade?: (product: "assess" | "monitor") => void;
  checkoutSuccess?: string | null;
  reportUrlForScan?: (scanId: string, format?: "board") => string;
  rolePolicy?: RolePolicy;
  bffMode?: boolean;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
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
  onOpenUpgrade,
  checkoutSuccess,
  reportUrlForScan,
  rolePolicy,
  bffMode = true,
  onSettingsChange,
}: Props) {
  const { onboarding, capabilities, session } = useDashboardSession();
  const showDogfoodMirror = isQtanglHqTenant(tenantSettings, session?.email);
  const onboardingRecord =
    (tenantSettings?.onboarding as { complete?: boolean; dismissed?: boolean } | undefined) ??
    (onboarding as { complete?: boolean; dismissed?: boolean } | null | undefined);
  const showWizard = Boolean(onboardingRecord && !onboardingRecord.complete && !onboardingRecord.dismissed);

  const layout = summary.layoutDefaults;
  const detail = summary.latestScanDetail;
  const compliance =
    detail?.compliancePack || detail?.complianceSummary
      ? { pack: detail.compliancePack, summary: detail.complianceSummary }
      : null;
  const backlog = detail?.openCriticalItems ?? [];
  const severityCounts = ["critical", "high", "medium", "low"].map((label) => ({
    label,
    value: backlog.filter((item) => String(item.severity ?? "").toLowerCase() === label).length,
    color:
      label === "critical"
        ? "#f87171"
        : label === "high"
          ? "#fb923c"
          : label === "medium"
            ? "#facc15"
            : "#94a3b8",
  }));
  const algorithmMap = new Map<string, number>();
  for (const item of backlog) {
    const key = String(item.title ?? item.severity ?? "unknown").split(" ")[0] ?? "unknown";
    algorithmMap.set(key, (algorithmMap.get(key) ?? 0) + 1);
  }
  const algorithmRows = [...algorithmMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const toursCompleted =
    ((tenantSettings?.onboarding as { toursCompleted?: string[] } | undefined)?.toursCompleted ??
      (onboarding as { toursCompleted?: string[] } | undefined)?.toursCompleted) ??
    [];

  async function dismissWizard() {
    await patchDashboardJson("/tenant/onboarding", { dismissed: true });
    onSettingsChange?.({
      ...(tenantSettings ?? {}),
      onboarding: {
        ...((tenantSettings?.onboarding as Record<string, unknown>) ?? {}),
        dismissed: true,
      },
    });
  }

  async function dismissBanner(bannerId: string) {
    const coaching = (tenantSettings?.coaching as Record<string, unknown>) ?? {};
    const dismissed = [...((coaching.bannersDismissed as string[]) ?? []), bannerId];
    await putDashboardJson("/tenant/settings", {
      settings: { ...tenantSettings, coaching: { ...coaching, bannersDismissed: dismissed } },
    });
  }

  return (
    <div className="space-y-4">
      <CoachingBanner
        summary={summary}
        tenantSettings={tenantSettings}
        checkoutSuccess={checkoutSuccess}
        onTabChange={(tab) => onTabChange(tab as DashboardTabId)}
        onOpenUpgrade={onOpenUpgrade}
        onDismiss={dismissBanner}
      />
      {welcomeInvite ? (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          Welcome — you have joined this workspace. Explore the overview, then open Scans to review the latest
          assessment.
        </div>
      ) : null}
      {showWizard ? (
        <OnboardingWizard
          tenantName={String(summary.me.tenantName ?? summary.me.tenantId ?? "")}
          tier={String((summary.me.entitlements as { tier?: string } | undefined)?.tier ?? "free")}
          canInvite={capabilities?.canInvite ?? false}
          onboarding={onboarding}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
          industry={String(tenantSettings?.industry ?? "financial")}
          onDismiss={() => void dismissWizard()}
          onComplete={() => void dismissWizard()}
          onRenamed={() => undefined}
          onOpenScans={() => onTabChange("scans")}
          onOpenMonitor={() => onTabChange("monitor")}
          onOpenTeam={() => onTabChange("settings")}
          onOpenUpgrade={onOpenUpgrade}
          onMessage={onMessage}
        />
      ) : null}

      {detail?.scanId ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <SeverityDonut
            slices={severityCounts}
            insight={
              severityCounts.find((s) => s.label === "critical")?.value
                ? "Critical findings should be prioritized for Q-Day migration planning."
                : undefined
            }
          />
          <AlgorithmBreakdown rows={algorithmRows} />
        </div>
      ) : null}

      <DashboardWidgetGate widgetId="checklist" layout={layout} rolePolicy={rolePolicy}>
        <FirstRunChecklist
          signedIn={signedIn}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          isAdmin={canAdmin}
          settings={tenantSettings as { firstRunChecklist?: Record<string, boolean> } | undefined}
          milestones={summary.coaching?.milestones}
          coachingPhase={summary.coaching?.phase}
          webhookConfigured={Boolean(summary.integrationsSummary?.webhookConfigured)}
          digestEnabled={Boolean(tenantSettings?.weeklyDigestEnabled)}
          toursCompleted={toursCompleted}
          onSave={onSaveChecklist}
          highlightInvite={welcomeInvite}
          onRunBaseline={() => onTabChange("scans")}
          onOpenSettings={() => onTabChange("settings")}
          scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
          isHq={showDogfoodMirror}
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
          recommendations={summary.recommendations ?? []}
          onAction={onAction}
          onDismissed={() => onMessage?.("Recommendation dismissed.")}
        />
      </DashboardWidgetGate>

      {showDogfoodMirror ? <DogfoodPostureCard /> : null}

      <MaturityStageCard maturity={summary.maturity} onAction={(tab) => onTabChange(tab as DashboardTabId)} />

      {Boolean(tenantSettings?.benchmarkOptIn) && detail?.scanId ? (
        <DashboardWidgetGate widgetId="peer-benchmark" layout={layout} rolePolicy={rolePolicy}>
          <PeerBenchmarkSummary scanId={detail.scanId} />
        </DashboardWidgetGate>
      ) : null}

      {detail?.scanId ? (
        <EvidenceFreshnessCard bffMode={bffMode} latestScanId={detail.scanId} />
      ) : null}

      {persona === "executive" && detail?.scanId ? (
        <ExecutivePriorities
          summary={{
            readinessBand: detail.readinessBand ?? undefined,
            topPriorities: (summary.recommendations ?? [])
              .filter((r) => r.category === "remediation")
              .slice(0, 3)
              .map((r) => ({ title: r.what, action: r.nowWhat, severity: "high" })),
          }}
        />
      ) : null}

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

      {persona === "executive" && reportUrlForScan ? (
        <BoardMeetingMode
          summary={summary}
          reportUrlForScan={reportUrlForScan}
          tenantSettings={tenantSettings}
          onSettingsChange={onSettingsChange}
        />
      ) : null}

      {persona === "executive" ? (
        <RoiCalculatorCard
          readinessScore={detail?.readinessScore ?? summary.kpis.latestReadiness}
          openCritical={summary.kpis.openCritical}
          industry={String(tenantSettings?.industry ?? "financial")}
          onOpenUpgrade={() => onOpenUpgrade?.("assess")}
        />
      ) : null}

      {persona === "executive" ? (
        <DashboardWidgetGate widgetId="ai-explain" layout={layout} rolePolicy={rolePolicy}>
          <ExecutiveAiExplainCard scanId={detail?.scanId ?? null} />
        </DashboardWidgetGate>
      ) : null}

      <DashboardWidgetGate widgetId="insights" layout={layout} rolePolicy={rolePolicy}>
        <DashboardInsightsGrid
          remediationVelocity={summary.remediationVelocity}
          sloMetrics={summary.sloMetrics}
          anomalyAlerts={(summary.alerts ?? [])
            .filter((a) => a.type === "readiness_drop" || a.message)
            .map((a) => ({
              rule: String(a.type ?? "anomaly"),
              message: String(a.message ?? "Readiness change detected"),
            }))}
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
