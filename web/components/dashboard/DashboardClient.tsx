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
import type { SettingsTabBundle } from "@/lib/dashboard-state";
import { dashboardReportUrl, putDashboardJson, type DashboardSession } from "@/lib/dashboard-bff";
import { resolveRolePolicy } from "@/lib/dashboard-role-policies";
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
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [bffMode, setBffMode] = useState(false);
  const [bffConnected, setBffConnected] = useState(false);

  const bffBootstrappedKeyRef = useRef<string | null>(null);

  const { summary, loading, error, scanProgress, loadSummary, patchScan } = useDashboardSummary();
  const { bundle: tabBundle, loadTab, invalidateTab } = useDashboardTab(activeTab);

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
    await loadSummary();
    setBffConnected(true);
  }, [loadSummary, refreshSession]);

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
    const next = {
      ...(tenantSettings ?? {}),
      dashboardLayout: { ...((tenantSettings?.dashboardLayout as object) ?? {}), persona: nextPersona },
    };
    await putDashboardJson("/tenant/settings", { settings: next });
    setTenantSettings(next);
  }, [tenantSettings]);

  const sessionRole = contextSession?.role ?? summary?.me.role;
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
          rolePolicy={rolePolicy}
          onPersonaChange={savePersona}
          onTabChange={(tab) => {
            setActiveTab(tab);
            trackDashboardEvent("dashboard_tab_changed", { tab });
          }}
          onDensityToggle={() => {
            const next = density === "compact" ? "comfortable" : "compact";
            setDensity(next);
            localStorage.setItem("qtangl_dashboard_density", next);
          }}
          onSessionChange={setDashboardSession}
          onMarkAlertsRead={async (ids) => {
            const next = {
              ...(tenantSettings ?? {}),
              notificationReadIds: [...((tenantSettings?.notificationReadIds as string[]) ?? []), ...ids],
            };
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
            canManageKeys={capabilities?.canManageKeys ?? canAdmin}
            canInvite={capabilities?.canInvite}
            sessionRole={typeof sessionRole === "string" ? sessionRole : "viewer"}
            rolePolicy={rolePolicy}
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
            onConnect={() => {
              setStoredTenantApiKey(apiKey);
              setSavedKey(apiKey);
              setBffMode(false);
            }}
            onOpenComplianceReport={() => {
              setReportDrawerOpen(true);
            }}
            onMessage={setActionMessage}
            onOpenReport={() => {
              setReportDrawerOpen(true);
            }}
            onRefreshMonitor={() => void loadTab("monitor", true)}
            onPortfolioSwitch={() => {
              bffBootstrappedKeyRef.current = null;
              void refreshSession().then(() => loadSummary());
              invalidateTab("portfolio");
            }}
          />
        </DashboardShell>
      ) : null}
      <ReportDrawer
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        scan={null}
        reportStatus="checking"
        missingReason={null}
      />
    </div>
  );

  return savedKey ? (
    <QtanglProvider apiKey={savedKey} baseUrl={qtanglApiBaseUrl}>
      {dashboard}
    </QtanglProvider>
  ) : (
    dashboard
  );
}
