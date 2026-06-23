"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QtanglProvider } from "@qtangl/sdk-react";

import Card from "@/components/ui/Card";
import DashboardSessionError from "@/components/dashboard/DashboardSessionError";
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
import { roleToPersona, normalizeDashboardRole } from "@/lib/dashboard-persona";
import type { SettingsTabBundle } from "@/lib/dashboard-state";
import {
  dashboardReportUrl,
  fetchDashboardJson,
  patchDashboardJson,
  putDashboardJson,
  type DashboardSession,
} from "@/lib/dashboard-bff";
import { resolveRolePolicy } from "@/lib/dashboard-role-policies";
import UpgradeModal from "@/components/dashboard/UpgradeModal";
import DashboardToast from "@/components/dashboard/DashboardToast";
import TermsBumpModal from "@/components/dashboard/TermsBumpModal";
import { useUpgradeGate } from "@/hooks/useUpgradeGate";
import { useDashboardEvents } from "@/lib/dashboard-events";
import { isTermsBumpRequired } from "@/lib/dashboard-legal";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import { getStoredTenantApiKey, setStoredTenantApiKey, tenantReportUrl } from "@/lib/tenant-api";
import type { PqcScanResponse } from "@/lib/pqc";
import { qtanglApiBaseUrl } from "@/lib/api";
import { createBffFetchImpl } from "@/lib/qtangl-client";
import { parseDashboardDeepLink, resolveDashboardTabFromDeepLink } from "@/lib/dashboard-deep-links";

