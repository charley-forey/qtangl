"use client";

import { useCallback, useRef, useState } from "react";

import {
  batchScanPending,
  pollBatchScanStatuses,
  startBatchLiveScan,
  type BatchLiveScanResult,
  type BatchScanEntry,
} from "@/lib/batch-scan-client";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import type { UpgradeProduct } from "@/components/dashboard/UpgradeModal";
import { handleDashboardApiError } from "@/lib/dashboard-errors";

type Options = {
  industry?: string;
  useBff?: boolean;
  apiKey?: string;
  onMessage?: (message: string) => void;
  onRefresh?: () => void;
  onOpenUpgrade?: (product: UpgradeProduct) => void;
};

export function useBatchLiveScan(options: Options) {
  const { industry = "financial", useBff = true, apiKey, onMessage, onRefresh, onOpenUpgrade } = options;
  const [running, setRunning] = useState(false);
  const [batch, setBatch] = useState<BatchScanEntry[]>([]);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [scheduleSummary, setScheduleSummary] = useState<string | null>(null);
  const [schedulesSkipped, setSchedulesSkipped] = useState<string[]>([]);
  const [schedulesCreated, setSchedulesCreated] = useState(0);
  const pollTimer = useRef<number | null>(null);

  const clearPoll = useCallback(() => {
    if (pollTimer.current != null) {
      window.clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const resetBatch = useCallback(() => {
    clearPoll();
    setRunning(false);
    setBatch([]);
    setProgressLabel(null);
    setScheduleSummary(null);
    setSchedulesSkipped([]);
    setSchedulesCreated(0);
  }, [clearPoll]);

  const pollBatch = useCallback(
    function poll(entries: BatchScanEntry[]) {
      void (async () => {
        if (!batchScanPending(entries)) {
          setProgressLabel("All batch scans complete.");
          setRunning(false);
          onRefresh?.();
          return;
        }
        setProgressLabel(`Running ${entries.filter((entry) => entry.status !== "done").length} scan(s)…`);
        try {
          const next = await pollBatchScanStatuses(entries, { useBff, apiKey });
          setBatch(next);
          if (batchScanPending(next)) {
            pollTimer.current = window.setTimeout(() => poll(next), 3000);
          } else {
            const completed = next.filter((entry) => entry.status === "done").length;
            setProgressLabel(`Batch complete — ${completed}/${next.length} scan(s) finished.`);
            setRunning(false);
            trackDashboardEvent("dashboard_batch_scan_complete", { count: next.length, completed });
            onRefresh?.();
          }
        } catch {
          setRunning(false);
          setProgressLabel(null);
        }
      })();
    },
    [apiKey, onRefresh, useBff]
  );

  const runBatch = useCallback(
    async (domains: string[], extras?: { createSchedules?: boolean; scheduleCadenceHours?: number }) => {
      if (domains.length === 0) {
        onMessage?.("Select at least one authorized domain.");
        return null;
      }
      clearPoll();
      setRunning(true);
      setProgressLabel(`Starting ${domains.length} baseline scan(s)…`);
      setBatch([]);
      setScheduleSummary(null);
      setSchedulesSkipped([]);
      setSchedulesCreated(0);
      try {
        const payload: BatchLiveScanResult = await startBatchLiveScan({
          domains,
          industry,
          useBff,
          apiKey,
          createSchedules: extras?.createSchedules,
          scheduleCadenceHours: extras?.scheduleCadenceHours,
        });
        const entries = payload.scans ?? [];
        setBatch(entries);
        if (payload.scheduleSummary) {
          setScheduleSummary(payload.scheduleSummary);
        }
        setSchedulesSkipped(payload.schedulesSkipped ?? []);
        setSchedulesCreated(payload.schedules?.length ?? 0);
        trackDashboardEvent("dashboard_batch_scan_started", { count: entries.length });
        onMessage?.(payload.summary ?? `Started ${entries.length} scan(s).`);
        if (batchScanPending(entries)) {
          pollTimer.current = window.setTimeout(() => pollBatch(entries), 2000);
        } else {
          setProgressLabel("All batch scans complete.");
          setRunning(false);
          onRefresh?.();
        }
        return payload;
      } catch (error) {
        const handled = handleDashboardApiError(error);
        if (handled.upgradeProduct) {
          onOpenUpgrade?.(handled.upgradeProduct);
        }
        onMessage?.(handled.message);
        setRunning(false);
        setProgressLabel(null);
        return null;
      }
    },
    [apiKey, clearPoll, industry, onMessage, onOpenUpgrade, onRefresh, pollBatch, useBff]
  );

  return {
    running,
    batch,
    progressLabel,
    scheduleSummary,
    schedulesSkipped,
    schedulesCreated,
    runBatch,
    resetBatch,
    clearPoll,
  };
}
