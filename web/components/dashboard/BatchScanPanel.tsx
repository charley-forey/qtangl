"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import CadencePicker from "@/components/dashboard/CadencePicker";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { useBatchLiveScan } from "@/hooks/useBatchLiveScan";
import { BATCH_QUOTA_EXPLAINER, formatScheduleOutcome } from "@/lib/copy/baseline";

type Props = {
  domains: string[];
  industry?: string;
  canWrite?: boolean;
  useBff?: boolean;
  apiKey?: string;
  maxScansPerMonth?: number | null;
  scansThisMonth?: number;
  maxSchedules?: number;
  schedulesActive?: number;
  reportUrlForScan?: (scanId: string, format?: "pdf") => string;
  onOpenReport?: (scanId: string) => void;
  onBatchComplete?: () => void;
  onAddDomain?: () => void;
  onEnableMonitoring?: () => void;
  prefillCreateSchedules?: boolean;
  onMessage?: (message: string) => void;
  onRefresh?: () => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
};

type Phase = "idle" | "running" | "complete";

function statusBadge(status: string): string {
  if (status === "done") return "Complete";
  if (status === "failed" || status === "error") return "Failed";
  return "Running";
}

export default function BatchScanPanel({
  domains,
  industry = "financial",
  canWrite = false,
  useBff = true,
  apiKey,
  maxScansPerMonth,
  scansThisMonth = 0,
  maxSchedules = 0,
  schedulesActive = 0,
  reportUrlForScan,
  onOpenReport,
  onBatchComplete,
  onAddDomain,
  onEnableMonitoring,
  prefillCreateSchedules = false,
  onMessage,
  onRefresh,
  onOpenUpgrade,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(domains));
  const [createSchedules, setCreateSchedules] = useState(false);
  const [cadenceHours, setCadenceHours] = useState(168);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const {
    running,
    batch,
    progressLabel,
    schedulesSkipped,
    schedulesCreated,
    runBatch,
    resetBatch,
    clearPoll,
  } = useBatchLiveScan({
    industry,
    useBff,
    apiKey,
    onMessage,
    onRefresh,
    onOpenUpgrade,
  });

  useEffect(() => {
    if (prefillCreateSchedules) {
      setCreateSchedules(true);
    }
  }, [prefillCreateSchedules]);

  useEffect(() => {
    setSelected(new Set(domains));
  }, [domains]);

  useEffect(() => () => clearPoll(), [clearPoll]);

  const selectedList = useMemo(() => [...selected], [selected]);

  const phase: Phase = useMemo(() => {
    if (running) return "running";
    if (batch.length === 0) return "idle";
    const allTerminal = batch.every((entry) => entry.status === "done" || entry.status === "failed");
    return allTerminal ? "complete" : "running";
  }, [batch, running]);

  const completedCount = batch.filter((entry) => entry.status === "done").length;
  const latestDoneScan = [...batch].reverse().find((entry) => entry.status === "done");

  const scheduleOutcome = formatScheduleOutcome({
    createdCount: schedulesCreated,
    schedulesSkipped,
    cadenceHours,
  });

  useEffect(() => {
    if (phase === "complete") {
      onBatchComplete?.();
    }
  }, [phase, onBatchComplete]);

  function toggleDomain(domain: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  async function copyScanId(scanId: string) {
    try {
      await navigator.clipboard.writeText(scanId);
      setCopiedId(scanId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onMessage?.("Unable to copy scan ID.");
    }
  }

  if (domains.length < 1) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Run baselines</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Scan authorized domains in one action. Each domain becomes its own entry in scan history.
      </p>
      <p className="mt-1 text-xs text-[var(--color-gray-500)]">{BATCH_QUOTA_EXPLAINER}</p>
      <p className="mt-1 text-xs text-[var(--color-gray-500)]">
        <a href="#scans-allowlist" className="underline hover:text-white">
          Manage domains above
        </a>
      </p>

      {phase === "complete" ? (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-100">
            Baseline complete — {completedCount}/{batch.length} domain{batch.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 space-y-2">
            {batch.map((entry) => (
              <li
                key={entry.scanId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-black/20 px-3 py-2 text-xs"
              >
                <span className="text-white">{entry.target}</span>
                <span className="flex items-center gap-2 text-[var(--color-gray-400)]">
                  <span
                    className={
                      entry.status === "done"
                        ? "text-emerald-300"
                        : entry.status === "failed"
                          ? "text-red-300"
                          : "text-sky-300"
                    }
                  >
                    {statusBadge(entry.status)}
                  </span>
                  <button
                    type="button"
                    className="underline hover:text-white"
                    onClick={() => void copyScanId(entry.scanId)}
                  >
                    {copiedId === entry.scanId ? "Copied" : "Copy ID"}
                  </button>
                </span>
              </li>
            ))}
          </ul>
          {scheduleOutcome ? (
            <p className="mt-3 text-xs text-emerald-200">{scheduleOutcome}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {latestDoneScan && onOpenReport ? (
              <Button type="button" size="sm" onClick={() => onOpenReport(latestDoneScan.scanId)}>
                View latest report
              </Button>
            ) : null}
            {latestDoneScan && reportUrlForScan ? (
              <a
                href={reportUrlForScan(latestDoneScan.scanId, "pdf")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-xs font-medium text-white hover:bg-white/10"
              >
                Download PDF
              </a>
            ) : null}
            {maxSchedules > 0 && schedulesActive === 0 && schedulesCreated === 0 && onEnableMonitoring ? (
              <Button type="button" variant="secondary" size="sm" onClick={onEnableMonitoring}>
                Set up weekly monitoring
              </Button>
            ) : null}
            <Button type="button" variant="secondary" size="sm" onClick={resetBatch}>
              Run again
            </Button>
            {onAddDomain ? (
              <button type="button" className="text-xs text-[var(--color-gray-400)] underline" onClick={onAddDomain}>
                Add another domain
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {domains.map((domain) => (
              <label
                key={domain}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                  selected.has(domain)
                    ? "border-white bg-white text-black"
                    : "border-[var(--border-subtle)] text-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(domain)}
                  disabled={!canWrite || running}
                  onChange={() => toggleDomain(domain)}
                  className="sr-only"
                />
                {domain}
              </label>
            ))}
          </div>

          {canWrite ? (
            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-2 text-xs text-[var(--color-gray-300)]">
                <input
                  type="checkbox"
                  checked={createSchedules}
                  disabled={running}
                  onChange={(event) => setCreateSchedules(event.target.checked)}
                  className="mt-0.5"
                />
                <span>Also schedule recurring Monitor scans (weekly by default)</span>
              </label>
              {createSchedules ? (
                <CadencePicker
                  value={cadenceHours}
                  onChange={setCadenceHours}
                  maxScansPerMonth={maxScansPerMonth}
                  scansThisMonth={scansThisMonth}
                  targetCount={selectedList.length}
                />
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  disabled={running || selectedList.length === 0}
                  onClick={() =>
                    void runBatch(selectedList, {
                      createSchedules,
                      scheduleCadenceHours: cadenceHours,
                    })
                  }
                >
                  {running ? "Scanning…" : `Scan ${selectedList.length} domain(s)`}
                </Button>
                <button
                  type="button"
                  className="text-xs text-[var(--color-gray-500)] underline disabled:opacity-50"
                  disabled={running}
                  onClick={() => setSelected(new Set(domains))}
                >
                  Select all
                </button>
              </div>
            </div>
          ) : null}

          {phase === "running" && progressLabel ? (
            <p className="mt-3 text-xs text-sky-200">{progressLabel}</p>
          ) : null}
        </>
      )}
    </Card>
  );
}
