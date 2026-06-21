"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import CadencePicker from "@/components/dashboard/CadencePicker";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { useBatchLiveScan } from "@/hooks/useBatchLiveScan";

type Props = {
  domains: string[];
  industry?: string;
  canWrite?: boolean;
  useBff?: boolean;
  apiKey?: string;
  maxScansPerMonth?: number | null;
  onMessage?: (message: string) => void;
  onRefresh?: () => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
};

export default function BatchScanPanel({
  domains,
  industry = "financial",
  canWrite = false,
  useBff = true,
  apiKey,
  maxScansPerMonth,
  onMessage,
  onRefresh,
  onOpenUpgrade,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(domains));
  const [createSchedules, setCreateSchedules] = useState(false);
  const [cadenceHours, setCadenceHours] = useState(168);
  const { running, batch, progressLabel, scheduleSummary, runBatch, clearPoll } = useBatchLiveScan({
    industry,
    useBff,
    apiKey,
    onMessage,
    onRefresh,
    onOpenUpgrade,
  });

  useEffect(() => {
    setSelected(new Set(domains));
  }, [domains]);

  useEffect(() => () => clearPoll(), [clearPoll]);

  const selectedList = useMemo(() => [...selected], [selected]);

  function toggleDomain(domain: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  if (domains.length < 1) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Batch baseline</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Run live production baselines across multiple authorized domains. Each domain gets its own scan in
        history. Optionally create Monitor schedules when the batch finishes starting.
      </p>

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
            <span>Create Monitor schedules for scanned domains (weekly by default)</span>
          </label>
          {createSchedules ? (
            <CadencePicker
              value={cadenceHours}
              onChange={setCadenceHours}
              maxScansPerMonth={maxScansPerMonth}
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
              {running ? "Batch running…" : `Scan ${selectedList.length} domain(s)`}
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

      {progressLabel ? <p className="mt-3 text-xs text-sky-200">{progressLabel}</p> : null}
      {scheduleSummary ? <p className="mt-2 text-xs text-emerald-200">{scheduleSummary}</p> : null}

      {batch.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-[var(--color-gray-400)]">
          {batch.map((entry) => (
            <li key={entry.scanId}>
              {entry.target} · {entry.status} · <span className="font-mono text-white">{entry.scanId}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
