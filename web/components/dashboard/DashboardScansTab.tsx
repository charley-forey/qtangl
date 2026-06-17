"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import type { ScansTabBundle } from "@/lib/dashboard-state";
import type { TenantScanSummary } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

import LegalAcceptancePanel from "@/components/dashboard/LegalAcceptancePanel";

const AssessRunnerPanel = dynamic(() => import("@/components/pqc/AssessRunnerPanel"), { loading: () => null });
const PassportPanel = dynamic(() => import("@/components/pqc/PassportPanel"), { loading: () => null });
const ScanDiffPanel = dynamic(() => import("@/components/pqc/ScanDiffPanel"), { loading: () => null });
import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";

type Props = {
  bundle: ScansTabBundle | null;
  bffMode: boolean;
  savedKey: string;
  canWrite: boolean;
  reportUrlForScan: (scanId: string, format?: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor") => string;
  onOpenReport: (scanId: string) => void;
  onMessage: (message: string) => void;
  scanIdParam?: string;
  tenantSettings?: Record<string, unknown> | null;
};

export default function DashboardScansTab({
  bundle,
  bffMode,
  savedKey,
  canWrite,
  reportUrlForScan,
  onOpenReport,
  onMessage,
  tenantSettings,
}: Props) {
  const scans = bundle?.scans ?? [];
  const billing = (tenantSettings?.billing as { termsAcceptedAt?: string; termsVersion?: string }) ?? {};
  const termsRequired = String(tenantSettings?.termsVersionRequired ?? "2026-06-08");
  const legalOk = Boolean(billing.termsAcceptedAt && billing.termsVersion === termsRequired);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showRunner, setShowRunner] = useState(true);
  const latestDiff = bundle?.latestScanDetail?.scanDiff as ScanDiff | null | undefined;
  const diffDelta = latestDiff?.readinessDelta ?? 0;
  const [diffPanelOpen, setDiffPanelOpen] = useState(false);

  useEffect(() => {
    if (latestDiff?.previousScanId && diffDelta !== 0) {
      setDiffPanelOpen(true);
    }
  }, [latestDiff?.previousScanId, diffDelta]);

  const diffByScan = useMemo(() => {
    const map = new Map<string, number | null>();
    const detail = bundle?.latestScanDetail;
    if (detail?.scanDiff?.summary && typeof detail.scanDiff.summary === "object") {
      const delta = (detail.scanDiff.summary as { readinessDelta?: number }).readinessDelta;
      if (delta != null) map.set(detail.scanId, Number(delta));
    }
    return map;
  }, [bundle?.latestScanDetail]);

  async function bulkExport() {
    if (selected.size === 0) return;
    try {
      const response = await fetch("/api/dashboard/tenant/scans/bulk-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanIds: [...selected] }),
      });
      if (!response.ok) throw new Error("Bulk export failed.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "qtangl-evidence-bundles.zip";
      anchor.click();
      URL.revokeObjectURL(url);
      trackDashboardEvent("dashboard_bulk_export", { count: selected.size });
      onMessage(`Downloaded ${selected.size} evidence bundle(s).`);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Bulk export failed.");
    }
  }

  function toggleScan(scanId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(scanId)) next.delete(scanId);
      else next.add(scanId);
      return next;
    });
  }

  return (
    <>
      {canWrite && !legalOk ? (
        <Card tone="panel">
          <Eyebrow>Legal acceptance required</Eyebrow>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">
            Accept terms and scan authorization before running production baselines.
          </p>
          <div className="mt-4">
            <LegalAcceptancePanel onAccepted={() => onMessage("Legal acceptance recorded.")} />
          </div>
        </Card>
      ) : null}
      {canWrite && legalOk && showRunner ? (
        <DashboardSection title="Run baseline assessment" id="run-baseline">
          <div data-tour="scans-runner">
          <AssessRunnerPanel
            apiKey={bffMode ? "bff" : savedKey}
            useBff={bffMode}
            initialInventory={[]}
            initialScenarios={[]}
            backendConnected
            backendMessage={null}
          />
          <button type="button" className="mt-2 text-xs underline" onClick={() => setShowRunner(false)}>
            Hide runner
          </button>
          </div>
        </DashboardSection>
      ) : canWrite ? (
        <button type="button" className="text-sm underline" onClick={() => setShowRunner(true)}>
          Run baseline assessment
        </button>
      ) : null}

      {latestDiff?.previousScanId ? (
        <DashboardSection title="What changed since last scan" id="scan-diff-story">
          <Card tone="panel">
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>Scan diff story</Eyebrow>
              <button
                type="button"
                className="text-xs text-white underline"
                onClick={() => setDiffPanelOpen((v) => !v)}
              >
                {diffPanelOpen ? "Collapse" : "Expand"}
              </button>
            </div>
            {diffPanelOpen ? (
              <div className="mt-4">
                <ScanDiffPanel diff={latestDiff} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-gray-400)]">
                Readiness moved {diffDelta > 0 ? "+" : ""}
                {diffDelta} points — expand to review new vulnerabilities and drift causes.
              </p>
            )}
          </Card>
        </DashboardSection>
      ) : null}

      <DashboardSection title="Scan history" id="dashboard-scans">
        {scans.length === 0 ? (
          <EmptyState
            title="No scans yet"
            description="Run your first authorized baseline scan to populate readiness scores, evidence packs, and dashboard trends."
            action={
              canWrite ? (
                <button
                  type="button"
                  className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
                  onClick={() => setShowRunner(true)}
                >
                  Run baseline scan
                </button>
              ) : undefined
            }
          />
        ) : (
          <Card tone="panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Eyebrow>Recent PQC scans</Eyebrow>
              {selected.size > 0 ? (
                <button type="button" className="text-xs text-white underline" onClick={() => void bulkExport()}>
                  Download {selected.size} bundle(s)
                </button>
              ) : null}
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <ScanTable
                scans={scans}
                selected={selected}
                diffByScan={diffByScan}
                reportUrlForScan={reportUrlForScan}
                onToggle={toggleScan}
                onOpenReport={onOpenReport}
                savedKey={savedKey}
                bffMode={bffMode}
              />
            </div>
            <div className="mt-4 space-y-3 md:hidden">
              {scans.map((scan) => (
                <ScanCard
                  key={scan.scanId}
                  scan={scan}
                  selected={selected.has(scan.scanId)}
                  delta={diffByScan.get(scan.scanId)}
                  reportUrlForScan={reportUrlForScan}
                  onToggle={() => toggleScan(scan.scanId)}
                  onOpenReport={() => onOpenReport(scan.scanId)}
                  savedKey={savedKey}
                  bffMode={bffMode}
                />
              ))}
            </div>
          </Card>
        )}
      </DashboardSection>
    </>
  );
}

