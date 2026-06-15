"use client";

import { useRef, useState } from "react";

import { ASSESS_PRODUCTION_MODE_ENABLED } from "@/lib/assess-config";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import { useQtanglApi } from "@/lib/qtangl-api-context";

import AssessResultsPanel from "./AssessResultsPanel";
import AssessWizard from "./AssessWizard";
import InventoryHeatmap from "./InventoryHeatmap";
import ProductionModeBanner from "./ProductionModeBanner";
import ReportDrawer from "./ReportDrawer";
import TenantKeyStrip from "./TenantKeyStrip";
import { PqcSection } from "./ui";
import { useAssessScan } from "./useAssessScan";

type Props = {
  initialInventory: CryptoAsset[];
  initialScenarios: Scenario[];
  backendConnected: boolean;
  backendMessage: string | null;
  apiBaseUrl: string;
  compact?: boolean;
  basePath?: string;
  syncUrlEnabled?: boolean;
};

export default function QDayCommandCenter({
  initialInventory,
  initialScenarios,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
  compact = false,
  basePath = "/assess",
  syncUrlEnabled = true,
}: Props) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const { mode, apiKey, tenantApiKey, setTenantApiKey } = useQtanglApi();
  const isProduction = mode === "production" && ASSESS_PRODUCTION_MODE_ENABLED;

  const scan = useAssessScan({
    initialInventory,
    initialScenarios,
    initialBackendConnected,
    initialBackendMessage,
    assessMode: isProduction ? "production" : "demo",
    apiKey: isProduction ? apiKey : undefined,
    basePath,
    syncUrlEnabled,
  });

  const {
    inventory,
    scenarios,
    backendConnected,
    backendMessage,
    activeScenarioId,
    activeScenario,
    useFixture,
    setUseFixture,
    authorized,
    setAuthorized,
    customDomain,
    setCustomDomain,
    industry,
    setIndustry,
    authorizedDomains,
    setBundleSession,
    scanResponse,
    isScanning,
    error,
    setError,
    scanProgress,
    scanTimeline,
    isAutorunActive,
    useLiteScan,
    setUseLiteScan,
    reportAvailability,
    reportStatus,
    urlSynced,
    activeTab,
    changeTab,
    wizardStep,
    setWizardStep,
    wizardCollapsed,
    setWizardCollapsed,
    handleScan,
    selectScenario,
  } = scan;

  async function onRunScan() {
    await handleScan("manual");
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function onRunComparisonScan() {
    void handleScan("manual");
  }

  return (
    <div className="space-y-6">
      {!compact && isProduction ? (
        <ProductionModeBanner />
      ) : !compact ? (
        <ProductModeBanner mode="live" />
      ) : null}

      {!isProduction ? <TenantKeyStrip onKeyChange={setTenantApiKey} /> : null}

      {!backendConnected && backendMessage && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <p>Offline fallback: {backendMessage}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <button type="button" className="underline" onClick={() => window.location.reload()}>
              Retry connection
            </button>
            <a href="/status" className="underline">
              System status
            </a>
          </div>
        </div>
      )}

      {isAutorunActive && isScanning && !isProduction && (
        <div
          role="status"
          className="rounded-lg border border-sky-500/30 bg-sky-950/40 px-4 py-3 text-sm text-sky-100"
        >
          Running demo scan for <span className="font-medium text-white">{activeScenario.title}</span>
          … Results will appear below when complete.
        </div>
      )}

      <AssessWizard
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        activeScenario={activeScenario}
        wizardStep={wizardStep}
        onWizardStep={setWizardStep}
        onSelectScenario={selectScenario}
        customDomain={customDomain}
        onCustomDomainChange={setCustomDomain}
        authorized={authorized}
        onAuthorizedChange={setAuthorized}
        useFixture={useFixture}
        onUseFixtureChange={setUseFixture}
        useLiteScan={useLiteScan}
        onUseLiteScanChange={setUseLiteScan}
        urlSynced={urlSynced}
        onBundleUploaded={setBundleSession}
        isScanning={isScanning}
        scanProgress={scanProgress}
        timeline={scanTimeline.length > 0 ? scanTimeline : scanResponse?.timeline}
        onRunScan={onRunScan}
        collapsed={wizardCollapsed}
        onExpand={() => {
          setWizardCollapsed(false);
          setWizardStep(1);
        }}
        assessMode={isProduction ? "production" : "demo"}
        industry={industry}
        onIndustryChange={setIndustry}
        authorizedDomains={authorizedDomains}
        uploadApiKey={isProduction ? apiKey : undefined}
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <p>{error}</p>
          <button type="button" className="mt-2 text-xs underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {scanResponse && (
        <div ref={resultsRef}>
          <AssessResultsPanel
            scan={scanResponse}
            activeTab={activeTab}
            onTabChange={changeTab}
            reportStatus={reportStatus}
            reportAvailability={reportAvailability}
            useFixture={useFixture}
            useLiteScan={useLiteScan}
            onError={setError}
            onOpenDrawer={() => setReportOpen(true)}
            onRunComparisonScan={onRunComparisonScan}
            tenantApiKey={isProduction ? tenantApiKey : null}
            assessMode={isProduction ? "production" : "demo"}
            reportApiKey={isProduction ? apiKey : undefined}
          />
        </div>
      )}

      {!scanResponse && inventory.length > 0 && !isScanning && !isProduction && (
        <PqcSection title="Fixture inventory preview">
          <InventoryHeatmap assets={inventory.slice(0, 4)} />
        </PqcSection>
      )}

      {!compact && !isProduction && (
        <p className="text-center text-xs text-[var(--color-gray-500)]">
          Production customers: check your welcome email for dashboard access.
        </p>
      )}

      <ReportDrawer
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        scan={scanResponse}
        reportStatus={reportStatus}
        missingReason={reportAvailability?.missingReason ?? null}
      />
    </div>
  );
}
