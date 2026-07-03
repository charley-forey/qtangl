"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type Projection = {
  projected?: number;
  current?: number;
  slope?: number;
};

export type TrajectoryForecast = {
  currentPace?: Projection;
  topFiveClosed?: Projection;
  confidenceBand?: { low?: number; high?: number };
  assumptions?: string[];
};

function ProjectionBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-[var(--color-gray-400)]">{label}</span>
        <span className="font-medium text-white">{value.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/60">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default function TrajectoryForecastCard({
  data,
  scanId,
}: {
  data?: TrajectoryForecast | null;
  scanId?: string | null;
}) {
  const [forecast, setForecast] = useState<TrajectoryForecast | null>(data ?? null);

  useEffect(() => {
    if (data) {
      setForecast(data);
      return;
    }
    void fetchDashboardJson<TrajectoryForecast>("/tenant/analytics/trajectory-forecast")
      .then((result) => {
        setForecast(result);
        trackDashboardEvent({ event: "cc_forecast_viewed", properties: { scenario: "trajectory" } });
      })
      .catch(() => setForecast(null));
  }, [data, scanId]);

  if (!forecast) return null;

  const currentPace = forecast.currentPace?.projected;
  const topFive = forecast.topFiveClosed?.projected;
  if (currentPace == null && topFive == null) return null;

  const band = forecast.confidenceBand;

  return (
    <Card tone="panel" className="space-y-4">
      <Eyebrow>Readiness trajectory</Eyebrow>
      <p className="text-xs text-[var(--color-gray-400)]">
        Two projections from your readiness trend and remediation velocity — estimates, not guarantees.
      </p>
      <div className="space-y-3">
        {currentPace != null ? (
          <ProjectionBar label="At current pace" value={currentPace} tone="bg-sky-400/80" />
        ) : null}
        {topFive != null ? (
          <ProjectionBar label="If top-5 backlog closed" value={topFive} tone="bg-emerald-400/80" />
        ) : null}
      </div>
      {band?.low != null && band?.high != null ? (
        <p className="text-[11px] text-[var(--color-gray-500)]">
          Confidence band: {band.low.toFixed(0)}–{band.high.toFixed(0)}
        </p>
      ) : null}
      {(forecast.assumptions ?? []).length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-[10px] text-[var(--color-gray-500)]">
          {forecast.assumptions?.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
