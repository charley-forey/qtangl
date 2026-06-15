"use client";

import { useRef, useState } from "react";

import { getStoredTenantApiKey } from "@/lib/tenant-api";
import type { CryptoAsset, Scenario } from "@/lib/pqc";

import AssessResultsPanel from "./AssessResultsPanel";
import AssessWizard from "./AssessWizard";
import InventoryHeatmap from "./InventoryHeatmap";
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
};

export default function QDayCommandCenter({
  initialInventory,
  initialScenarios,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
}: Props) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [tenantApiKey, setTenantApiKey] = useState<string | null>(() => getStoredTenantApiKey());

  const scan = useAssessScan({
    initialInventory,
    initialScenarios,
    initialBackendConnected,
    initialBackendMessage,
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
      <TenantKeyStrip onKeyChange={setTenantApiKey} />

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

      {isAutorunActive && isScanning && (
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
            tenantApiKey={tenantApiKey}
          />
        </div>
      )}

      {!scanResponse && inventory.length > 0 && !isScanning && (
        <PqcSection title="Fixture inventory preview">
          <InventoryHeatmap assets={inventory.slice(0, 4)} />
        </PqcSection>
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
