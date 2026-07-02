"use client";

import dynamic from "next/dynamic";

import AlgorithmBreakdown from "@/components/dashboard/charts/AlgorithmBreakdown";
import BusinessUnitHeatmap from "@/components/dashboard/BusinessUnitHeatmap";
import ForecastCard from "@/components/dashboard/ForecastCard";
import SeverityDonut from "@/components/dashboard/charts/SeverityDonut";
import MonitorDriftSourcesChart from "@/components/marketing/MonitorDriftSourcesChart";
import MonitorEvidenceFreshness from "@/components/marketing/MonitorEvidenceFreshness";
import MonitorHeroKpiStrip from "@/components/marketing/MonitorHeroKpiStrip";
import MonitorLivePulse from "@/components/marketing/MonitorLivePulse";
import MonitorScenarioPicker from "@/components/marketing/MonitorScenarioPicker";
import { useMonitorScenario } from "@/components/marketing/MonitorScenarioContext";
import ScanDiffPanel from "@/components/pqc/ScanDiffPanel";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { formatUtcDateTime } from "@/lib/format";

const MonitorReadinessChart = dynamic(
  () => import("@/components/marketing/MonitorReadinessChart"),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded bg-white/5" /> }
);

export default function MonitorCommandCenterPreview() {
  const { scenario, weekIndex } = useMonitorScenario();
  const trendPoints = scenario.weeks.slice(0, weekIndex + 1).map((w) => w.trendPoint);
  const currentDiff = scenario.weeks[weekIndex]?.diff ?? scenario.weeks[scenario.weeks.length - 1]!.diff;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <MonitorScenarioPicker />
        <MonitorLivePulse />
      </div>

      <MonitorHeroKpiStrip />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
        <Card tone="panel" className="rounded-[var(--radius-xl)] p-5 sm:p-6 lg:col-span-7">
          <Eyebrow>Readiness trend + forecast</Eyebrow>
          <div className="mt-5">
            <MonitorReadinessChart
              points={trendPoints}
              forecast={scenario.forecast}
              anomalyIndex={weekIndex >= 4 ? 4 : undefined}
              height={200}
            />
          </div>
        </Card>

        <Card tone="panel" className="rounded-[var(--radius-xl)] p-5 sm:p-6 lg:col-span-5">
          <Eyebrow>Drift by source (7d)</Eyebrow>
          <div className="mt-5">
            <MonitorDriftSourcesChart data={scenario.driftBySource} />
          </div>
        </Card>

        <Card tone="panel" className="rounded-[var(--radius-xl)] p-5 sm:p-6 lg:col-span-7">
          <Eyebrow>Latest scan diff</Eyebrow>
          <div className="mt-5">
            <ScanDiffPanel diff={currentDiff} />
          </div>
        </Card>

        <div className="grid gap-4 sm:gap-5 lg:col-span-5 lg:grid-cols-1">
          <SeverityDonut slices={scenario.severitySlices} />
          <AlgorithmBreakdown
            rows={scenario.algorithmRows}
            insight="Algorithm families from latest scheduled scan."
          />
        </div>

        <div className="lg:col-span-7">
          <BusinessUnitHeatmap
            businessUnits={scenario.commandCenter.businessUnits}
            deltas={scenario.commandCenter.deltas}
          />
        </div>

        <div className="lg:col-span-5">
          <MonitorEvidenceFreshness />
        </div>

        <div className="lg:col-span-6">
          <ForecastCard
            forecast={{
              current: scenario.forecast.current,
              projected: scenario.forecast.projected,
              slope: scenario.forecast.slope,
            }}
          />
        </div>

        <Card tone="feature" className="rounded-[var(--radius-xl)] p-5 sm:p-6 lg:col-span-6">
          <Eyebrow>Scheduled monitoring</Eyebrow>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Target</dt>
              <dd className="mt-1 text-sm text-white">{scenario.target}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Cadence</dt>
              <dd className="mt-1 text-sm text-white">{scenario.cadence}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Next run</dt>
              <dd className="mt-1 text-sm text-white">{formatUtcDateTime(scenario.nextRun)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Alert on</dt>
              <dd className="mt-1 text-sm text-white">{scenario.alertThreshold}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
