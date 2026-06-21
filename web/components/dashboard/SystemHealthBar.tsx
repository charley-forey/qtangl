"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import StatusPill from "@/components/dashboard/ui/StatusPill";

import type { ScanProgressState } from "@/lib/dashboard-state";

export default function SystemHealthBar({
  schedulerEnabled,
  lastScanAt,
  scansThisMonth,
  quotaLimit,
  apiOk,
  scanProgress,
  eventsConnected,
}: {
  schedulerEnabled?: boolean;
  lastScanAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
  apiOk?: boolean;
  scanProgress?: ScanProgressState | null;
  eventsConnected?: boolean;
}) {
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
            label={eventsConnected ? "Live events" : "Events offline"}
            tone={eventsConnected ? "success" : "warning"}
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
