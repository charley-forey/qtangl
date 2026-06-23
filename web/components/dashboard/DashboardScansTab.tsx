"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import DashboardOnboarding, { DashboardSection } from "@/components/dashboard/DashboardOnboarding";
import AuthorizedDomainsPanel from "@/components/dashboard/AuthorizedDomainsPanel";
import BatchScanPanel from "@/components/dashboard/BatchScanPanel";
import BatchSchedulePanel from "@/components/dashboard/BatchSchedulePanel";
import ScheduleRecommendationCard from "@/components/dashboard/ScheduleRecommendationCard";
import type { ScansTabBundle } from "@/lib/dashboard-state";
import type { TenantScanSummary } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

import LegalAcceptancePanel from "@/components/dashboard/LegalAcceptancePanel";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { isLegalAcceptanceCurrent } from "@/lib/dashboard-legal";
import type { ScanProgressState } from "@/lib/dashboard-state";

const AssessRunnerPanel = dynamic(() => import("@/components/pqc/AssessRunnerPanel"), { loading: () => null });
const PassportPanel = dynamic(() => import("@/components/pqc/PassportPanel"), { loading: () => null });
const ScanDiffPanel = dynamic(() => import("@/components/pqc/ScanDiffPanel"), { loading: () => null });
import type { ScanDiff } from "@/components/pqc/ScanDiffPanel";

type SourceFilter = "all" | "dashboard" | "automation" | "schedule";

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
  onSettingsChange?: (settings: Record<string, unknown>) => void;
  scanAllowlist?: string[];
  scanProgress?: ScanProgressState | null;
  schedulesActive?: number;
  onDismissScheduleRecommendation?: () => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
  onRefresh?: () => void;
  tier?: string;
  maxSchedules?: number;
  readinessScore?: number | null;
};

function matchesSourceFilter(scan: TenantScanSummary, filter: SourceFilter): boolean {
  if (filter === "all") return true;
  const method = scan.authMethod ?? "";
  if (filter === "dashboard") return method === "workos" || method === "session_key";
  if (filter === "automation") return method === "api_key";
  if (filter === "schedule") return method === "scheduler";
  return true;
}

