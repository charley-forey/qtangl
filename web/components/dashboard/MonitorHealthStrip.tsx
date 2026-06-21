"use client";

import StatusPill from "@/components/dashboard/ui/StatusPill";
import type { DashboardSummary } from "@/lib/dashboard-state";

export default function MonitorHealthStrip({
  summary,
  schedulerEnabled,
}: {
  summary: DashboardSummary;
  schedulerEnabled?: boolean;
}) {
  const schedules = summary.schedulesSummary.active;
  const alertCount = summary.alerts?.length ?? 0;
  const lastScan = summary.health.lastScanAt ?? "—";
  const enabled = schedulerEnabled ?? Boolean(summary.health.schedulerEnabled ?? summary.me.schedulerEnabled);

  return (
    <div className="grid gap-2 rounded-2xl border border-[var(--border-subtle)] bg-black/30 p-4 sm:grid-cols-5">
      <div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Scheduler</p>
        <div className="mt-1">
          <StatusPill label={enabled ? "On" : "Off"} tone={enabled ? "success" : "warning"} />
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Schedules</p>
        <p className="text-lg font-semibold text-white">{schedules}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Last scan</p>
        <p className="text-sm text-white">{lastScan}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Next run</p>
        <p className="text-sm text-white">{summary.schedulesSummary.nextRunAt ?? "—"}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Open alerts</p>
        <p className="text-lg font-semibold text-white">{alertCount}</p>
      </div>
    </div>
  );
}
