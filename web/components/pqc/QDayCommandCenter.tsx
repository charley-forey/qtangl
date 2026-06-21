"use client";

import { useRef, useState, useEffect } from "react";

import {
  ASSESS_MSSP_WHITELABEL,
  ASSESS_PRODUCTION_MODE_ENABLED,
} from "@/lib/assess-config";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import Card from "@/components/ui/Card";
import type { CryptoAsset, Scenario } from "@/lib/pqc";
import { useQtanglApi } from "@/lib/qtangl-api-context";
import { useUpgradeGate } from "@/hooks/useUpgradeGate";

import AssessIntentPicker from "./AssessIntentPicker";
import AssessMsspBanner from "./AssessMsspBanner";
import AssessResultsPanel from "./AssessResultsPanel";
import AssessScanError from "./AssessScanError";
import AssessUpgradePrompt from "./AssessUpgradePrompt";
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
  canAdminDomains?: boolean;
  useBffForDomains?: boolean;
  onDomainsChange?: (domains: string[]) => void;
  onMessage?: (message: string) => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  onRefresh?: () => void;
};

export default function QDayCommandCenter({
  initialInventory,
  initialScenarios,
  backendConnected: initialBackendConnected,
  backendMessage: initialBackendMessage,
  compact = false,
  basePath = "/assess",
  syncUrlEnabled = true,
  canAdminDomains = false,
  useBffForDomains = false,
  onDomainsChange,
  onMessage,
  onOpenUpgrade,
  onRefresh,
}: Props) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const { mode, apiKey, tenantApiKey, setTenantApiKey } = useQtanglApi();
  const { upgradeOpen, upgradeProduct: modalUpgradeProduct, openUpgrade, closeUpgrade } = useUpgradeGate();
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
    uploadDiscovery,
    reloadAuthorizedDomains,
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
    intent,
    setIntent,
    showCustomize,
    setShowCustomize,
    applyLiveDemoPreset,
    quickStartSample,
    quickStartLiveDemo,
    errorKind,
    blockedDomain,
    upgradeProduct: scanUpgradeProduct,
    clearUpgradeProduct,
  } = scan;

  useEffect(() => {
    if (!scanUpgradeProduct) return;
    openUpgrade(scanUpgradeProduct);
    clearUpgradeProduct();
  }, [scanUpgradeProduct, openUpgrade, clearUpgradeProduct]);

  async function onRunScan() {
    await handleScan("manual");
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function onRunComparisonScan() {
    void handleScan("manual").then(() => {
      document.querySelector("[data-assess-upsell]")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  const scannerBody = (
    <div className="space-y-6">
      {ASSESS_MSSP_WHITELABEL ? <AssessMsspBanner /> : null}
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

      {!isProduction && !wizardCollapsed && !scanResponse ? (
        <AssessIntentPicker
          activeIntent={intent}
          onIntentChange={setIntent}
          onQuickSample={quickStartSample}
          onQuickLiveDemo={quickStartLiveDemo}
          isScanning={isScanning}
          showCustomize={showCustomize}
          onToggleCustomize={() => setShowCustomize((value) => !value)}
        />
      ) : null}

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
        uploadDiscovery={uploadDiscovery}
        canAdminDomains={canAdminDomains}
        useBffForDomains={useBffForDomains}
        onDomainsChange={(domains) => {
          void reloadAuthorizedDomains();
          onDomainsChange?.(domains);
        }}
        onMessage={onMessage}
        onOpenUpgrade={onOpenUpgrade}
        onRefresh={onRefresh}
        isScanning={isScanning}
        scanProgress={scanProgress}
        timeline={scanTimeline.length > 0 ? scanTimeline : (scanResponse?.timeline ?? [])}
        onRunScan={onRunScan}
        collapsed={wizardCollapsed}
        onExpand={() => {
          setWizardCollapsed(false);
          setWizardStep(1);
          setShowCustomize(intent !== "my-domain");
        }}
        assessMode={isProduction ? "production" : "demo"}
        industry={industry}
        onIndustryChange={setIndustry}
        authorizedDomains={authorizedDomains}
        uploadApiKey={isProduction ? apiKey : undefined}
        intent={intent}
        onApplyLiveDemoPreset={applyLiveDemoPreset}
        showCustomize={showCustomize || isProduction}
      />

      {error ? (
        <AssessScanError
          message={error}
          kind={errorKind}
          blockedDomain={blockedDomain ?? undefined}
          onDismiss={() => setError(null)}
        />
      ) : null}

      {scanResponse ? (
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
            tenantApiKey={tenantApiKey ?? (isProduction ? apiKey : null)}
            assessMode={isProduction ? "production" : "demo"}
            reportApiKey={isProduction ? apiKey : tenantApiKey ?? undefined}
          />
        </div>
      ) : null}

      {!scanResponse && inventory.length > 0 && !isScanning && !isProduction && (
        <PqcSection title="Fixture inventory preview">
          <InventoryHeatmap assets={inventory.slice(0, 4)} />
        </PqcSection>
      )}

      {!compact && !isProduction ? (
        <p className="text-center text-xs text-[var(--color-gray-500)]">
          Production customers:{" "}
          <a href="/assess/start" className="underline text-white">
            start an authorized workspace
          </a>{" "}
          or check your welcome email for dashboard access.
        </p>
      ) : null}

      <ReportDrawer
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        scan={scanResponse}
        reportStatus={reportStatus}
        missingReason={reportAvailability?.missingReason ?? null}
      />
      <AssessUpgradePrompt
        open={upgradeOpen}
        product={modalUpgradeProduct}
        onClose={closeUpgrade}
        onMessage={setError}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {!compact && isProduction ? (
        <ProductionModeBanner />
      ) : !compact ? (
        <ProductModeBanner mode="live" />
      ) : null}

      {compact ? (
        scannerBody
      ) : (
        <Card tone="strong" className="rounded-[var(--radius-xl)] p-6">
          {scannerBody}
        </Card>
      )}
    </div>
  );
}
