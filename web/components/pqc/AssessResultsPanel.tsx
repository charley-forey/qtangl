"use client";

import Link from "next/link";

import { ASSESS_RESULT_TABS, scenarioIndustry, type AssessResultTab } from "@/lib/assess-config";
import type { PqcScanResponse, ReportAvailabilityResponse } from "@/lib/pqc";

import AssessReportHeader from "./AssessReportHeader";
import AssessUpsellBlock from "./AssessUpsellBlock";
import CompliancePanel from "./CompliancePanel";
import ExecutivePriorities from "./ExecutivePriorities";
import HandshakeProofPanel from "./HandshakeProofPanel";
import InventoryTable from "./InventoryTable";
import MigrationGantt from "./MigrationGantt";
import MoscaTimeline from "./MoscaTimeline";
import PublicPeerBandPanel from "./PublicPeerBandPanel";
import ReadinessGauge from "./ReadinessGauge";
import ReferencesPanel from "./ReferencesPanel";
import RemediationBacklog from "./RemediationBacklog";
import RemediationWhatIfPublic from "./RemediationWhatIfPublic";
import ReportFormatLinks from "./ReportFormatLinks";
import RiskQuadrant from "./RiskQuadrant";
import RiskScoreboardCard from "./RiskScoreboardCard";
import RoiCalculator from "./RoiCalculator";
import ScanCoverage from "./ScanCoverage";
import ScanLog from "./ScanLog";
import ScanProvenanceCard from "./ScanProvenanceCard";
import ScanResultsGuide from "./ScanResultsGuide";
import AssessShareLinkButton from "./AssessShareLinkButton";
import SeverityDonut from "./SeverityDonut";
import VulnerabilityCard from "./VulnerabilityCard";
import { PqcSection, PqcTabPanel, PqcTabs } from "./ui";

const TAB_LABELS: Record<AssessResultTab, string> = {
  executive: "Executive",
  compliance: "Compliance",
  inventory: "Inventory",
  remediation: "Remediation",
  technical: "Technical",
  evidence: "Evidence",
};

type AssessResultsPanelProps = {
  scan: PqcScanResponse;
  activeTab: AssessResultTab;
  onTabChange: (tab: AssessResultTab) => void;
  reportStatus: "ready" | "checking" | "unavailable";
  reportAvailability: ReportAvailabilityResponse | null;
  useFixture: boolean;
  useLiteScan: boolean;
  onError: (message: string) => void;
  onOpenDrawer: () => void;
  onRunComparisonScan: () => void;
  tenantApiKey: string | null;
};

