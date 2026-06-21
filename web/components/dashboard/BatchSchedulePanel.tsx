"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import CadencePicker from "@/components/dashboard/CadencePicker";
import { startBatchSchedules } from "@/lib/batch-scan-client";
import { handleDashboardApiError } from "@/lib/dashboard-errors";

type Props = {
  domains: string[];
  canWrite?: boolean;
  useBff?: boolean;
  apiKey?: string;
  maxScansPerMonth?: number | null;
  onMessage?: (message: string) => void;
  onRefresh?: () => void;
  onOpenUpgrade?: (product: "monitor") => void;
};

export default function BatchSchedulePanel({
  domains,
  canWrite = false,
  useBff = true,
  apiKey,
  maxScansPerMonth,
  onMessage,
  onRefresh,
  onOpenUpgrade,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(domains));
  const [cadenceHours, setCadenceHours] = useState(168);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    setSelected(new Set(domains));
  }, [domains]);

  const selectedList = useMemo(() => [...selected], [selected]);

  function toggleDomain(domain: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  async function createSchedules() {
    if (selectedList.length === 0) {
      onMessage?.("Select at least one domain.");
      return;
    }
    setRunning(true);
    setSummary(null);
    try {
      const payload = await startBatchSchedules({
        targets: selectedList,
        cadenceHours,
        useBff,
        apiKey,
      });
      setSummary(payload.summary);
      onMessage?.(payload.summary);
      onRefresh?.();
    } catch (error) {
      const handled = handleDashboardApiError(error);
      if (handled.upgradeProduct === "monitor") {
        onOpenUpgrade?.("monitor");
      }
      onMessage?.(handled.message);
    } finally {
      setRunning(false);
    }
  }

  if (domains.length < 2) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]">
      <Eyebrow>Monitor schedules</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Create recurring drift scans for authorized domains without running a baseline right now. Existing
        schedules for the same target are skipped.
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
          <CadencePicker
            value={cadenceHours}
            onChange={setCadenceHours}
            maxScansPerMonth={maxScansPerMonth}
            targetCount={selectedList.length}
          />
          <Button type="button" size="sm" disabled={running || selectedList.length === 0} onClick={() => void createSchedules()}>
            {running ? "Creating…" : `Schedule ${selectedList.length} domain(s)`}
          </Button>
        </div>
      ) : null}

      {summary ? <p className="mt-3 text-xs text-emerald-200">{summary}</p> : null}
    </Card>
  );
}
