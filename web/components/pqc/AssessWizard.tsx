"use client";

import Button from "@/components/ui/Button";
import type { AssessApiMode } from "@/lib/qtangl-api-context";
import {
  ASSESS_INTENT_STEPS,
  ASSESS_CBOM_IMPORT_ENABLED,
  ASSESS_PORTFOLIO_ENABLED,
  ASSESS_AI_NARRATIVE_ENABLED,
  type AssessIntent,
} from "@/lib/assess-config";
import type { Scenario } from "@/lib/pqc";
import { trackEvent } from "@/lib/analytics";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";

import AssessDiscoveryScope from "./AssessDiscoveryScope";
import AssessModeToggle from "./AssessModeToggle";
import AssessMyDomainPanel from "./AssessMyDomainPanel";
import AssessPortfolioPanel from "./AssessPortfolioPanel";
import AssessAiBriefCard from "./AssessAiBriefCard";
import AuthorizedDomainsPanel from "./AuthorizedDomainsPanel";
import UploadDomainSuggestPanel from "@/components/dashboard/UploadDomainSuggestPanel";
import CbomImportPanel from "./CbomImportPanel";
import CloudInventoryUploadCard from "./CloudInventoryUploadCard";
import DemoGuideStrip from "./DemoGuideStrip";
import ScanLog from "./ScanLog";
import ScanTargetCard from "./ScanTargetCard";
import ScenarioPicker from "./ScenarioPicker";
import { PqcCollapsibleSection } from "./ui";
import BundleUploader from "./BundleUploader";

type AssessWizardProps = {
  scenarios: Scenario[];
  activeScenarioId: string;
  activeScenario: Scenario;
  wizardStep: number;
  onWizardStep: (step: number) => void;
  onSelectScenario: (id: string) => void;
  customDomain: string;
  onCustomDomainChange: (value: string) => void;
  authorized: boolean;
  onAuthorizedChange: (value: boolean) => void;
  useFixture: boolean;
  onUseFixtureChange: (value: boolean) => void;
  useLiteScan: boolean;
  onUseLiteScanChange: (value: boolean) => void;
  urlSynced: boolean;
  onBundleUploaded: (sessionId: string, discovery?: {
    discoveredHosts?: string[];
    suggestedDomains?: string[];
    alreadyAuthorized?: string[];
  }) => void;
  uploadDiscovery?: {
    discoveredHosts?: string[];
    suggestedDomains?: string[];
    alreadyAuthorized?: string[];
  } | null;
  canAdminDomains?: boolean;
  useBffForDomains?: boolean;
  onDomainsChange?: (domains: string[]) => void;
  onMessage?: (message: string) => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  onRefresh?: () => void;
  isScanning: boolean;
  scanProgress: string | null;
  timeline: Array<{ label?: string }> | undefined;
  onRunScan: () => void;
  collapsed: boolean;
  onExpand: () => void;
  assessMode?: AssessApiMode;
  industry?: string;
  onIndustryChange?: (value: string) => void;
  authorizedDomains?: string[];
  uploadApiKey?: string;
  intent?: AssessIntent;
  onApplyLiveDemoPreset?: () => void;
  showCustomize?: boolean;
};