export default function AssessResultsPanel({
  scan,
  activeTab,
  onTabChange,
  reportStatus,
  reportAvailability,
  useFixture,
  useLiteScan,
  onError,
  onOpenDrawer,
  onRunComparisonScan,
  tenantApiKey,
}: AssessResultsPanelProps) {
  const topAsset = scan.assets[0];
  const explanations = scan.report?.assetExplanations as Record<string, string> | undefined;
  const industry = scenarioIndustry(scan.scenario?.id ?? "bank-tls-inventory");

  const qualityIssues: string[] = [];
  if (scan.assets.length === 0) qualityIssues.push("No assets discovered.");
  if ((scan.timeline?.length ?? 0) === 0) qualityIssues.push("No timeline events captured.");
  if ((scan.remediationBacklog?.length ?? 0) === 0) qualityIssues.push("No remediation items generated.");
  if (reportStatus === "unavailable") qualityIssues.push("Report bundle is unavailable for this scan context.");

  const tabs = ASSESS_RESULT_TABS.map((id) => ({ id, label: TAB_LABELS[id] }));

  return (
    <div className="pqc-print-area space-y-6">
      <PqcTabs tabs={tabs} active={activeTab} onChange={onTabChange} />

      <PqcTabPanel id="assess-panel-executive" active={activeTab === "executive"} tabId="executive" className="pqc-print-tab-executive">
        <AssessReportHeader
          scanResponse={scan}
          reportStatus={reportStatus}
          reportAvailability={reportAvailability}
          onError={onError}
          onOpenDrawer={onOpenDrawer}
        />
        <ScanResultsGuide scan={scan} />
        <PqcSection title="Executive summary">
          <ExecutivePriorities summary={scan.report?.executiveSummary} />
        </PqcSection>
        <div className="grid gap-4 lg:grid-cols-2">
          <PqcSection title="Risk scoreboard">
            <RiskScoreboardCard scoreboard={scan.scoreboard} />
          </PqcSection>
          <PqcSection title="Industry peer band">
            <PublicPeerBandPanel
              score={scan.scoreboard.qtangl.readiness_score}
              industry={industry}
            />
          </PqcSection>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <PqcSection title="Readiness">
            <ReadinessGauge score={scan.scoreboard.qtangl.readiness_score} />
          </PqcSection>
          <PqcSection title="Mosca timeline">
            <MoscaTimeline mosca={scan.mosca} />
          </PqcSection>
          <PqcSection title="Severity mix">
            <SeverityDonut assets={scan.assets} />
          </PqcSection>
        </div>
        {topAsset && (
          <PqcSection title="Top vulnerability">
            <VulnerabilityCard asset={topAsset} explanation={explanations?.[topAsset.id]} />
          </PqcSection>
        )}
        <PqcSection title="Remediation preview">
          <RemediationBacklog items={scan.remediationBacklog} limit={8} />
        </PqcSection>
        <AssessUpsellBlock scan={scan} onRunComparisonScan={onRunComparisonScan} />
      </PqcTabPanel>

      <PqcTabPanel id="assess-panel-compliance" active={activeTab === "compliance"} tabId="compliance" className="pqc-print-tab-compliance">
        <PqcSection title="Compliance & frameworks">
          <CompliancePanel
            pack={scan.report?.compliancePack}
            summary={scan.report?.complianceSummary}
          />
        </PqcSection>
        <PqcSection title="Migration roadmap">
          <MigrationGantt
            milestones={
              scan.report?.migrationRoadmap as
                | Array<{ label: string; deadline: string; severity?: string }>
                | undefined
            }
          />
        </PqcSection>
        <PqcSection title="References & standards">
          <ReferencesPanel />
        </PqcSection>
      </PqcTabPanel>

      <PqcTabPanel id="assess-panel-inventory" active={activeTab === "inventory"} tabId="inventory">
        <PqcSection title="Algorithm rollup & inventory">
          <InventoryTable assets={scan.assets} explanations={explanations} />
        </PqcSection>
        <PqcSection title="Risk quadrant">
          <RiskQuadrant assets={scan.assets} />
        </PqcSection>
        {scan.scanCoverage && scan.scanCoverage.length > 0 && (
          <PqcSection title="Scan coverage (unreachable / errored)">
            <ScanCoverage entries={scan.scanCoverage} />
          </PqcSection>
        )}
      </PqcTabPanel>

      <PqcTabPanel id="assess-panel-remediation" active={activeTab === "remediation"} tabId="remediation">
        <PqcSection title="Remediation backlog">
          <RemediationBacklog items={scan.remediationBacklog} />
        </PqcSection>
        <PqcSection title="What-if readiness projection">
          <RemediationWhatIfPublic scanId={scan.scanId} items={scan.remediationBacklog} />
        </PqcSection>
        <RoiCalculator quantumVulnerable={scan.scoreboard.qtangl.quantum_vulnerable} />
      </PqcTabPanel>

      <PqcTabPanel id="assess-panel-technical" active={activeTab === "technical"} tabId="technical">
        <ScanProvenanceCard scan={scan} useFixture={useFixture} useLiteScan={useLiteScan} />
        <PqcSection title="Data quality">
          <p className="text-xs text-[var(--color-gray-400)]">
            Coverage confidence: {String(scan.report?.coverageConfidence ?? "n/a")} · Scan depth:{" "}
            {String(scan.report?.scanDepth ?? (useLiteScan ? "lite" : "standard"))}
          </p>
          {qualityIssues.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-200">
              {qualityIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-emerald-300">Quality checks passed for this scan result.</p>
          )}
        </PqcSection>
        <PqcSection title="Scan log">
          <ScanLog events={scan.timeline} isRunning={false} />
        </PqcSection>
        <PqcSection title="Post-quantum handshake proof">
          <HandshakeProofPanel proof={scan.handshakeProof} />
        </PqcSection>
      </PqcTabPanel>

      <PqcTabPanel id="assess-panel-evidence" active={activeTab === "evidence"} tabId="evidence">
        <PqcSection title="Export formats">
          <ReportFormatLinks
            scanId={scan.scanId}
            reportStatus={reportStatus}
            formats={["pdf", "cbom", "json", "csv", "bundle", "executive", "board", "auditor"]}
            variant="inline"
            onUnavailable={onError}
          />
        </PqcSection>
        <PqcSection title="Verify independently">
          <p className="text-sm text-[var(--color-gray-300)]">
            Share this verify link with auditors — no Qtangl account required.
          </p>
          <Link
            href={`/verify?scanId=${encodeURIComponent(scan.scanId)}`}
            className="mt-3 inline-block font-mono text-sm text-white underline"
          >
            /verify?scanId={scan.scanId}
          </Link>
        </PqcSection>
        <PqcSection title="Revisit this assessment">
          <p className="text-sm text-[var(--color-gray-300)]">
            Bookmark or share this session URL to reload results.
          </p>
          <AssessShareLinkButton scanId={scan.scanId} className="mt-3" />
        </PqcSection>
        {tenantApiKey ? (
          <PqcSection title="Tenant dashboard">
            <Link href={`/dashboard?scanId=${encodeURIComponent(scan.scanId)}`} className="text-sm text-white underline">
              View in dashboard →
            </Link>
          </PqcSection>
        ) : null}
        <p className="text-xs text-[var(--color-gray-500)]">
          Transparency log:{" "}
          <a href="/trust" className="text-white underline">
            /trust
          </a>
        </p>
      </PqcTabPanel>
    </div>
  );
}
