"use client";

import { buildDashboardDeepLink } from "@/lib/dashboard-deep-links";
import MetricCard from "@/components/dashboard/ui/MetricCard";
import Sparkline from "@/components/dashboard/ui/Sparkline";
import InsightCallout from "@/components/dashboard/ui/InsightCallout";
import {
  SeverityDonutV2,
  AlgorithmFamilyBars,
} from "@/components/dashboard/charts/CommandCenterCharts";
import { algorithmFamiliesFromItems, severityBreakdown } from "@/lib/algorithm-inventory";
import { readinessBandForScore } from "@/lib/chart-theme";
import type { DashboardSummary } from "@/lib/dashboard-state";
import { summaryTrendPoints } from "@/lib/dashboard-state";
import { useJourneyStage } from "@/hooks/useJourneyStage";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function CommandCenterOverviewHero({
  summary,
  tenantSettings,
}: {
  summary: DashboardSummary;
  tenantSettings?: Record<string, unknown> | null;
}) {
  const journey = useJourneyStage(summary, tenantSettings);
  const detail = summary.latestScanDetail;
  const backlog = detail?.openCriticalItems ?? [];
  const readiness = summary.kpis.latestReadiness ?? detail?.readinessScore ?? null;
  const readinessTrendValues = summaryTrendPoints(summary)
    .slice(-10)
    .map((p) => p.readinessScore);
  const severityData = severityBreakdown(backlog);
  const algoData = algorithmFamiliesFromItems(backlog);

  return (
    <div className="space-y-4">
      <InsightCallout title="Next step" tone="info">
        {journey.nextBestAction}
      </InsightCallout>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Readiness"
          value={readiness != null ? `${readiness}` : "—"}
          hint={readiness != null ? readinessBandForScore(readiness) : "Run a baseline scan"}
          tone={readiness != null && readiness < 60 ? "warning" : "default"}
          drillHref={buildDashboardDeepLink({ tab: "scans" })}
          drillTab="overview"
          drillMetric="readiness"
          sparkline={
            readinessTrendValues.length >= 2 ? <Sparkline values={readinessTrendValues} /> : undefined
          }
        />
        <MetricCard
          label="Open criticals"
          value={summary.kpis.openCritical ?? backlog.length}
          drillHref={buildDashboardDeepLink({ tab: "remediate" })}
          drillTab="overview"
          drillMetric="open_critical"
          tone={(summary.kpis.openCritical ?? 0) > 0 ? "critical" : "success"}
        />
        <MetricCard
          label="Remediation velocity"
          value={`${summary.remediationVelocity?.completionRatePct ?? 0}%`}
          hint="Closed + accepted risk"
          drillHref={buildDashboardDeepLink({ tab: "remediate" })}
          drillTab="overview"
          drillMetric="remediation_velocity"
        />
        <MetricCard
          label="Active schedules"
          value={summary.schedulesSummary.active}
          hint={journey.canSchedule ? "Monitor cadence" : "Upgrade for schedules"}
          drillHref={buildDashboardDeepLink({ tab: "monitor" })}
          drillTab="overview"
          drillMetric="schedules"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card tone="panel" className="p-4">
          <Eyebrow>Severity breakdown</Eyebrow>
          <div className="mt-3">
            <SeverityDonutV2 data={severityData.filter((d) => d.value > 0)} />
          </div>
        </Card>
        <Card tone="panel" className="p-4">
          <Eyebrow>Algorithm families</Eyebrow>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            Parsed from inventory backlog titles — not a formal algorithm audit.
          </p>
          <div className="mt-3">
            {algoData.length ? (
              <AlgorithmFamilyBars data={algoData} />
            ) : (
              <p className="text-sm text-[var(--color-gray-500)]">Run a baseline scan to populate.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