export default function AssessWizard({
  scenarios,
  activeScenarioId,
  activeScenario,
  wizardStep,
  onWizardStep,
  onSelectScenario,
  customDomain,
  onCustomDomainChange,
  authorized,
  onAuthorizedChange,
  useFixture,
  onUseFixtureChange,
  useLiteScan,
  onUseLiteScanChange,
  urlSynced,
  onBundleUploaded,
  uploadDiscovery,
  canAdminDomains = false,
  useBffForDomains = false,
  onDomainsChange,
  onMessage,
  onOpenUpgrade,
  onRefresh,
  isScanning,
  scanProgress,
  timeline,
  onRunScan,
  collapsed,
  onExpand,
  assessMode = "demo",
  industry = "financial",
  onIndustryChange,
  authorizedDomains = [],
  uploadApiKey,
  intent = "sample",
  onApplyLiveDemoPreset,
  showCustomize = false,
}: AssessWizardProps) {
  const isProduction = assessMode === "production";
  const wizardSteps = isProduction
    ? [
        { id: 1, label: "Upload or domain" },
        { id: 2, label: "Scope" },
        { id: 3, label: "Run" },
      ]
    : ASSESS_INTENT_STEPS[intent];

  if (collapsed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-sm text-[var(--color-gray-300)]">
          Assessment configured: <span className="text-white">{activeScenario.title}</span>
          {!useFixture && customDomain ? (
            <span className="text-[var(--color-gray-500)]"> · {customDomain}</span>
          ) : null}
        </p>
        <Button variant="secondary" size="sm" onClick={onExpand}>
          New assessment
        </Button>
      </div>
    );
  }

  if (!isProduction && intent === "my-domain") {
    return <AssessMyDomainPanel />;
  }

  if (!isProduction && !showCustomize) {
    return null;
  }

  const guideIntent = intent === "live-demo" ? "live-demo" : "sample";

  return (
    <div className="space-y-6 pqc-print-hide">
      {!isProduction ? <DemoGuideStrip intent={guideIntent} /> : null}

      {ASSESS_PORTFOLIO_ENABLED && uploadApiKey ? (
        <AssessPortfolioPanel apiKey={uploadApiKey} />
      ) : null}

      {wizardSteps.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {wizardSteps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onWizardStep(step.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                wizardStep === step.id
                  ? "border-white bg-white text-black"
                  : "border-[var(--color-border)] text-[var(--color-gray-400)] hover:text-white"
              }`}
            >
              {step.id}. {step.label}
            </button>
          ))}
        </div>
      ) : null}

      {isProduction && wizardStep === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-gray-400)]">
            Upload certificates for air-gapped baselines, or select an authorized domain for live scan.
          </p>
          <CloudInventoryUploadCard
            apiKey={uploadApiKey}
            onUploaded={(sessionId, discovery) => {
              onBundleUploaded(sessionId, discovery);
              trackEvent("pqc_bundle_uploaded", { sessionId, assessMode: "production" });
            }}
          />
          {uploadDiscovery?.discoveredHosts?.length ||
          uploadDiscovery?.suggestedDomains?.length ||
          uploadDiscovery?.alreadyAuthorized?.length ? (
            <UploadDomainSuggestPanel
              discoveredHosts={uploadDiscovery?.discoveredHosts ?? []}
              suggestedDomains={uploadDiscovery?.suggestedDomains ?? []}
              alreadyAuthorized={uploadDiscovery?.alreadyAuthorized ?? []}
              authorizedDomains={authorizedDomains}
              industry={industry}
              canAdmin={canAdminDomains}
              useBff={useBffForDomains}
              apiKey={uploadApiKey}
              onMessage={onMessage}
              onDomainsChange={onDomainsChange}
              onOpenUpgrade={onOpenUpgrade}
              onRefresh={onRefresh}
            />
          ) : null}
          <AuthorizedDomainsPanel
            domains={authorizedDomains}
            selectedDomain={customDomain}
            onSelectDomain={onCustomDomainChange}
            industry={industry}
            onIndustryChange={onIndustryChange ?? (() => {})}
          />
          <div className="flex justify-end">
            <Button onClick={() => onWizardStep(2)}>Next: Scope</Button>
          </div>
        </div>
      )}

      {isProduction && wizardStep === 2 && (
        <div className="space-y-4">
          <AssessDiscoveryScope />
          {ASSESS_CBOM_IMPORT_ENABLED && uploadApiKey ? (
            <CbomImportPanel apiKey={uploadApiKey} />
          ) : null}
          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(1)}>
              Back
            </Button>
            <Button onClick={() => onWizardStep(3)}>Next: Run</Button>
          </div>
        </div>
      )}

      {isProduction && wizardStep === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-black/20 p-4 text-sm text-[var(--color-gray-300)]">
            <p>
              <span className="text-white">Industry:</span> {industry}
            </p>
            <p className="mt-2">
              <span className="text-white">Target:</span>{" "}
              {customDomain || (authorizedDomains[0] ?? "Certificate bundle upload")}
            </p>
            <p className="mt-2">
              <span className="text-white">Mode:</span> Production baseline
            </p>
          </div>
          {isScanning && (
            <div className="rounded-lg border border-[var(--color-border)] p-4">
              <p className="text-sm text-white">{scanProgress ?? "Scanning…"}</p>
              <div className="mt-3">
                <ScanLog events={timeline as never} isRunning={isScanning} />
              </div>
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(2)}>
              Back
            </Button>
            <Button onClick={onRunScan} disabled={isScanning}>
              {isScanning ? (scanProgress ?? "Scanning…") : "Run production baseline"}
            </Button>
          </div>
        </div>
      )}

      {!isProduction && intent === "sample" && wizardStep === 1 && (
        <div className="space-y-4">
          <AssessModeToggle
            useFixture={urlSynced ? useFixture : true}
            onUseFixtureChange={(fixture) => {
              if (!fixture) {
                onApplyLiveDemoPreset?.();
                return;
              }
              onUseFixtureChange(true);
              onAuthorizedChange(false);
            }}
            onApplyOqsPreset={onApplyLiveDemoPreset}
            showOqsPreset
          />
          <p className="text-sm text-[var(--color-gray-400)]">Pick a regulated scenario or industry baseline.</p>
          <ScenarioPicker
            scenarios={scenarios}
            activeId={activeScenarioId}
            onSelect={(id) => {
              onSelectScenario(id);
              trackEvent("scenario_changed", { scenarioId: id });
            }}
          />
          <div className="flex justify-end">
            <Button onClick={() => onWizardStep(2)}>Next: Scope</Button>
          </div>
        </div>
      )}

      {!isProduction && intent === "live-demo" && wizardStep === 1 && (
        <div className="space-y-4">
          <AssessModeToggle
            useFixture={false}
            onUseFixtureChange={(fixture) => onUseFixtureChange(fixture)}
            onApplyOqsPreset={onApplyLiveDemoPreset}
            showOqsPreset
            disabled
          />
          <ScanTargetCard
            target={activeScenario.target}
            authorized={authorized}
            onAuthorizedChange={onAuthorizedChange}
            customDomain={customDomain}
            onCustomDomainChange={onCustomDomainChange}
            useFixture={false}
            onApplyOqsPreset={onApplyLiveDemoPreset}
          />
          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(1)} disabled>
              Back
            </Button>
            <Button onClick={() => onWizardStep(2)} disabled={!authorized}>
              Next: Scope
            </Button>
          </div>
        </div>
      )}

      {!isProduction && wizardStep === 2 && (
        <div className="space-y-4">
          <AssessDiscoveryScope />
          {intent === "sample" ? (
            <CloudInventoryUploadCard
              apiKey={uploadApiKey}
              onUploaded={(sessionId) => {
                onBundleUploaded(sessionId);
                trackEvent("pqc_bundle_uploaded", { sessionId });
              }}
            />
          ) : null}
          {ASSESS_CBOM_IMPORT_ENABLED && uploadApiKey ? (
            <CbomImportPanel apiKey={uploadApiKey} />
          ) : null}
          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(1)}>
              Back
            </Button>
            <Button onClick={() => onWizardStep(3)}>Next: Run</Button>
          </div>
        </div>
      )}

      {!isProduction && wizardStep === 3 && (
        <div className="space-y-4">
          {ASSESS_AI_NARRATIVE_ENABLED && uploadApiKey ? (
            <AssessAiBriefCard apiKey={uploadApiKey} />
          ) : null}
          <div className="rounded-lg border border-[var(--color-border)] bg-black/20 p-4 text-sm text-[var(--color-gray-300)]">
            <p>
              <span className="text-white">Scenario:</span> {activeScenario.title}
            </p>
            <p className="mt-2">
              <span className="text-white">Target:</span>{" "}
              {useFixture ? `${activeScenario.target.domain} (fixture)` : customDomain || activeScenario.target.domain}
            </p>
            <p className="mt-2">
              <span className="text-white">Mode:</span> {useFixture ? "Fixture (offline sample)" : "Live scan"}
            </p>
          </div>
          <PqcCollapsibleSection title="Advanced options">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
                <input
                  type="checkbox"
                  checked={useLiteScan}
                  onChange={(e) => onUseLiteScanChange(e.target.checked)}
                />
                Lite scan (subset of findings)
              </label>
              <BundleUploader
                apiKey={uploadApiKey}
                onUploaded={(sessionId) => onBundleUploaded(sessionId)}
              />
            </div>
          </PqcCollapsibleSection>
          {isScanning && (
            <div className="rounded-lg border border-[var(--color-border)] p-4">
              <p className="text-sm text-white">{scanProgress ?? "Scanning…"}</p>
              <div className="mt-3">
                <ScanLog events={timeline as never} isRunning={isScanning} />
              </div>
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(2)}>
              Back
            </Button>
            <Button onClick={onRunScan} disabled={isScanning || (!useFixture && !authorized)}>
              {isScanning ? (scanProgress ?? "Scanning…") : "Run Q-Day scan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
