import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import KpiCard from "@/components/dashboard/ui/KpiCard";

export default function DashboardInsightsGrid({
  remediationVelocity,
  sloMetrics,
  anomalyAlerts,
  forecast,
}: {
  remediationVelocity?: {
    closedCount: number;
    openCount: number;
    completionRatePct: number | null;
  } | null;
  sloMetrics?: {
    scanSuccessRatePct: number;
    reportAvailabilityPct: number;
    sampleSize: number;
    targetSloPct: number;
  } | null;
  anomalyAlerts?: Array<{ rule: string; message: string }>;
  forecast?: { projected?: number; current?: number } | null;
}) {
  const hasContent =
    remediationVelocity || sloMetrics || (anomalyAlerts?.length ?? 0) > 0 || forecast;
  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Eyebrow>Insights</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {remediationVelocity ? (
          <KpiCard
            label="Remediation velocity"
            value={
              remediationVelocity.completionRatePct != null
                ? `${remediationVelocity.completionRatePct}%`
                : "—"
            }
            hint={`${remediationVelocity.closedCount} closed / ${remediationVelocity.openCount} open`}
          />
        ) : null}
        {sloMetrics ? (
          <KpiCard
            label="Scan SLO"
            value={`${sloMetrics.scanSuccessRatePct}%`}
            hint={`Target ${sloMetrics.targetSloPct}% · n=${sloMetrics.sampleSize}`}
          />
        ) : null}
        {forecast?.projected != null ? (
          <KpiCard
            label="Q-Day forecast"
            value={forecast.projected}
            hint={forecast.current != null ? `Current ${forecast.current}` : undefined}
          />
        ) : null}
        {(anomalyAlerts?.length ?? 0) > 0 ? (
          <KpiCard
            label="Anomalies"
            value={anomalyAlerts!.length}
            tone="warning"
            hint={anomalyAlerts![0]?.message}
          />
        ) : null}
      </div>
      {(anomalyAlerts?.length ?? 0) > 0 ? (
        <Card tone="ghost" className="border border-amber-500/30">
          <ul className="space-y-1 text-xs text-amber-100/90">
            {anomalyAlerts!.map((alert) => (
              <li key={`${alert.rule}-${alert.message}`}>
                <strong>{alert.rule}:</strong> {alert.message}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