export default function DashboardScansTab({
  bundle,
  bffMode,
  savedKey,
  canWrite,
  reportUrlForScan,
  onOpenReport,
  onMessage,
  tenantSettings,
  onSettingsChange,
  scanAllowlist = [],
  scanProgress,
  schedulesActive = 0,
  onDismissScheduleRecommendation,
  onOpenUpgrade,
  onRefresh,
  tier = "free",
  maxSchedules = 0,
  readinessScore,
}: Props) {
  const scans = bundle?.scans ?? [];
  const legalOk = isLegalAcceptanceCurrent(tenantSettings);
  const allowlist = scanAllowlist.length
    ? scanAllowlist
    : ((tenantSettings?.scanAllowlist as string[] | undefined) ?? []);
  const industry = String(tenantSettings?.industry ?? "financial");
  const coaching = (tenantSettings?.coaching as { bannersDismissed?: string[] } | undefined) ?? {};
  const scheduleRecommendationDismissed = (coaching.bannersDismissed ?? []).includes("schedule-recommendation");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showRunner, setShowRunner] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [compareScanId, setCompareScanId] = useState<string | null>(null);
  const [compareDiff, setCompareDiff] = useState<ScanDiff | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const latestDiff = bundle?.latestScanDetail?.scanDiff as ScanDiff | null | undefined;
  const diffDelta = latestDiff?.readinessDelta ?? 0;
  const [diffPanelOpen, setDiffPanelOpen] = useState(false);

  const inProgressRow = useMemo(() => {
    if (!scanProgress || scanProgress.status === "done") return null;
    const exists = scans.some((s) => s.scanId === scanProgress.scanId);
    if (exists) return null;
    return {
      scanId: scanProgress.scanId,
      status: scanProgress.status,
      error: null,
      scenarioId: null,
      targetDomain: scanProgress.targetDomain ?? null,
      readinessScore: scanProgress.readinessScore ?? null,
      readinessBand: scanProgress.readinessBand ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceLabel: "Dashboard · live",
    } satisfies TenantScanSummary;
  }, [scanProgress, scans]);

  const displayScans = useMemo(() => {
    const merged = inProgressRow ? [inProgressRow, ...scans] : scans;
    return merged.filter((scan) => matchesSourceFilter(scan, sourceFilter));
  }, [inProgressRow, scans, sourceFilter]);

  useEffect(() => {
    if (latestDiff?.previousScanId && diffDelta !== 0) {
      setDiffPanelOpen(true);
    }
  }, [latestDiff?.previousScanId, diffDelta]);

  useEffect(() => {
    if (!compareScanId) {
      setCompareDiff(null);
      return;
    }
    let cancelled = false;
    setCompareLoading(true);
    void fetchDashboardJson<{ report?: { scanDiff?: ScanDiff } }>(
      `/tenant/scans/${encodeURIComponent(compareScanId)}`
    )
      .then((payload) => {
        if (!cancelled) setCompareDiff((payload.report?.scanDiff as ScanDiff | undefined) ?? null);
      })
      .catch(() => {
        if (!cancelled) setCompareDiff(null);
      })
      .finally(() => {
        if (!cancelled) setCompareLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [compareScanId]);

  const diffByScan = useMemo(() => {
    const map = new Map<string, number | null>();
    const detail = bundle?.latestScanDetail;
    if (detail?.scanDiff && detail.scanId) {
      const delta = detail.scanDiff.readinessDelta;
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
            <LegalAcceptancePanel
              requireScanAuthorization={Boolean(allowlist[0]?.trim())}
              domain={allowlist[0]?.trim() ?? ""}
              onAccepted={(billing) => {
                onSettingsChange?.({ ...(tenantSettings ?? {}), billing });
                onMessage("Legal acceptance recorded.");
                setShowRunner(true);
              }}
            />
          </div>
        </Card>
      ) : null}

      {canWrite && legalOk ? (
        <DashboardSection title="Authorized domains" id="scans-allowlist">
          <AuthorizedDomainsPanel
            canAdmin={canWrite}
            compact={allowlist.length > 0}
            onMessage={onMessage}
            onDomainsChange={(domains) => {
              onSettingsChange?.({ ...(tenantSettings ?? {}), scanAllowlist: domains });
            }}
          />
          {allowlist.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--color-gray-500)]">
              Add at least one domain before running a live production baseline, or upload a PEM certificate bundle below.
            </p>
          ) : null}
        </DashboardSection>
      ) : null}

      {canWrite && legalOk && allowlist.length >= 1 ? (
        <DashboardSection title="Batch scan" id="batch-scan">
          <BatchScanPanel
            domains={allowlist}
            industry={industry}
            canWrite={canWrite}
            useBff={bffMode}
            apiKey={bffMode ? undefined : savedKey}
            onMessage={onMessage}
            onRefresh={onRefresh}
            onOpenUpgrade={onOpenUpgrade}
          />
        </DashboardSection>
      ) : null}

      {canWrite && legalOk && allowlist.length >= 2 ? (
        <DashboardSection title="Monitor schedules" id="batch-schedules">
          <BatchSchedulePanel
            domains={allowlist}
            canWrite={canWrite}
            useBff={bffMode}
            apiKey={bffMode ? undefined : savedKey}
            onMessage={onMessage}
            onRefresh={onRefresh}
            onOpenUpgrade={onOpenUpgrade}
          />
        </DashboardSection>
      ) : null}

      {legalOk && scans.length > 0 && schedulesActive === 0 ? (
        <ScheduleRecommendationCard
          scanAllowlist={allowlist}
          tier={tier}
          maxSchedules={maxSchedules}
          readinessScore={readinessScore}
          dismissed={scheduleRecommendationDismissed}
          onDismiss={onDismissScheduleRecommendation}
          onMessage={onMessage}
          onRefresh={onRefresh}
          onOpenUpgrade={onOpenUpgrade}
        />
      ) : null}

      {canWrite && legalOk && showRunner ? (
        <DashboardSection title="Run baseline assessment" id="run-baseline">
          <div data-tour="scans-runner">
            <AssessRunnerPanel
              apiKey={bffMode ? "bff" : savedKey}
              useBff={bffMode}
              canAdminDomains={canWrite}
              onMessage={onMessage}
              onDomainsChange={(domains) => {
                onSettingsChange?.({ ...(tenantSettings ?? {}), scanAllowlist: domains });
              }}
              onOpenUpgrade={onOpenUpgrade}
              onRefresh={onRefresh}
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
      ) : canWrite && legalOk ? (
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

      {compareScanId ? (
        <DashboardSection title="Scan comparison" id="scan-compare">
          <Card tone="panel">
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>Compare with previous</Eyebrow>
              <button type="button" className="text-xs underline" onClick={() => setCompareScanId(null)}>
                Close
              </button>
            </div>
            {compareLoading ? (
              <p className="mt-2 text-sm text-[var(--color-gray-400)]">Loading diff…</p>
            ) : compareDiff?.previousScanId ? (
              <div className="mt-4">
                <ScanDiffPanel diff={compareDiff} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-gray-400)]">No prior scan to compare for this selection.</p>
            )}
          </Card>
        </DashboardSection>
      ) : null}

      <DashboardSection title="Scan history" id="dashboard-scans">
        {scans.length === 0 && !inProgressRow ? (
          <EmptyState
            title="No scans yet"
            description="Run your first authorized baseline scan to populate readiness scores, evidence packs, and dashboard trends."
            action={
              canWrite && legalOk && allowlist.length > 0 ? (
                <button
                  type="button"
                  className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
                  onClick={() => setShowRunner(true)}
                >
                  Run baseline scan
                </button>
              ) : canWrite && !legalOk ? (
                <p className="text-xs text-[var(--color-gray-500)]">Accept legal terms above first.</p>
              ) : canWrite ? (
                <p className="text-xs text-[var(--color-gray-500)]">Add authorized domains above first.</p>
              ) : undefined
            }
          />
        ) : (
          <Card tone="panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Eyebrow>Recent PQC scans</Eyebrow>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="rounded border border-[var(--border-subtle)] bg-transparent px-2 py-1 text-xs text-white"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                >
                  <option value="all">All sources</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="automation">Automation keys</option>
                  <option value="schedule">Scheduled</option>
                </select>
                {selected.size > 0 ? (
                  <button type="button" className="text-xs text-white underline" onClick={() => void bulkExport()}>
                    Download {selected.size} bundle(s)
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <ScanTable
                scans={displayScans}
                selected={selected}
                diffByScan={diffByScan}
                reportUrlForScan={reportUrlForScan}
                onToggle={toggleScan}
                onOpenReport={onOpenReport}
                onCompare={(scanId) => setCompareScanId(scanId)}
                savedKey={savedKey}
                bffMode={bffMode}
                inProgressScanId={scanProgress?.scanId}
                progressPct={scanProgress?.progressPct}
              />
            </div>
            <div className="mt-4 space-y-3 md:hidden">
              {displayScans.map((scan) => (
                <ScanCard
                  key={scan.scanId}
                  scan={scan}
                  selected={selected.has(scan.scanId)}
                  delta={diffByScan.get(scan.scanId)}
                  reportUrlForScan={reportUrlForScan}
                  onToggle={() => toggleScan(scan.scanId)}
                  onOpenReport={() => onOpenReport(scan.scanId)}
                  onCompare={() => setCompareScanId(scan.scanId)}
                  savedKey={savedKey}
                  bffMode={bffMode}
                  inProgress={scan.scanId === scanProgress?.scanId && scan.status !== "done"}
                  progressPct={scanProgress?.progressPct}
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
  onCompare,
  savedKey,
  bffMode,
  inProgressScanId,
  progressPct,
}: {
  scans: TenantScanSummary[];
  selected: Set<string>;
  diffByScan: Map<string, number | null>;
  reportUrlForScan: Props["reportUrlForScan"];
  onToggle: (scanId: string) => void;
  onOpenReport: (scanId: string) => void;
  onCompare: (scanId: string) => void;
  savedKey: string;
  bffMode: boolean;
  inProgressScanId?: string;
  progressPct?: number;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
        <tr>
          <th className="pb-3 pr-2" />
          <th className="pb-3 pr-4">Scan ID</th>
          <th className="pb-3 pr-4">Source</th>
          <th className="pb-3 pr-4">Status</th>
          <th className="pb-3 pr-4">Created</th>
          <th className="pb-3 pr-4">Readiness</th>
          <th className="pb-3 pr-4">Δ</th>
          <th className="pb-3">Actions</th>
        </tr>
      </thead>
      <tbody className="text-[var(--color-gray-300)]">
        {scans.map((scan) => {
          const inProgress = scan.scanId === inProgressScanId && scan.status !== "done";
          return (
            <tr key={scan.scanId} className="border-t border-[var(--border-subtle)]">
              <td className="py-3 pr-2">
                {scan.status === "done" ? (
                  <input type="checkbox" checked={selected.has(scan.scanId)} onChange={() => onToggle(scan.scanId)} />
                ) : null}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-white">{scan.scanId}</td>
              <td className="py-3 pr-4 text-xs">{scan.sourceLabel ?? "—"}</td>
              <td className="py-3 pr-4">
                {inProgress ? (
                  <span className="inline-flex items-center gap-2">
                    {scan.status}
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full bg-sky-400 transition-all"
                        style={{ width: `${progressPct ?? 10}%` }}
                      />
                    </span>
                  </span>
                ) : (
                  scan.status
                )}
              </td>
              <td className="py-3 pr-4">{formatUtcDateTime(scan.createdAt)}</td>
              <td className="py-3 pr-4">
                {scan.readinessScore != null
                  ? `${scan.readinessScore}${scan.readinessBand ? ` · ${scan.readinessBand}` : ""}`
                  : "—"}
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
                    <button type="button" className="underline" onClick={() => onCompare(scan.scanId)}>
                      Compare
                    </button>
                    <PassportPanel scanId={scan.scanId} apiKey={savedKey} useBff={bffMode} />
                  </div>
                ) : inProgress ? (
                  <span className="text-xs text-sky-300">Running…</span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          );
        })}
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
  onCompare,
  savedKey,
  bffMode,
  inProgress,
  progressPct,
}: {
  scan: TenantScanSummary;
  selected: boolean;
  delta?: number | null;
  reportUrlForScan: Props["reportUrlForScan"];
  onToggle: () => void;
  onOpenReport: () => void;
  onCompare: () => void;
  savedKey: string;
  bffMode: boolean;
  inProgress?: boolean;
  progressPct?: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs text-white">{scan.scanId}</p>
        {scan.status === "done" ? <input type="checkbox" checked={selected} onChange={onToggle} /> : null}
      </div>
      {scan.sourceLabel ? <p className="mt-1 text-xs text-[var(--color-gray-500)]">{scan.sourceLabel}</p> : null}
      <p className="mt-1 text-[var(--color-gray-400)]">
        {scan.status}
        {inProgress ? ` · ${progressPct ?? 10}%` : ""}
      </p>
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
          <button type="button" className="underline" onClick={onCompare}>
            Compare
          </button>
          <PassportPanel scanId={scan.scanId} apiKey={savedKey} useBff={bffMode} />
        </div>
      ) : null}
    </div>
  );
}
