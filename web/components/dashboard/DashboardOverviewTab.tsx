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
import ScheduleRecommendationCard from "@/components/dashboard/ScheduleRecommendationCard";
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
import { algorithmFamiliesFromItems } from "@/lib/algorithm-inventory";
import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";
import { ccFlags } from "@/lib/cc-feature-flags";
import CommandCenterOverviewHero from "@/components/dashboard/CommandCenterOverviewHero";
import CryptoDependencyGraphCard from "@/components/dashboard/CryptoDependencyGraphCard";
import HndlLensCard from "@/components/dashboard/HndlLensCard";
import SmartCadenceCard from "@/components/dashboard/SmartCadenceCard";
import AssignmentInbox from "@/components/dashboard/AssignmentInbox";
import DriftIntelPanel from "@/components/dashboard/DriftIntelPanel";
import MilestoneCelebration from "@/components/dashboard/MilestoneCelebration";
import DogfoodPostureCard from "@/components/dashboard/DogfoodPostureCard";
import MaturityStageCard from "@/components/dashboard/MaturityStageCard";
import QrosWorkspaceLayout from "@/components/qros/QrosWorkspaceLayout";
import NextBestActionFeed from "@/components/qros/NextBestActionFeed";
import AdaptiveMorningBriefing from "@/components/qros/AdaptiveMorningBriefing";
import MigrationRunway from "@/components/qros/MigrationRunway";
import UnifiedWorkQueue from "@/components/qros/UnifiedWorkQueue";
import InsightDecisionCard from "@/components/qros/InsightDecisionCard";
import PushEverywherePanel from "@/components/qros/PushEverywherePanel";
import TileMarketplacePanel from "@/components/qros/TileMarketplacePanel";
import { SeverityDonutV2, AlgorithmFamilyBars } from "@/components/dashboard/charts/CommandCenterCharts";
import { patchDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";
import { isQtanglHqTenant } from "@/lib/dogfood";
import type { RolePolicy } from "@/lib/dashboard-role-policies";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";

const ExecutiveAiExplainCard = dynamic(() => import("@/components/dashboard/ExecutiveAiExplainCard"), {
  loading: () => null,
});

const ScanDiffPanel = dynamic(() => import("@/components/pqc/ScanDiffPanel"), { loading: () => null });

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
  forceOnboarding?: boolean;
  reportUrlForScan?: (scanId: string, format?: "board") => string;
  rolePolicy?: RolePolicy;
  bffMode?: boolean;
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  onRefreshSummary?: () => void;
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
  forceOnboarding = false,
  reportUrlForScan,
  rolePolicy,
  bffMode = true,
  onSettingsChange,
  onRefreshSummary,
}: Props) {
  const { onboarding, capabilities, session } = useDashboardSession();
  const showDogfoodMirror = isQtanglHqTenant(tenantSettings, session?.email);
  const onboardingRecord =
    (tenantSettings?.onboarding as { complete?: boolean; dismissed?: boolean } | undefined) ??
    (onboarding as { complete?: boolean; dismissed?: boolean } | null | undefined);
  const showWizard =
    forceOnboarding ||
    Boolean(onboardingRecord && !onboardingRecord.complete && !onboardingRecord.dismissed);
  const isCustomerExecutive = (session?.role ?? "").toLowerCase() === "customer_executive";

  const ccV2 = useCommandCenterV2();
  const layout = summary.layoutDefaults;
  const detail = summary.latestScanDetail;
  const scanDiff = detail?.scanDiff as ScanDiff | null | undefined;
  const hasScanDiff = Boolean(scanDiff?.previousScanId);
  const needsSchedule =
    summary.recentScans.length > 0 && summary.schedulesSummary.active === 0;
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
  const algorithmRows = algorithmFamiliesFromItems(backlog).map(({ family, count }) => ({
    label: family,
    count,
  }));

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
    const next = { ...(tenantSettings ?? {}), coaching: { ...coaching, bannersDismissed: dismissed } };
    await putDashboardJson("/tenant/settings", { settings: next });
    onSettingsChange?.(next);
  }

  const detailsContent = (
    <>
      <CoachingBanner
        summary={summary}
        tenantSettings={tenantSettings}
        checkoutSuccess={checkoutSuccess}
        onTabChange={(tab) => onTabChange(tab as DashboardTabId)}
        onOpenUpgrade={onOpenUpgrade}
        onDismiss={dismissBanner}
      />

      {hasScanDiff ? (
        <Card tone="panel" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Drift since last scan</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Monitor diffs each assessment against your prior baseline — new quantum-vulnerable assets, score movement,
            and certificate regressions.
          </p>
          <div className="mt-4">
            <ScanDiffPanel diff={scanDiff} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => onTabChange("scans")}>
              View scan history
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onTabChange("monitor")}>
              Monitor settings
            </Button>
          </div>
        </Card>
      ) : summary.recentScans.length > 0 ? (
        <Card tone="panel" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Drift baseline</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Run a second scan on the same target to unlock drift — readiness delta, new quantum-vulnerable assets, and
            certificate regressions since your last assessment.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => onTabChange("scans")}>
              Run follow-up scan
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onTabChange("monitor")}>
              Set up scheduled Monitor
            </Button>
          </div>
        </Card>
      ) : null}

      {welcomeInvite ? (
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          Welcome — you have joined this workspace. Explore the overview, then open Scans to review the latest
          assessment.
        </div>
      ) : null}

      {isCustomerExecutive && summary.digest ? (
        <Card tone="feature" className="border border-[var(--border-strong)]">
          <Eyebrow>Your weekly posture brief</Eyebrow>
          <div className="mt-3">
            <ExecutiveDigestCard digest={summary.digest} />
          </div>
        </Card>
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

      {needsSchedule && !hasScanDiff ? (
        <ScheduleRecommendationCard
          scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
          tier={(summary.me.entitlements as { tier?: string } | undefined)?.tier ?? "free"}
          maxSchedules={(summary.me.entitlements as { maxSchedules?: number } | undefined)?.maxSchedules ?? 0}
          readinessScore={summary.kpis.latestReadiness ?? detail?.readinessScore ?? null}
          dismissed={((tenantSettings?.coaching as { bannersDismissed?: string[] } | undefined)?.bannersDismissed ?? []).includes(
            "schedule-recommendation"
          )}
          onDismiss={() => void dismissBanner("schedule-recommendation")}
          onMessage={onMessage}
          onRefresh={onRefreshSummary}
          onOpenUpgrade={onOpenUpgrade}
          onOpenScans={() => onTabChange("scans")}
        />
      ) : null}

      {detail?.scanId ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {ccV2 ? (
            <>
              <Card tone="panel" className="p-4">
                <Eyebrow>Severity breakdown</Eyebrow>
                <div className="mt-3">
                  <SeverityDonutV2
                    data={severityCounts.map((s) => ({ name: s.label, value: s.value }))}
                  />
                </div>
              </Card>
              <Card tone="panel" className="p-4">
                <Eyebrow>Algorithm exposure</Eyebrow>
                <div className="mt-3">
                  <AlgorithmFamilyBars
                    data={algorithmRows.map((r) => ({ family: r.label, count: r.count }))}
                  />
                </div>
              </Card>
            </>
          ) : (
            <>
              <SeverityDonut
                slices={severityCounts}
                insight={
                  severityCounts.find((s) => s.label === "critical")?.value
                    ? "Critical findings should be prioritized for Q-Day migration planning."
                    : undefined
                }
              />
              <AlgorithmBreakdown rows={algorithmRows} />
            </>
          )}
        </div>
      ) : null}

      <DashboardWidgetGate widgetId="checklist" layout={layout} rolePolicy={rolePolicy}>
        <FirstRunChecklist
          signedIn={signedIn}
          hasScans={summary.recentScans.length > 0}
          hasSchedule={summary.schedulesSummary.active > 0}
          isAdmin={canAdmin}
          settings={tenantSettings as { firstRunChecklist?: Record<string, boolean>; billing?: Record<string, unknown> } | undefined}
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

      {!isCustomerExecutive && !ccV2 ? (
        <DashboardWidgetGate widgetId="digest" layout={layout} rolePolicy={rolePolicy}>
          <ExecutiveDigestCard digest={summary.digest} />
        </DashboardWidgetGate>
      ) : null}

      <DashboardWidgetGate widgetId="actions" layout={layout} rolePolicy={rolePolicy}>
        <DashboardActionQueue
          recommendations={summary.recommendations ?? []}
          onAction={onAction}
          onDismissed={() => {
            onMessage?.("Recommendation dismissed.");
            onRefreshSummary?.();
          }}
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

      {persona === "executive" && detail?.scanId && !ccV2 ? (
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

      {ccV2 && detail?.scanId && ccFlags.graph ? (
        <CryptoDependencyGraphCard scanId={detail.scanId} />
      ) : null}

      {ccV2 && detail?.scanId && ccFlags.hndl ? <HndlLensCard scanId={detail.scanId} /> : null}

      {persona === "executive" && reportUrlForScan ? (
        <BoardMeetingMode
          summary={summary}
          reportUrlForScan={reportUrlForScan}
          tenantSettings={tenantSettings}
          onSettingsChange={onSettingsChange}
        />
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
            scoreScope={summary.commandCenter.scoreScope}
            deltas={summary.commandCenter.businessUnitDeltas}
            onSelectUnit={() => onTabChange("monitor")}
          />
        </DashboardWidgetGate>
      ) : null}

      {!ccV2 && persona !== "executive" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <AssignmentInbox />
          <SmartCadenceCard />
        </div>
      ) : null}

      {!ccV2 && persona === "executive" ? (
        <>
          <RoiCalculatorCard
            readinessScore={detail?.readinessScore ?? summary.kpis.latestReadiness}
            openCritical={summary.kpis.openCritical}
            industry={String(tenantSettings?.industry ?? "financial")}
            onOpenUpgrade={() => onOpenUpgrade?.("assess")}
          />
          <DashboardWidgetGate widgetId="ai-explain" layout={layout} rolePolicy={rolePolicy}>
            <ExecutiveAiExplainCard scanId={detail?.scanId ?? null} />
          </DashboardWidgetGate>
        </>
      ) : null}

      {!ccV2 && Boolean(tenantSettings?.benchmarkOptIn) ? <DriftIntelPanel /> : null}
    </>
  );

  return (
    <div className="space-y-4">
      {ccV2 ? (
        <MilestoneCelebration
          readinessScore={summary.kpis.latestReadiness ?? detail?.readinessScore ?? null}
          tenantId={String(summary.me.tenantId ?? "")}
        />
      ) : null}
      {!ccV2 ? (
        <CommandCenterOverviewHero summary={summary} tenantSettings={tenantSettings} />
      ) : null}
      {ccV2 ? (
        <QrosWorkspaceLayout
          summary={
            <div className="grid gap-4 lg:grid-cols-2">
              <AdaptiveMorningBriefing persona={persona} />
              <NextBestActionFeed />
              <MigrationRunway />
              <UnifiedWorkQueue />
              {detail?.scanId ? (
                <InsightDecisionCard
                  title="Latest inventory posture"
                  whatChanged={
                    summary.kpis.delta != null
                      ? `Readiness moved ${summary.kpis.delta >= 0 ? "up" : "down"} ${Math.abs(summary.kpis.delta)} points.`
                      : "Baseline established from latest scan."
                  }
                  whyItMatters="Prioritize quantum-vulnerable assets with documented owners before compliance deadlines."
                  nextAction="Review open critical findings and assign remediation owners."
                  ctaLabel="Open remediate workspace"
                  onCta={() => onTabChange("remediate")}
                  scanId={detail.scanId}
                />
              ) : null}
            </div>
          }
          details={detailsContent}
          advanced={
            <>
              <SmartCadenceCard />
              <DriftIntelPanel />
              <RoiCalculatorCard
                readinessScore={detail?.readinessScore ?? summary.kpis.latestReadiness}
                openCritical={summary.kpis.openCritical}
                industry={String(tenantSettings?.industry ?? "financial")}
                onOpenUpgrade={() => onOpenUpgrade?.("assess")}
              />
              <ExecutiveAiExplainCard scanId={detail?.scanId ?? null} />
              <PushEverywherePanel />
              <TileMarketplacePanel />
            </>
          }
        />
      ) : (
        detailsContent
      )}
    </div>
  );
}
