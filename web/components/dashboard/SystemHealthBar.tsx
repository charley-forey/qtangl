"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import StatusPill from "@/components/dashboard/ui/StatusPill";

export default function SystemHealthBar({
  schedulerEnabled,
  lastScanAt,
  scansThisMonth,
  quotaLimit,
  apiOk,
}: {
  schedulerEnabled?: boolean;
  lastScanAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
  apiOk?: boolean;
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
      </div>
    </Card>
  );
}