function ScanTable({
  scans,
  selected,
  diffByScan,
  reportUrlForScan,
  onToggle,
  onOpenReport,
  savedKey,
  bffMode,
}: {
  scans: TenantScanSummary[];
  selected: Set<string>;
  diffByScan: Map<string, number | null>;
  reportUrlForScan: Props["reportUrlForScan"];
  onToggle: (scanId: string) => void;
  onOpenReport: (scanId: string) => void;
  savedKey: string;
  bffMode: boolean;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
        <tr>
          <th className="pb-3 pr-2" />
          <th className="pb-3 pr-4">Scan ID</th>
          <th className="pb-3 pr-4">Status</th>
          <th className="pb-3 pr-4">Created</th>
          <th className="pb-3 pr-4">Readiness</th>
          <th className="pb-3 pr-4">Δ</th>
          <th className="pb-3">Actions</th>
        </tr>
      </thead>
      <tbody className="text-[var(--color-gray-300)]">
        {scans.map((scan) => (
          <tr key={scan.scanId} className="border-t border-[var(--border-subtle)]">
            <td className="py-3 pr-2">
              {scan.status === "done" ? (
                <input type="checkbox" checked={selected.has(scan.scanId)} onChange={() => onToggle(scan.scanId)} />
              ) : null}
            </td>
            <td className="py-3 pr-4 font-mono text-xs text-white">{scan.scanId}</td>
            <td className="py-3 pr-4">{scan.status}</td>
            <td className="py-3 pr-4">{formatUtcDateTime(scan.createdAt)}</td>
            <td className="py-3 pr-4">
              {scan.readinessScore != null ? `${scan.readinessScore}${scan.readinessBand ? ` · ${scan.readinessBand}` : ""}` : "—"}
            </td>
            <td className="py-3 pr-4">
              {diffByScan.has(scan.scanId) ? (diffByScan.get(scan.scanId) ?? "—") : "—"}
            </td>
            <td className="py-3">
              {scan.status === "done" ? (
                <div className="flex flex-wrap gap-2">
                  <a href={reportUrlForScan(scan.scanId, "pdf")} className="underline" target="_blank" rel="noreferrer">
                    PDF
                  </a>
                  <button type="button" className="underline" onClick={() => onOpenReport(scan.scanId)}>
                    Reports
                  </button>
                  <PassportPanel scanId={scan.scanId} apiKey={savedKey} useBff={bffMode} />
                </div>
              ) : (
                "—"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ScanCard({
  scan,
  selected,
  delta,
  reportUrlForScan,
  onToggle,
  onOpenReport,
  savedKey,
  bffMode,
}: {
  scan: TenantScanSummary;
  selected: boolean;
  delta?: number | null;
  reportUrlForScan: Props["reportUrlForScan"];
  onToggle: () => void;
  onOpenReport: () => void;
  savedKey: string;
  bffMode: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs text-white">{scan.scanId}</p>
        {scan.status === "done" ? <input type="checkbox" checked={selected} onChange={onToggle} /> : null}
      </div>
      <p className="mt-1 text-[var(--color-gray-400)]">{scan.status}</p>
      <p className="mt-1 text-[var(--color-gray-400)]">{formatUtcDateTime(scan.createdAt)}</p>
      {scan.readinessScore != null ? (
        <p className="mt-1">
          {scan.readinessScore}
          {delta != null ? ` (${delta > 0 ? "+" : ""}${delta})` : ""}
        </p>
      ) : null}
      {scan.status === "done" ? (
        <div className="mt-2 flex gap-3">
          <a href={reportUrlForScan(scan.scanId, "pdf")} className="underline">
            PDF
          </a>
          <button type="button" className="underline" onClick={onOpenReport}>
            Reports
          </button>
          <PassportPanel scanId={scan.scanId} apiKey={savedKey} useBff={bffMode} />
        </div>
      ) : null}
    </div>
  );
}
