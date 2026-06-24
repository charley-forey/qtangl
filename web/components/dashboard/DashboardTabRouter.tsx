"use client";

import { useMemo } from "react";

import DashboardOverviewTab from "@/components/dashboard/DashboardOverviewTab";
import DashboardScansTab from "@/components/dashboard/DashboardScansTab";
import DashboardMonitorTab from "@/components/dashboard/DashboardMonitorTab";
import DashboardRemediateTab from "@/components/dashboard/DashboardRemediateTab";
import DashboardSettingsTab from "@/components/dashboard/DashboardSettingsTab";
import MsspPortfolioPanel from "@/components/dashboard/MsspPortfolioPanel";
import ProductTour from "@/components/dashboard/ProductTour";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import type {
  DashboardSummary,
  MonitorTabBundle,
  PortfolioTabBundle,
  RemediateTabBundle,
  ScansTabBundle,
  SettingsTabBundle,
  DashboardTabBundle,
} from "@/lib/dashboard-state";
import type { DashboardSession } from "@/lib/dashboard-bff";
import { putDashboardJson } from "@/lib/dashboard-bff";
import type { RolePolicy } from "@/lib/dashboard-role-policies";
import type { ScanProgressState } from "@/lib/dashboard-state";
import DashboardSkeleton from "@/components/dashboard/ui/DashboardSkeleton";
import Card from "@/components/ui/Card";

