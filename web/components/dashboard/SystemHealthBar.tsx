"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";

import type { ScanProgressState } from "@/lib/dashboard-state";

export default function SystemHealthBar({
  schedulerEnabled,
  lastScanAt,
  scansThisMonth,
  quotaLimit,
  apiOk,
  scanProgress,
  eventsConnected,
  eventsDegraded,
}: {
  schedulerEnabled?: boolean;
  lastScanAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
  apiOk?: boolean;
  scanProgress?: ScanProgressState | null;
  eventsConnected?: boolean;
  eventsDegraded?: boolean;
}) {
  const ccV2 = useCommandCenterV2();
  const [opsHealth, setOpsHealth] = useState<{
    schedulerStale?: boolean;
    redis?: boolean;
    workerQueueEnabled?: boolean;
    scheduler?: { lastTickAt?: string };
  } | null>(null);

  useEffect(() => {
    if (!ccV2) return;
    void fetch("/api/dashboard/health")
      .then((r) => r.json())
      .then((body) => setOpsHealth(body))
      .catch(() => setOpsHealth({ schedulerStale: true }));
  }, [ccV2]);

  const quotaPct =
    quotaLimit && quotaLimit > 0 && scansThisMonth != null
      ? Math.round((scansThisMonth / quotaLimit) * 100)
      : null;

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
          System
        </span>
        <StatusPill
          label={schedulerEnabled ? "Scheduler on" : "Scheduler off"}
          tone={schedulerEnabled ? "success" : "warning"}
        />
        <StatusPill label={apiOk !== false ? "API connected" : "API error"} tone={apiOk !== false ? "success" : "critical"} />
        {eventsConnected != null ? (
          <StatusPill
            label={
              eventsConnected
                ? "Live events"
                : eventsDegraded
                  ? "Events reconnecting"
                  : "Events offline"
            }
            tone={eventsConnected ? "success" : eventsDegraded ? "neutral" : "warning"}
          />
        ) : null}
        {lastScanAt ? (
          <span className="text-[var(--color-gray-400)]">Last scan: {new Date(lastScanAt).toLocaleString()}</span>
        ) : (
          <span className="text-[var(--color-gray-400)]">No scans yet</span>
        )}
        {quotaPct != null ? (
          <StatusPill
            label={`Quota ${quotaPct}%`}
            tone={quotaPct >= 90 ? "warning" : "neutral"}
          />
        ) : null}
        {ccV2 && opsHealth ? (
          <>
            <StatusPill
              label={opsHealth.redis ? "Redis up" : "Redis down"}
              tone={opsHealth.redis ? "success" : "critical"}
            />
            <StatusPill
              label={opsHealth.workerQueueEnabled ? "Worker queue" : "Inline jobs"}
              tone={opsHealth.workerQueueEnabled ? "success" : "warning"}
            />
            {opsHealth.schedulerStale ? (
              <StatusPill label="Scheduler degraded" tone="critical" />
            ) : opsHealth.scheduler?.lastTickAt ? (
              <span className="text-[var(--color-gray-400)]">
                Scheduler tick: {new Date(opsHealth.scheduler.lastTickAt).toLocaleString()}
              </span>
            ) : null}
          </>
        ) : null}
        {scanProgress && ["queued", "running"].includes(scanProgress.status) ? (
          <StatusPill
            label={`Scan ${scanProgress.progressPct}%`}
            tone="neutral"
          />
        ) : null}
      </div>
    </Card>
  );
}
