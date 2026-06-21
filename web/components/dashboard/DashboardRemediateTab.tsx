"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ConvertExpectationsPanel from "@/components/dashboard/ConvertExpectationsPanel";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import RemediationBoard from "@/components/pqc/RemediationBoard";
import { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import FrameworkDeadlineRoadmap from "@/components/dashboard/FrameworkDeadlineRoadmap";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
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
  maturityStage?: number;
  onTabChange?: (tab: DashboardTabId) => void;
  onOpenUpgrade?: (product: "assess" | "monitor" | "convert") => void;
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
  maturityStage,
  onTabChange,
  onOpenUpgrade,
}: Props) {
  const router = useRouter();
  const [selectedScanId, setSelectedScanId] = useState(scanIdParam ?? allScans[0]?.scanId ?? "");
  const remediation = bundle?.remediationScan;
  const velocity = bundle?.remediationVelocity;

  return (
    <DashboardSection title="Remediation" id="dashboard-remediate">
      {!remediationProgramEnabled ? (
        <Card tone="panel">
          <Eyebrow>Convert program features</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            Migration waves, verify-fix loops, and program velocity reporting unlock on Convert tier.
          </p>
          <button
            type="button"
            className="mt-3 text-sm underline"
            onClick={() => onOpenUpgrade?.("convert")}
          >
            Learn about Convert
          </button>
        </Card>
      ) : null}
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
      <ConvertExpectationsPanel maturityStage={maturityStage} />
      {allScans.length > 1 ? (
        <Card tone="panel">
          <Eyebrow>Baseline scan</Eyebrow>
          <select
            className="mt-2 w-full max-w-md rounded border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-sm text-white"
            value={selectedScanId}
            onChange={(e) => {
              setSelectedScanId(e.target.value);
              router.push(`/dashboard?tab=remediate&scanId=${encodeURIComponent(e.target.value)}`);
              onTabChange?.("remediate");
            }}
          >
            {allScans.map((scan) => (
              <option key={scan.scanId} value={scan.scanId}>
                {scan.label}
              </option>
            ))}
          </select>
        </Card>
      ) : null}
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
      {velocity ? (
        <Card tone="panel">
          <Eyebrow>Remediation velocity</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-300)]">
            {velocity.closedCount} closed · {velocity.openCount} open
          </p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="bg-emerald-400"
              style={{
                width: `${Math.round((velocity.closedCount / Math.max(1, velocity.closedCount + velocity.openCount)) * 100)}%`,
              }}
            />
          </div>
        </Card>
      ) : null}
    </DashboardSection>
  );
}