type Props = {
  activeTab: DashboardTabId;
  summary: DashboardSummary;
  tabBundle: DashboardTabBundle | null;
  savedKey: string;
  bffMode: boolean;
  persona: DashboardPersona;
  canWrite: boolean;
  canAdmin: boolean;
  canManageKeys?: boolean;
  canInvite?: boolean;
  sessionRole: string;
  rolePolicy: RolePolicy;
  dashboardSession: DashboardSession | null;
  tenantSettings: Record<string, unknown> | null;
  welcomeInvite: boolean;
  scanIdParam: string;
  remediationIdParam: string | null;
  actionParam?: string | null;
  apiKey: string;
  loading: boolean;
  reportUrlForScan: (scanId: string, format?: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor") => string;
  onTabChange: (tab: DashboardTabId) => void;
  onSaveChecklist: (checklist: Record<string, boolean>) => Promise<void>;
  onAction: (action: string) => void;
  onMessage: (message: string) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  onApiKeyChange: (key: string) => void;
  onConnect: () => void;
  onOpenComplianceReport: () => void;
  onOpenReport: (scanId: string) => void;
  onRefreshMonitor: () => void;
  onPortfolioSwitch: () => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  checkoutSuccess?: string | null;
  forceOnboarding?: boolean;
  tabLoading?: boolean;
  tabError?: string | null;
  onRetryTab?: () => void;
  scanProgress?: ScanProgressState | null;
  onRefreshSummary?: () => void;
};

export default function DashboardTabRouter(props: Props) {
  const {
    activeTab,
    summary,
    tabBundle,
    savedKey,
    bffMode,
    persona,
    canWrite,
    canAdmin,
    canManageKeys,
    canInvite,
    sessionRole,
    rolePolicy,
    dashboardSession,
    tenantSettings,
    welcomeInvite,
    scanIdParam,
    remediationIdParam,
    actionParam,
    apiKey,
    loading,
    reportUrlForScan,
    onTabChange,
    onSaveChecklist,
    onAction,
    onMessage,
    onSettingsChange,
    onApiKeyChange,
    onConnect,
    onOpenComplianceReport,
    onOpenReport,
    onRefreshMonitor,
    onPortfolioSwitch,
    onOpenUpgrade,
    checkoutSuccess,
    forceOnboarding,
    tabLoading,
    tabError,
    onRetryTab,
    scanProgress,
    onRefreshSummary,
  } = props;

  const toursCompleted =
    ((tenantSettings?.onboarding as { toursCompleted?: string[] } | undefined)?.toursCompleted ?? []) as string[];

  const tourProps = {
    completed: toursCompleted,
    onTabChange: (tab: string) => onTabChange(tab as DashboardTabId),
  };

  const tabBody = useMemo(() => {
    if (tabLoading && activeTab !== "overview") {
      return <DashboardSkeleton />;
    }
    if (tabError && activeTab !== "overview") {
      return (
        <Card tone="ghost" className="border border-red-500/40 text-red-200">
          <p className="text-sm">{tabError}</p>
          {onRetryTab ? (
            <button type="button" className="mt-3 text-sm underline" onClick={onRetryTab}>
              Retry
            </button>
          ) : null}
        </Card>
      );
    }
    if (activeTab === "overview") {
      return (
        <>
          <ProductTour tourId="overview" {...tourProps} />
          <DashboardOverviewTab
            summary={summary}
            persona={persona}
            signedIn={Boolean(dashboardSession || bffMode)}
            canAdmin={canAdmin}
            canWrite={canWrite}
            tenantSettings={tenantSettings}
            welcomeInvite={welcomeInvite}
            rolePolicy={rolePolicy}
            onTabChange={onTabChange}
            onSaveChecklist={onSaveChecklist}
            onOpenComplianceReport={onOpenComplianceReport}
            onAction={onAction}
            onMessage={onMessage}
            onOpenUpgrade={onOpenUpgrade}
            checkoutSuccess={checkoutSuccess}
            forceOnboarding={forceOnboarding}
            reportUrlForScan={reportUrlForScan}
            bffMode={bffMode}
            onSettingsChange={onSettingsChange}
            onRefreshSummary={onRefreshSummary}
          />
        </>
      );
    }
    if (activeTab === "scans") {
      return (
        <>
          <ProductTour tourId="scans" {...tourProps} />
          <DashboardScansTab
            bundle={tabBundle as ScansTabBundle | null}
            bffMode={bffMode}
            savedKey={savedKey}
            canWrite={canWrite}
            reportUrlForScan={reportUrlForScan}
            onOpenReport={onOpenReport}
            onMessage={onMessage}
            scanIdParam={scanIdParam}
            tenantSettings={tenantSettings}
            onSettingsChange={onSettingsChange}
            scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
            scanProgress={scanProgress}
            schedulesActive={summary.schedulesSummary.active}
            onDismissScheduleRecommendation={() => {
              const coaching = (tenantSettings?.coaching as Record<string, unknown>) ?? {};
              const dismissed = [...((coaching.bannersDismissed as string[]) ?? []), "schedule-recommendation"];
              const next = { ...(tenantSettings ?? {}), coaching: { ...coaching, bannersDismissed: dismissed } };
              void putDashboardJson("/tenant/settings", { settings: next }).then(() => onSettingsChange(next));
            }}
            onOpenUpgrade={onOpenUpgrade}
            onRefresh={() => onRefreshSummary?.()}
            tier={(summary.me.entitlements as { tier?: string } | undefined)?.tier ?? "free"}
            maxSchedules={(summary.me.entitlements as { maxSchedules?: number } | undefined)?.maxSchedules ?? 0}
            maxScansPerMonth={
              summary.kpis.quotaLimit ??
              ((summary.me.entitlements as { maxScansPerMonth?: number } | undefined)?.maxScansPerMonth ?? null)
            }
            scansThisMonth={
              summary.kpis.scansThisMonth ?? (summary.me.scansThisMonth as number | undefined) ?? 0
            }
            readinessScore={
              summary.kpis.latestReadiness ?? summary.latestScanDetail?.readinessScore ?? null
            }
          />
        </>
      );
    }
    if (activeTab === "monitor") {
      return (
        <>
          <ProductTour tourId="monitor" {...tourProps} />
          <DashboardMonitorTab
            bundle={tabBundle as MonitorTabBundle | null}
            summary={summary}
            savedKey={savedKey}
            bffMode={bffMode}
            tenantSettings={tenantSettings}
            canAdmin={canAdmin}
            onMessage={onMessage}
            onRefresh={onRefreshMonitor}
            onTabChange={(tab) => onTabChange(tab as DashboardTabId)}
            onOpenUpgrade={onOpenUpgrade}
            onDismissScheduleRecommendation={() => {
              const coaching = (tenantSettings?.coaching as Record<string, unknown>) ?? {};
              const dismissed = [...((coaching.bannersDismissed as string[]) ?? []), "schedule-recommendation"];
              const next = { ...(tenantSettings ?? {}), coaching: { ...coaching, bannersDismissed: dismissed } };
              void putDashboardJson("/tenant/settings", { settings: next }).then(() => onSettingsChange(next));
            }}
          />
        </>
      );
    }
    if (activeTab === "remediate") {
      const tier = String((summary.me.entitlements as { tier?: string })?.tier ?? "free");
      const convertTier = tier === "convert" || tier === "enterprise";
      const remediationProgramEnabled =
        convertTier || Boolean(tenantSettings?.remediationProgramEnabled);
      return (
        <>
          <ProductTour tourId="remediate" {...tourProps} />
          <DashboardRemediateTab
            bundle={tabBundle as RemediateTabBundle | null}
            savedKey={savedKey}
            jiraConfigured={Boolean(summary.integrationsSummary?.jiraConfigured)}
            scanIdParam={scanIdParam}
            remediationIdParam={remediationIdParam}
            actionParam={actionParam}
            allScans={summary.recentScans
              .filter((s) => s.status === "done")
              .map((s) => ({
                scanId: s.scanId,
                label: s.targetDomain || s.scanId,
              }))}
            remediationProgramEnabled={remediationProgramEnabled}
            convertTier={convertTier}
            latestReadiness={summary.kpis.latestReadiness}
            trend={summary.trend}
            maturityStage={summary.maturity?.stage}
            onTabChange={onTabChange}
            onOpenUpgrade={onOpenUpgrade}
          />
        </>
      );
    }
    if (activeTab === "settings") {
      return (
        <>
          <ProductTour tourId="settings" {...tourProps} />
          <DashboardSettingsTab
            bundle={tabBundle as SettingsTabBundle | null}
            savedKey={savedKey}
            bffMode={bffMode}
            canAdmin={canAdmin}
            canManageKeys={canManageKeys ?? canAdmin}
            canInvite={canInvite}
            sessionRole={sessionRole}
            tenantName={
              (dashboardSession?.tenantName as string | undefined) ??
              (summary.me.tenantName as string | undefined)
            }
            tier={String((summary.me.entitlements as { tier?: string })?.tier ?? "free")}
            persona={persona}
            apiKey={apiKey}
            loading={loading}
            recentScanIds={summary.recentScans.filter((s) => s.status === "done").map((s) => s.scanId)}
            tenantSettings={tenantSettings}
            scansThisMonth={
              summary.kpis.scansThisMonth ?? (summary.me.scansThisMonth as number | undefined) ?? 0
            }
            onMessage={onMessage}
            onSettingsChange={onSettingsChange}
            onApiKeyChange={onApiKeyChange}
            onConnect={onConnect}
            onOpenUpgrade={onOpenUpgrade}
          />
        </>
      );
    }
    if (activeTab === "portfolio") {
      return (
        <MsspPortfolioPanel
          bundle={tabBundle as PortfolioTabBundle | null}
          onSwitchTenant={onPortfolioSwitch}
          canAdmin={canAdmin}
        />
      );
    }
    return null;
  }, [
    activeTab,
    apiKey,
    bffMode,
    canAdmin,
    canManageKeys,
    canInvite,
    canWrite,
    dashboardSession,
    loading,
    onAction,
    onApiKeyChange,
    onConnect,
    onMessage,
    onOpenComplianceReport,
    onOpenReport,
    onPortfolioSwitch,
    onRefreshMonitor,
    onSaveChecklist,
    onSettingsChange,
    onTabChange,
    persona,
    remediationIdParam,
    reportUrlForScan,
    rolePolicy,
    savedKey,
    scanIdParam,
    sessionRole,
    summary,
    tabBundle,
    tenantSettings,
    welcomeInvite,
    checkoutSuccess,
    forceOnboarding,
    toursCompleted,
    tabLoading,
    tabError,
    onRetryTab,
    scanProgress,
    onRefreshSummary,
    actionParam,
    onOpenUpgrade,
  ]);

  return tabBody;
}
