"use client";

import Button from "@/components/ui/Button";
import { WIZARD_STEPS } from "@/lib/assess-config";
import type { Scenario } from "@/lib/pqc";
import { trackEvent } from "@/lib/analytics";

import AssessDiscoveryScope from "./AssessDiscoveryScope";
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
  onBundleUploaded: (sessionId: string) => void;
  isScanning: boolean;
  scanProgress: string | null;
  timeline: Array<{ label?: string }> | undefined;
  onRunScan: () => void;
  collapsed: boolean;
  onExpand: () => void;
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
  isScanning,
  scanProgress,
  timeline,
  onRunScan,
  collapsed,
  onExpand,
}: AssessWizardProps) {
  if (collapsed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-sm text-[var(--color-gray-300)]">
          Assessment configured: <span className="text-white">{activeScenario.title}</span>
        </p>
        <Button variant="secondary" size="sm" onClick={onExpand}>
          New assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pqc-print-hide">
      <DemoGuideStrip />
      <div className="flex flex-wrap gap-2">
        {WIZARD_STEPS.map((step) => (
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

      {wizardStep === 1 && (
        <div className="space-y-4">
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
            <Button onClick={() => onWizardStep(2)}>Next: Target</Button>
          </div>
        </div>
      )}

      {wizardStep === 2 && (
        <div className="space-y-4">
          <ScanTargetCard
            target={activeScenario.target}
            authorized={authorized}
            onAuthorizedChange={onAuthorizedChange}
            customDomain={customDomain}
            onCustomDomainChange={onCustomDomainChange}
          />
          {!useFixture && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
              Live scan connects to real endpoints. Confirm you are authorized to scan the target domain.
              See our{" "}
              <a href="/terms" className="underline">
                Terms
              </a>{" "}
              for acceptable use.
            </p>
          )}
          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(1)}>
              Back
            </Button>
            <Button onClick={() => onWizardStep(3)}>Next: Scope</Button>
          </div>
        </div>
      )}

      {wizardStep === 3 && (
        <div className="space-y-4">
          <AssessDiscoveryScope />
          <CloudInventoryUploadCard
            onUploaded={(sessionId) => {
              onBundleUploaded(sessionId);
              trackEvent("pqc_bundle_uploaded", { sessionId });
            }}
          />
          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => onWizardStep(2)}>
              Back
            </Button>
            <Button onClick={() => onWizardStep(4)}>Next: Run</Button>
          </div>
        </div>
      )}

      {wizardStep === 4 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-black/20 p-4 text-sm text-[var(--color-gray-300)]">
            <p>
              <span className="text-white">Scenario:</span> {activeScenario.title}
            </p>
            <p className="mt-2">
              <span className="text-white">Target:</span> {customDomain || activeScenario.target.domain}
            </p>
            <p className="mt-2">
              <span className="text-white">Mode:</span> {useFixture ? "Fixture (recommended)" : "Live scan"}
            </p>
          </div>
          <PqcCollapsibleSection title="Advanced options">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
                <input
                  type="checkbox"
                  checked={urlSynced ? useFixture : true}
                  onChange={(e) => {
                    const fixture = e.target.checked;
                    onUseFixtureChange(fixture);
                    if (fixture) onAuthorizedChange(false);
                  }}
                />
                Fixture mode (no outbound network)
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
                <input
                  type="checkbox"
                  checked={useLiteScan}
                  onChange={(e) => onUseLiteScanChange(e.target.checked)}
                />
                Lite scan (subset of findings)
              </label>
              <BundleUploader onUploaded={onBundleUploaded} />
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
            <Button variant="secondary" onClick={() => onWizardStep(3)}>
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
