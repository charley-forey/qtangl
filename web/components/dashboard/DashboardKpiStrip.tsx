import KpiCard from "@/components/dashboard/ui/KpiCard";
import InfoTip from "@/components/pqc/InfoTip";
import { formatUtcDateTime } from "@/lib/format";

export type DashboardKpiData = {
  latestReadiness?: number | null;
  latestBand?: string | null;
  delta?: number | null;
  openCritical?: number;
  nextScheduleAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
};

export default function DashboardKpiStrip({ kpis }: { kpis: DashboardKpiData }) {
  const readiness =
    kpis.latestReadiness != null ? String(kpis.latestReadiness) : "—";
  const delta =
    kpis.delta != null
      ? `${kpis.delta >= 0 ? "+" : ""}${kpis.delta} vs prior scan`
      : undefined;
  const criticalTone =
    (kpis.openCritical ?? 0) > 0 ? ("critical" as const) : ("default" as const);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-tour="kpi-strip">
      <KpiCard
        label="Readiness"
        value={readiness}
        hint={kpis.latestBand ?? undefined}
        hintExtra={<InfoTip termId="readiness_band" />}
        delta={delta}
      />
      <KpiCard
        label="Open critical"
        value={kpis.openCritical ?? 0}
        tone={criticalTone}
        hint="From latest completed scan"
      />
      <KpiCard
        label="Next scheduled scan"
        value={
          kpis.nextScheduleAt ? formatUtcDateTime(kpis.nextScheduleAt) : "Not scheduled"
        }
      />
      <KpiCard
        label="Scans this month"
        value={
          kpis.quotaLimit != null
            ? `${kpis.scansThisMonth ?? 0} / ${kpis.quotaLimit}`
            : String(kpis.scansThisMonth ?? 0)
        }
      />
    </div>
  );
}
