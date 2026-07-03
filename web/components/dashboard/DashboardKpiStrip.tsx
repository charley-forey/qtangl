import KpiCard from "@/components/dashboard/ui/KpiCard";
import InfoTip from "@/components/pqc/InfoTip";
import { formatUtcDateTime } from "@/lib/format";
import { useCommandCenterV2 } from "@/hooks/useCommandCenterV2";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";

export type DashboardKpiData = {
  latestReadiness?: number | null;
  latestBand?: string | null;
  delta?: number | null;
  openCritical?: number;
  nextScheduleAt?: string | null;
  scansThisMonth?: number;
  quotaLimit?: number | null;
};

export default function DashboardKpiStrip({
  kpis,
  activeTab,
}: {
  kpis: DashboardKpiData;
  activeTab?: DashboardTabId;
}) {
  const ccV2 = useCommandCenterV2();
  const readiness =
    kpis.latestReadiness != null ? String(kpis.latestReadiness) : "—";
  const delta =
    kpis.delta != null
      ? `${kpis.delta >= 0 ? "+" : ""}${kpis.delta} vs prior scan`
      : undefined;
  const criticalTone =
    (kpis.openCritical ?? 0) > 0 ? ("critical" as const) : ("default" as const);

  const nextScheduleCard = (
    <KpiCard
      label="Next scheduled scan"
      value={
        kpis.nextScheduleAt ? formatUtcDateTime(kpis.nextScheduleAt) : "Not scheduled"
      }
    />
  );
  const scansThisMonthCard = (
    <KpiCard
      label="Scans this month"
      value={
        kpis.quotaLimit != null
          ? `${kpis.scansThisMonth ?? 0} / ${kpis.quotaLimit}`
          : String(kpis.scansThisMonth ?? 0)
      }
    />
  );

  // The Overview tab's CommandCenterOverviewHero already surfaces Readiness/Open
  // critical (with a trend sparkline) when ccV2 is on — avoid showing them twice.
  if (ccV2 && activeTab === "overview") {
    return (
      <div className="grid gap-3 sm:grid-cols-2" data-tour="kpi-strip">
        {nextScheduleCard}
        {scansThisMonthCard}
      </div>
    );
  }

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
      {nextScheduleCard}
      {scansThisMonthCard}
    </div>
  );
}
