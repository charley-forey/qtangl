"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ConvertExpectationsPanel from "@/components/dashboard/ConvertExpectationsPanel";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import RemediationBoard from "@/components/pqc/RemediationBoard";
import { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import FrameworkDeadlineRoadmap from "@/components/dashboard/FrameworkDeadlineRoadmap";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { RemediateTabBundle } from "@/lib/dashboard-state";
import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";
import { RemediationVelocityChart } from "@/components/dashboard/charts/CommandCenterCharts";
import CcGantt, { type GanttItem } from "@/components/dashboard/charts/CcGantt";
import CcSankey, { type SankeyLink, type SankeyNode } from "@/components/dashboard/charts/CcSankey";

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
  const ccV2 = useCommandCenterV2();

  const items = remediation?.items ?? [];
  const statuses = remediation?.statuses ?? [];
  const statusMap = new Map(statuses.map((s) => [s.remediationId, (s.status ?? "open").toLowerCase()]));
  const DONE = new Set(["done", "closed", "verified", "resolved", "complete"]);

  // Honest SLA heuristic: high/critical items still open are past their
  // recommended remediation window. We do not have a formal per-item SLA clock.
  const slaAtRisk = items.filter((item) => {
    const status = statusMap.get(item.id) ?? "open";
    const sev = (item.severity ?? "").toLowerCase();
    return !DONE.has(status) && (sev === "critical" || sev === "high");
  });

  const currentYear = new Date().getFullYear();
  const SEVERITY_WINDOW: Record<string, number> = { critical: 1, high: 3, medium: 6, low: 10 };
  const ganttItems: GanttItem[] = items.slice(0, 12).map((item) => {
    const sev = (item.severity ?? "medium").toLowerCase();
    const status = statusMap.get(item.id) ?? "open";
    return {
      id: item.id,
      label: item.title,
      startYear: currentYear,
      endYear: currentYear + (SEVERITY_WINDOW[sev] ?? 6),
      progressPct: DONE.has(status) ? 100 : 0,
    };
  });

  const severities = Array.from(new Set(items.map((i) => (i.severity ?? "medium").toLowerCase())));
  const flowStatuses = ["open", "in_progress", "done"];
  const sankeyNodes: SankeyNode[] = [
    ...severities.map((s) => ({ name: s })),
    ...flowStatuses.map((s) => ({ name: s.replace("_", " ") })),
  ];
  const sankeyLinks: SankeyLink[] = [];
  severities.forEach((sev, sevIdx) => {
    flowStatuses.forEach((flow, flowIdx) => {
      const count = items.filter((item) => {
        const itemSev = (item.severity ?? "medium").toLowerCase();
        if (itemSev !== sev) return false;
        const status = statusMap.get(item.id) ?? "open";
        if (flow === "done") return DONE.has(status);
        if (flow === "in_progress") return status === "in_progress" || status === "in-progress";
        return !DONE.has(status) && status !== "in_progress" && status !== "in-progress";
      }).length;
      if (count > 0) {
        sankeyLinks.push({ source: sevIdx, target: severities.length + flowIdx, value: count });
      }
    });
  });

  return (
    <DashboardSection title="Remediation" id="dashboard-remediate">
      {ccV2 && velocity ? (
        <Card tone="panel" className="p-4">
          <Eyebrow>Remediation velocity</Eyebrow>
          <div className="mt-3">
            <RemediationVelocityChart closed={velocity.closedCount ?? 0} open={velocity.openCount ?? 0} />
          </div>
        </Card>
      ) : null}

      {ccV2 && slaAtRisk.length > 0 ? (
        <Card tone="ghost" className="border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center justify-between">
            <Eyebrow>SLA watch</Eyebrow>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
              {slaAtRisk.length} past target
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-100">
            {slaAtRisk.length} high/critical item{slaAtRisk.length > 1 ? "s are" : " is"} still open beyond the recommended
            remediation window. This is a prioritization signal, not a contractual SLA.
          </p>
        </Card>
      ) : null}

      {ccV2 && items.length > 0 ? (
        <Card tone="panel" className="p-4">
          <Eyebrow>Migration timeline &amp; flow</Eyebrow>
          <p className="mt-1 text-[10px] text-[var(--color-gray-500)]">
            Timeline windows are severity-based recommendations; flow shows current remediation status distribution.
          </p>
          <div className="mt-4 space-y-6">
            <CcGantt items={ganttItems} />
            <CcSankey nodes={sankeyNodes} links={sankeyLinks} />
          </div>
        </Card>
      ) : null}
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
              router.push(`/command-center?tab=remediate&scanId=${encodeURIComponent(e.target.value)}`);
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
      ) : scanIdParam ? (
        <Card tone="ghost">
          <p className="text-sm text-[var(--color-gray-400)]">Loading remediation data for selected scan…</p>
        </Card>
      ) : (
        <EmptyState
          title="No remediation data yet"
          description="Run a scan to generate a prioritized remediation board with owners, status, and re-scan verification."
          action={
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
              onClick={() => onTabChange?.("scans")}
            >
              Go to Scans
            </button>
          }
        />
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
