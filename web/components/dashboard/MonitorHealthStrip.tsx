"use client";

import type { DashboardSummary } from "@/lib/dashboard-state";

export default function MonitorHealthStrip({ summary }: { summary: DashboardSummary }) {
  const schedules = summary.schedulesSummary.active;
  const alertCount = summary.alerts?.length ?? 0;
  const lastScan = summary.health.lastScanAt ?? "—";

  return (
    <div className="grid gap-2 rounded-2xl border border-[var(--border-subtle)] bg-black/30 p-4 sm:grid-cols-4">
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
