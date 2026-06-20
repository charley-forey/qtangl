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
import type { RolePolicy } from "@/lib/dashboard-role-policies";

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
  onOpenUpgrade?: (product: "assess" | "monitor") => void;
  checkoutSuccess?: string | null;
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
  } = props;

  const toursCompleted =
    ((tenantSettings?.onboarding as { toursCompleted?: string[] } | undefined)?.toursCompleted ?? []) as string[];

  const tourProps = {
    completed: toursCompleted,
    onTabChange: (tab: string) => onTabChange(tab as DashboardTabId),
  };

  return useMemo(() => {
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
            reportUrlForScan={reportUrlForScan}
            bffMode={bffMode}
            onSettingsChange={onSettingsChange}
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
            onMessage={onMessage}
            onRefresh={onRefreshMonitor}
            onTabChange={(tab) => onTabChange(tab as DashboardTabId)}
            onOpenUpgrade={onOpenUpgrade}
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
            onMessage={onMessage}
            onSettingsChange={onSettingsChange}
            onApiKeyChange={onApiKeyChange}
            onConnect={onConnect}
          />
        </>
      );
    }
    if (activeTab === "portfolio") {
      return <MsspPortfolioPanel bundle={tabBundle as PortfolioTabBundle | null} onSwitchTenant={onPortfolioSwitch} />;
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
    toursCompleted,
  ]);
}
