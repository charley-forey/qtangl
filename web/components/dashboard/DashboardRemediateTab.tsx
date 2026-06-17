"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import RemediationBoard from "@/components/pqc/RemediationBoard";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import FrameworkDeadlineRoadmap from "@/components/dashboard/FrameworkDeadlineRoadmap";
import type { RemediateTabBundle } from "@/lib/dashboard-state";

const RemediationWhatIf = dynamic(() => import("@/components/pqc/RemediationWhatIf"));
const PeerComparisonPanel = dynamic(() => import("@/components/pqc/PeerComparisonPanel"));
const RemediationProgramBoard = dynamic(() => import("@/components/pqc/RemediationProgramBoard"));

type Props = {
  bundle: RemediateTabBundle | null;
  savedKey: string;
  jiraConfigured: boolean;
  scanIdParam?: string;
  remediationIdParam?: string | null;
  actionParam?: string | null;
  allScans?: Array<{ scanId: string; label: string }>;
  remediationProgramEnabled?: boolean;
  convertTier?: boolean;
  latestReadiness?: number | null;
  trend?: import("@/lib/dashboard-state").DashboardSummary["trend"];
};

export default function DashboardRemediateTab({
  bundle,
  savedKey,
  jiraConfigured,
  scanIdParam,
  remediationIdParam,
  actionParam,
  allScans = [],
  remediationProgramEnabled,
  convertTier,
  latestReadiness,
  trend = [],
}: Props) {
  const remediation = bundle?.remediationScan;

  return (
    <DashboardSection title="Remediation" id="dashboard-remediate">
      {remediationProgramEnabled ? (
        <Card tone={convertTier ? "feature" : "panel"} className={convertTier ? "border border-[var(--border-strong)]" : undefined}>
          <Eyebrow>{convertTier ? "Convert remediation program" : "Program view"}</Eyebrow>
          {convertTier ? (
            <p className="mt-2 text-sm text-[var(--color-gray-300)]">
              Track migration waves, owners, and verify-fix evidence across your PQC program.
            </p>
          ) : null}
          <div className="mt-4">
            <RemediationProgramBoard />
          </div>
        </Card>
      ) : null}
      <FrameworkDeadlineRoadmap readinessScore={latestReadiness} trend={trend} />
      {remediation ? (
        <Card tone="panel" data-tour="remediation-board">
          <Eyebrow>Top remediation priorities</Eyebrow>
          <RemediationBoard
            apiKey={savedKey}
            scanId={remediation.scanId}
            items={remediation.items}
            initialStatuses={remediation.statuses}
            jiraConfigured={jiraConfigured}
            highlightId={remediationIdParam ?? undefined}
            actionParam={actionParam ?? undefined}
            allScans={allScans}
          />
          <div className="mt-6">
            <RemediationWhatIf apiKey={savedKey} scanId={remediation.scanId} items={remediation.items} />
          </div>
          <div className="mt-6">
            <PeerComparisonPanel apiKey={savedKey} />
          </div>
        </Card>
      ) : (
        <Card tone="ghost">
          <p className="text-sm text-[var(--color-gray-400)]">
            {scanIdParam
              ? "Loading remediation data for selected scan…"
              : "Run a scan to populate remediation priorities."}
          </p>
        </Card>
      )}
      {bundle?.remediationVelocity ? (
        <Card tone="panel">
          <Eyebrow>Remediation velocity</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            {bundle.remediationVelocity.closedCount} closed · {bundle.remediationVelocity.openCount} open
          </p>
        </Card>
      ) : null}
    </DashboardSection>
  );
}
