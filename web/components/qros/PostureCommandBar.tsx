"use client";

import Link from "next/link";

import KpiCard from "@/components/dashboard/ui/KpiCard";
import Sparkline from "@/components/dashboard/ui/Sparkline";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardKpiData } from "@/components/dashboard/DashboardKpiStrip";
import type { DashboardSummary } from "@/lib/dashboard-state";
import { formatUtcDateTime } from "@/lib/format";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type Props = {
  kpis: DashboardKpiData;
  summary: DashboardSummary;
  activeTab: DashboardTabId;
  onTabChange: (tab: DashboardTabId) => void;
};

export default function PostureCommandBar({ kpis, summary, activeTab, onTabChange }: Props) {
  const readiness = kpis.latestReadiness != null ? String(kpis.latestReadiness) : "—";
  const delta =
    kpis.delta != null ? `${kpis.delta >= 0 ? "+" : ""}${kpis.delta} vs prior` : undefined;
  const trend = summary.trend?.slice(-8).map((p) => p.score) ?? [];
  const nextDeadline = kpis.nextScheduleAt
    ? formatUtcDateTime(kpis.nextScheduleAt)
    : summary.forecast?.projected != null
      ? `Projected ${summary.forecast.projected}`
      : "—";

  const drill = (metric: string, tab: DashboardTabId) => {
    trackDashboardEvent({
      event: "cc_metric_drilled",
      properties: { metric, tab: activeTab, target: tab },
    });
    onTabChange(tab);
  };

  return (
    <section
      aria-label="Posture command bar"
      className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--color-gray-950)] p-4"
      data-tour="posture-bar"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--color-gray-500)]">
            Posture command bar
          </p>
          <p className="text-xs text-[var(--color-gray-400)]">
            Inventory aid — quantum-vulnerable algorithms are not broken today.
          </p>
        </div>
        {summary.recentScans[0]?.scanId ? (
          <Link
            href={`/verify?scanId=${encodeURIComponent(summary.recentScans[0].scanId!)}`}
            className="text-xs text-sky-300 hover:text-sky-200"
          >
            Verify latest evidence
          </Link>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <button type="button" className="text-left" onClick={() => drill("readiness", "overview")}>
          <KpiCard label="Readiness" value={readiness} hint={kpis.latestBand ?? undefined} delta={delta} />
        </button>
        <button type="button" className="text-left" onClick={() => drill("critical", "remediate")}>
          <KpiCard
            label="Open critical"
            value={kpis.openCritical ?? 0}
            tone={(kpis.openCritical ?? 0) > 0 ? "critical" : "default"}
          />
        </button>
        <button type="button" className="text-left" onClick={() => drill("trend", "overview")}>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/40 p-3">
            <p className="text-[0.65rem] uppercase tracking-wider text-[var(--color-gray-500)]">Trend</p>
            <div className="mt-2 h-8">
              {trend.length > 1 ? <Sparkline values={trend} /> : <span className="text-sm text-[var(--color-gray-400)]">—</span>}
            </div>
          </div>
        </button>
        <button type="button" className="text-left" onClick={() => drill("deadline", "remediate")}>
          <KpiCard label="Next deadline" value={nextDeadline} hint="Trajectory / compliance" />
        </button>
        <button type="button" className="text-left" onClick={() => drill("schedule", "monitor")}>
          <KpiCard
            label="Next scan"
            value={kpis.nextScheduleAt ? formatUtcDateTime(kpis.nextScheduleAt) : "Not scheduled"}
          />
        </button>
        <button type="button" className="text-left" onClick={() => drill("quota", "scans")}>
          <KpiCard
            label="Scans this month"
            value={
              kpis.quotaLimit != null
                ? `${kpis.scansThisMonth ?? 0} / ${kpis.quotaLimit}`
                : String(kpis.scansThisMonth ?? 0)
            }
          />
        </button>
      </div>
    </section>
  );
}
