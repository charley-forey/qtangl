"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QtanglProvider } from "@qtangl/sdk-react";

import Card from "@/components/ui/Card";
import DashboardLanding from "@/components/dashboard/DashboardLanding";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardTabRouter from "@/components/dashboard/DashboardTabRouter";
import DashboardSkeleton from "@/components/dashboard/ui/DashboardSkeleton";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useDashboardTab } from "@/hooks/useDashboardTab";
import { useDashboardCommandActions } from "@/hooks/useDashboardCommandActions";
import { useSessionExpiryWarning } from "@/hooks/useSessionExpiryWarning";
import { defaultTabForPersona } from "@/lib/dashboard-state";
import type { SettingsTabBundle } from "@/lib/dashboard-state";
import { dashboardReportUrl, putDashboardJson, workosClientAuthEnabled, type DashboardSession } from "@/lib/dashboard-bff";
import { useDashboardEvents } from "@/lib/dashboard-events";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import { getStoredTenantApiKey, setStoredTenantApiKey, tenantReportUrl } from "@/lib/tenant-api";
import { qtanglApiBaseUrl } from "@/lib/api";

const ReportDrawer = dynamic(() => import("@/components/pqc/ReportDrawer"), { loading: () => null });

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const scanIdParam = searchParams.get("scanId") ?? "";
  const remediationIdParam = searchParams.get("remediationId");
  const welcomeInvite = searchParams.get("welcome") === "invite";
  const { session: contextSession } = useDashboardSession();

  const [activeTab, setActiveTab] = useState<DashboardTabId>("overview");
  const [persona, setPersona] = useState<DashboardPersona>("operator");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [dashboardSession, setDashboardSession] = useState<DashboardSession | null>(null);
  const [tenantSettings, setTenantSettings] = useState<Record<string, unknown> | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [bffMode, setBffMode] = useState(false);

  const { summary, loading, error, scanProgress, loadSummary, patchScan } = useDashboardSummary();
  const { bundle: tabBundle, loadTab, invalidateTab } = useDashboardTab(activeTab);
  const { expiring, message: sessionWarning } = useSessionExpiryWarning(bffMode);

  const connectBff = useCallback(async () => {
    setBffMode(true);
    setSavedKey("bff");
    await loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (contextSession) setDashboardSession(contextSession);
  }, [contextSession]);
  useEffect(() => {
    if (workosClientAuthEnabled() && contextSession) void connectBff();
  }, [contextSession, connectBff]);
  useEffect(() => {
    const stored = getStoredTenantApiKey();
    if (stored && !workosClientAuthEnabled()) {
      setApiKey(stored);
      setSavedKey(stored);
    }
  }, []);
  useEffect(() => {
    if (summary) {
      setPersona(summary.layoutDefaults.persona ?? "operator");
      if ((tabBundle as SettingsTabBundle | null)?.settings) {
        setTenantSettings((tabBundle as SettingsTabBundle).settings);
      }
    }
  }, [summary, tabBundle]);
  useEffect(() => {
    if (bffMode && summary) void loadTab(activeTab);
  }, [activeTab, bffMode, loadTab, summary]);
  useEffect(() => {
    if (scanIdParam) setActiveTab("scans");
    if (remediationIdParam) setActiveTab("remediate");
  }, [remediationIdParam, scanIdParam]);

  useDashboardEvents({
    enabled: bffMode && Boolean(summary),
    onEvent: (event) => {
      const data = event.data ?? {};
      patchScan({
        scanId: String(data.scanId ?? ""),
        status: String(data.status ?? ""),
        progressPct: typeof data.progressPct === "number" ? data.progressPct : undefined,
        readinessScore: data.readinessScore as number | null | undefined,
        readinessBand: data.readinessBand as string | null | undefined,
        targetDomain: data.targetDomain as string | undefined,
        updatedAt: data.updatedAt as string | undefined,
      });
      if (data.status === "done") {
        setActionMessage(`Scan complete — readiness ${data.readinessScore ?? "n/a"}`);
        invalidateTab("scans");
        invalidateTab("remediate");
      }
    },
  });

  const reportUrlForScan = useCallback(
    (scanId: string, format: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor" = "pdf") =>
      bffMode ? dashboardReportUrl(scanId, format) : tenantReportUrl(scanId, savedKey ?? "", format),
    [bffMode, savedKey]
  );

  const commandActions = useDashboardCommandActions({
    onTabChange: setActiveTab,
    onRunBaseline: () => setActiveTab("scans"),
    onExportBoard: () => {
      const latest = summary?.recentScans.find((s) => s.status === "done");
      if (latest) window.open(reportUrlForScan(latest.scanId, "board"), "_blank", "noopener,noreferrer");
      trackDashboardEvent("dashboard_export", { format: "board" });
    },
    onConfigureSso: () => setActiveTab("settings"),
  });

  const saveChecklist = useCallback(async (checklist: Record<string, boolean>) => {
    const next = { ...(tenantSettings ?? {}), firstRunChecklist: checklist };
    await putDashboardJson("/tenant/settings", { settings: next });
    setTenantSettings(next);
  }, [tenantSettings]);

  const savePersona = useCallback(async (nextPersona: DashboardPersona) => {
    setPersona(nextPersona);
    setActiveTab(defaultTabForPersona(nextPersona));
    const next = { ...(tenantSettings ?? {}), dashboardLayout: { ...((tenantSettings?.dashboardLayout as object) ?? {}), persona: nextPersona } };
    await putDashboardJson("/tenant/settings", { settings: next });
    setTenantSettings(next);
  }, [tenantSettings]);

  const meRole = typeof summary?.me.role === "string" ? summary.me.role : undefined;
  const canWrite = meRole === "admin" || meRole === "operator";
  const canAdmin = meRole === "admin";

  const dashboard = (
    <div className={density === "compact" ? "space-y-4" : "space-y-8"}>
      {!summary && !loading ? <DashboardLanding /> : null}
      {loading && !summary ? <DashboardSkeleton /> : null}
      {error ? <Card tone="ghost" className="border border-red-500/40 text-red-200"><p>{error}</p></Card> : null}
      {actionMessage ? <p className="text-xs text-[var(--color-gray-400)]">{actionMessage}</p> : null}
      {summary && savedKey ? (
        <DashboardShell
          summary={summary}
          dashboardSession={dashboardSession}
          persona={persona}
          activeTab={activeTab}
          density={density}
          alerts={summary.alerts}
          commandActions={commandActions}
          scanProgress={scanProgress}
          sessionWarning={expiring ? sessionWarning : null}
          reportUrlForScan={reportUrlForScan}
          onPersonaChange={savePersona}
          onTabChange={(tab) => { setActiveTab(tab); trackDashboardEvent("dashboard_tab_changed", { tab }); }}
          onDensityToggle={() => {
            const next = density === "compact" ? "comfortable" : "compact";
            setDensity(next);
            localStorage.setItem("qtangl_dashboard_density", next);
          }}
          onSessionChange={setDashboardSession}
          onMarkAlertsRead={async (ids) => {
            const next = { ...(tenantSettings ?? {}), notificationReadIds: [...((tenantSettings?.notificationReadIds as string[]) ?? []), ...ids] };
            await putDashboardJson("/tenant/settings", { settings: next });
            setTenantSettings(next);
          }}
        >
          <DashboardTabRouter
            activeTab={activeTab}
            summary={summary}
            tabBundle={tabBundle}
            savedKey={savedKey}
            bffMode={bffMode}
            persona={persona}
            canWrite={canWrite}
            canAdmin={canAdmin}
            dashboardSession={dashboardSession}
            tenantSettings={tenantSettings}
            welcomeInvite={welcomeInvite}
            scanIdParam={scanIdParam}
            remediationIdParam={remediationIdParam}
            apiKey={apiKey}
            loading={loading}
            reportUrlForScan={reportUrlForScan}
            onTabChange={setActiveTab}
            onSaveChecklist={saveChecklist}
            onAction={(action) => {
              if (action === "baseline" || action === "review") setActiveTab("scans");
              if (action === "schedule") setActiveTab("monitor");
              if (action === "invite") setActiveTab("settings");
              if (action === "export") commandActions.find((a) => a.id === "export")?.onSelect();
            }}
            onMessage={setActionMessage}
            onSettingsChange={setTenantSettings}
            onApiKeyChange={setApiKey}
            onConnect={() => { setStoredTenantApiKey(apiKey); setSavedKey(apiKey); setBffMode(false); }}
            onOpenComplianceReport={() => { setReportDrawerOpen(true); }}
            onOpenReport={() => { setReportDrawerOpen(true); }}
            onRefreshMonitor={() => void loadTab("monitor", true)}
            onPortfolioSwitch={() => { void loadSummary(); invalidateTab("portfolio"); }}
          />
        </DashboardShell>
      ) : null}
      <ReportDrawer open={reportDrawerOpen} onClose={() => setReportDrawerOpen(false)} scan={null} reportStatus="checking" missingReason={null} />
    </div>
  );

  return savedKey ? <QtanglProvider apiKey={savedKey} baseUrl={qtanglApiBaseUrl}>{dashboard}</QtanglProvider> : dashboard;
}