const ReportDrawer = dynamic(() => import("@/components/pqc/ReportDrawer"), { loading: () => null });
const DashboardScanResultsGuide = dynamic(() => import("@/components/dashboard/DashboardScanResultsGuide"), {
  loading: () => null,
});

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const scanIdParam = searchParams.get("scanId") ?? "";
  const remediationIdParam = searchParams.get("remediationId");
  const actionParam = searchParams.get("action");
  const deepLink = parseDashboardDeepLink(searchParams);
  const welcomeInvite = searchParams.get("welcome") === "invite";
  const upgradeParam = searchParams.get("upgrade");
  const checkoutParam = searchParams.get("checkout");
  const signupSuccessParam = searchParams.get("signup") === "success";
  const checkoutSuccess = checkoutParam ?? (signupSuccessParam ? "monitor" : null);
  const { upgradeOpen, upgradeProduct, upgradeContext, openUpgrade, closeUpgrade } = useUpgradeGate();
  const {
    session: contextSession,
    checked,
    sessionReason,
    capabilities,
    workosEnabled,
    refreshSession,
    sessionReady,
    credentialsReady,
  } = useDashboardSession();

  const tenantId = contextSession?.tenantId;
  const userId = contextSession?.userId;

  const [activeTab, setActiveTab] = useState<DashboardTabId>("overview");
  const [persona, setPersona] = useState<DashboardPersona>("operator");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [dashboardSession, setDashboardSession] = useState<DashboardSession | null>(null);
  const [tenantSettings, setTenantSettings] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [reportScan, setReportScan] = useState<PqcScanResponse | null>(null);
  const [reportScanId, setReportScanId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [bffMode, setBffMode] = useState(false);
  const [bffConnected, setBffConnected] = useState(false);

  const bffBootstrappedKeyRef = useRef<string | null>(null);

  const { summary, loading, error, scanProgress, loadSummary, patchScan } = useDashboardSummary();
  const { bundle: tabBundle, loading: tabLoading, error: tabError, loadTab, invalidateTab } = useDashboardTab(activeTab);

  const showMessage = useCallback((message: string, tone: "success" | "error" | "info" = "info") => {
    setToast({ message, tone });
  }, []);

  const loadTenantSettings = useCallback(async () => {
    try {
      const payload = await fetchDashboardJson<{ settings: Record<string, unknown> }>("/tenant/settings");
      if (payload.settings) setTenantSettings(payload.settings);
    } catch {
      /* optional */
    }
  }, []);

  const reloadWorkspace = useCallback(async () => {
    bffBootstrappedKeyRef.current = null;
    await refreshSession();
    await Promise.all([loadSummary(), loadTenantSettings()]);
    invalidateTab();
  }, [invalidateTab, loadSummary, loadTenantSettings, refreshSession]);

  const retrySessionAndSummary = useCallback(async () => {
    await refreshSession();
    await loadSummary();
  }, [refreshSession, loadSummary]);

  const { expiring, message: sessionWarning } = useSessionExpiryWarning(
    bffConnected,
    retrySessionAndSummary
  );

  const connectBff = useCallback(async () => {
    setBffMode(true);
    setSavedKey("bff");
    await refreshSession();
    await Promise.all([loadSummary(), loadTenantSettings()]);
    setBffConnected(true);
  }, [loadSummary, loadTenantSettings, refreshSession]);

  useEffect(() => {
    if (contextSession) setDashboardSession(contextSession);
  }, [contextSession]);

  useEffect(() => {
    if (!tenantId || !sessionReady || !credentialsReady) {
      return;
    }
    const bootstrapKey = `${tenantId}:${userId ?? ""}`;
    if (bffBootstrappedKeyRef.current === bootstrapKey) {
      return;
    }
    bffBootstrappedKeyRef.current = bootstrapKey;
    void connectBff();
  }, [tenantId, userId, sessionReady, credentialsReady, connectBff]);

  useEffect(() => {
    const stored = getStoredTenantApiKey();
    if (stored && !contextSession) {
      setApiKey(stored);
      setSavedKey(stored);
    }
  }, [contextSession]);

  useEffect(() => {
    if (summary) {
      const role = normalizeDashboardRole(String(contextSession?.role ?? summary.me.role ?? ""));
      setPersona(roleToPersona(role));
      if ((tabBundle as SettingsTabBundle | null)?.settings) {
        setTenantSettings((tabBundle as SettingsTabBundle).settings);
      }
    }
  }, [summary, tabBundle, contextSession?.role]);

  useEffect(() => {
    if (!contextSession?.role) return;
    setActiveTab(defaultTabForPersona(roleToPersona(contextSession.role)));
    // Set default tab once per session role
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextSession?.tenantId, contextSession?.role]);

  useEffect(() => {
    if (bffMode && summary) {
      void loadTab(activeTab, false, activeTab === "remediate" && scanIdParam ? { scanId: scanIdParam } : undefined);
    }
  }, [activeTab, bffMode, loadTab, summary, scanIdParam]);

  useEffect(() => {
    if (bffMode && summary) {
      trackDashboardEvent("dashboard_loaded", { tab: activeTab });
    }
  }, [bffMode, summary?.me.tenantId, activeTab]);

  useEffect(() => {
    const tab = resolveDashboardTabFromDeepLink(deepLink);
    if (tab) setActiveTab(tab);
  }, [deepLink.tab, deepLink.scanId, deepLink.remediationId, deepLink.action]);

  useEffect(() => {
    if (upgradeParam === "assess") openUpgrade("assess");
    if (upgradeParam === "monitor") openUpgrade("monitor");
  }, [openUpgrade, upgradeParam]);

  useEffect(() => {
    if (!bffConnected || (!signupSuccessParam && checkoutParam !== "monitor")) return;
    void patchDashboardJson("/tenant/onboarding", { dismissed: false, complete: false, step: "company" }).then(() => {
      setTenantSettings((prev) => ({
        ...(prev ?? {}),
        onboarding: {
          ...((prev?.onboarding as Record<string, unknown>) ?? {}),
          dismissed: false,
          complete: false,
          step: "company",
        },
      }));
    });
  }, [bffConnected, checkoutParam, signupSuccessParam]);

  const loadReportScan = useCallback(async (scanId: string) => {
    setReportScanId(scanId);
    try {
      const payload = await fetchDashboardJson<Record<string, unknown>>(`/tenant/scans/${encodeURIComponent(scanId)}`);
      if (payload.status === "success" && payload.scanId) {
        setReportScan(payload as unknown as PqcScanResponse);
      }
    } catch {
      setReportScan(null);
    }
  }, []);

  const openReportDrawer = useCallback(
    (scanId?: string) => {
      const id = scanId ?? summary?.recentScans.find((s) => s.status === "done")?.scanId;
      if (id) void loadReportScan(id);
      setReportDrawerOpen(true);
    },
    [loadReportScan, summary?.recentScans]
  );

  const { connected: eventsConnected } = useDashboardEvents({
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
        const scanId = String(data.scanId ?? "");
        showMessage(`Scan complete — readiness ${data.readinessScore ?? "n/a"}`, "success");
        trackDashboardEvent("scan_complete", { scanId });
        void loadSummary().then((updated) => {
          const diff = updated?.latestScanDetail?.scanDiff as { readinessDelta?: number } | null | undefined;
          const delta = diff?.readinessDelta ?? 0;
          if (delta !== 0) {
            setActiveTab("scans");
          }
        });
        openReportDrawer(scanId);
        const billing = (tenantSettings?.billing as { trialScansUsed?: number; assessPaidAt?: string | null }) ?? {};
        if (!billing.assessPaidAt && Number(billing.trialScansUsed ?? 0) >= 0) {
          openUpgrade("assess");
        }
        invalidateTab("scans");
        invalidateTab("remediate");
      }
    },
  });

  const bffFetchImpl = useMemo(() => (bffMode ? createBffFetchImpl() : undefined), [bffMode]);

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

  const sessionRole = normalizeDashboardRole(String(contextSession?.role ?? summary?.me.role ?? ""));
  const canWrite = capabilities?.canWrite ?? (sessionRole === "admin" || sessionRole === "operator");
  const canAdmin = capabilities?.canAdmin ?? sessionRole === "admin";
  const rolePolicy = useMemo(
    () =>
      resolveRolePolicy(
        typeof sessionRole === "string" ? sessionRole : undefined,
        tenantSettings?.rolePolicies as Record<string, import("@/lib/dashboard-role-policies").RolePolicy> | undefined
      ),
    [sessionRole, tenantSettings?.rolePolicies]
  );

  if (!checked) {
    return (
      <Card tone="ghost">
        <p className="text-sm text-[var(--color-gray-400)]">Checking session…</p>
        <DashboardSkeleton />
      </Card>
    );
  }

  if (contextSession && credentialsReady === false) {
    return (
      <DashboardSessionError
        reason="bff_secret_missing"
        workosEnabled={workosEnabled}
      />
    );
  }

  if (contextSession && !summary) {
    if (loading) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-gray-400)]">Loading your workspace…</p>
          <DashboardSkeleton />
        </div>
      );
    }
    if (error || sessionReason) {
      return (
        <DashboardSessionError
          reason={sessionReason}
          summaryError={error}
          workosEnabled={workosEnabled}
        />
      );
    }
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-gray-400)]">Loading your workspace…</p>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!contextSession && sessionReason && !workosEnabled) {
    return <DashboardSessionError reason={sessionReason} workosEnabled={workosEnabled} />;
  }

  const dashboard = (
    <div className={density === "compact" ? "space-y-4" : "space-y-8"}>
      {error && summary ? (
        <Card tone="ghost" className="border border-red-500/40 text-red-200">
          <p>{error}</p>
        </Card>
      ) : null}
      {toast ? (
        <DashboardToast message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}
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
          rolePolicy={rolePolicy}
          sessionRole={sessionRole}
          onTabChange={(tab) => {
            setActiveTab(tab);
            trackDashboardEvent("dashboard_tab_changed", { tab });
          }}
          onDensityToggle={() => {
            const next = density === "compact" ? "comfortable" : "compact";
            setDensity(next);
            localStorage.setItem("qtangl_dashboard_density", next);
          }}
          onSessionChange={(session) => {
            setDashboardSession(session);
            void reloadWorkspace();
          }}
          onMarkAlertsRead={async (ids) => {
            const next = {
              ...(tenantSettings ?? {}),
              notificationReadIds: [...((tenantSettings?.notificationReadIds as string[]) ?? []), ...ids],
            };
            await putDashboardJson("/tenant/settings", { settings: next });
            setTenantSettings(next);
          }}
          onRefreshAlerts={() => void loadSummary()}
          tenantSettings={tenantSettings}
          onSettingsChange={setTenantSettings}
          eventsConnected={bffMode ? eventsConnected : undefined}
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
            canManageKeys={capabilities?.canManageKeys ?? canAdmin}
            canInvite={capabilities?.canInvite}
            sessionRole={sessionRole}
            rolePolicy={rolePolicy}
            dashboardSession={dashboardSession}
            tenantSettings={tenantSettings}
            welcomeInvite={welcomeInvite}
            scanIdParam={scanIdParam}
            remediationIdParam={remediationIdParam}
            actionParam={actionParam}
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
            onMessage={showMessage}
            onSettingsChange={setTenantSettings}
            onApiKeyChange={setApiKey}
            onConnect={() => {
              setStoredTenantApiKey(apiKey);
              setSavedKey(apiKey);
              setBffMode(false);
            }}
            onOpenComplianceReport={() => openReportDrawer()}
            onOpenReport={(scanId) => openReportDrawer(scanId)}
            onRefreshMonitor={() => void loadTab("monitor", true)}
            tabLoading={tabLoading}
            tabError={tabError}
            onRetryTab={() => void loadTab(activeTab, true, activeTab === "remediate" && scanIdParam ? { scanId: scanIdParam } : undefined)}
            scanProgress={scanProgress}
            onRefreshSummary={() => void loadSummary()}
            onPortfolioSwitch={() => void reloadWorkspace()}
            onOpenUpgrade={openUpgrade}
            checkoutSuccess={checkoutSuccess}
            forceOnboarding={signupSuccessParam || checkoutParam === "monitor"}
          />
        </DashboardShell>
      ) : null}
      <UpgradeModal
        open={upgradeOpen}
        product={upgradeProduct}
        context={upgradeContext}
        onClose={closeUpgrade}
        onMessage={showMessage}
        salesLed={Boolean(tenantSettings?.salesLed)}
      />
      <TermsBumpModal
        open={Boolean(tenantSettings) && isTermsBumpRequired(tenantSettings)}
        scanAllowlist={(tenantSettings?.scanAllowlist as string[] | undefined) ?? []}
        onAccepted={(billing) => {
          const next = {
            ...(tenantSettings ?? {}),
            billing: { ...((tenantSettings?.billing as Record<string, unknown>) ?? {}), ...billing },
          };
          setTenantSettings(next);
          showMessage("Updated terms accepted.", "success");
        }}
      />
      <ReportDrawer
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        scan={reportScan}
        reportStatus={reportScan ? "ready" : "checking"}
        missingReason={reportScan ? null : "Loading scan report…"}
      />
      {reportDrawerOpen && reportScanId && reportScan ? (
        <div className="fixed bottom-4 right-4 z-[60] max-w-md">
          <DashboardScanResultsGuide
            scanId={reportScanId}
            readinessScore={reportScan.scoreboard?.qtangl?.readiness_score}
            readinessBand={reportScan.readinessBand}
            onTabChange={(tab) => {
              setReportDrawerOpen(false);
              setActiveTab(tab as DashboardTabId);
            }}
            onOpenUpgrade={openUpgrade}
          />
        </div>
      ) : null}
    </div>
  );

  return savedKey ? (
    <QtanglProvider apiKey={savedKey} baseUrl={qtanglApiBaseUrl} fetchImpl={bffFetchImpl}>
      {dashboard}
    </QtanglProvider>
  ) : (
    dashboard
  );
}
