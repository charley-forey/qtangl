"use client";

import dynamic from "next/dynamic";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import RemediationBoard from "@/components/pqc/RemediationBoard";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import type { RemediateTabBundle } from "@/lib/dashboard-state";

const RemediationWhatIf = dynamic(() => import("@/components/pqc/RemediationWhatIf"));
const PeerComparisonPanel = dynamic(() => import("@/components/pqc/PeerComparisonPanel"));

type Props = {
  bundle: RemediateTabBundle | null;
  savedKey: string;
  jiraConfigured: boolean;
  remediationIdParam?: string | null;
};

export default function DashboardRemediateTab({
  bundle,
  savedKey,
  jiraConfigured,
  remediationIdParam,
}: Props) {
  const remediation = bundle?.remediationScan;

  return (
    <DashboardSection title="Remediation" id="dashboard-remediate">
      {remediation ? (
        <Card tone="panel">
          <Eyebrow>Top remediation priorities</Eyebrow>
          <RemediationBoard
            apiKey={savedKey}
            scanId={remediation.scanId}
            items={remediation.items}
            initialStatuses={remediation.statuses}
            jiraConfigured={jiraConfigured}
            highlightId={remediationIdParam ?? undefined}
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
          <p className="text-sm text-[var(--color-gray-400)]">Run a scan to populate remediation priorities.</p>
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
