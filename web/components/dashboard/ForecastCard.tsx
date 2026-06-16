"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type Forecast = {
  projected?: number;
  current?: number;
  slope?: number;
};

export default function ForecastCard({ forecast }: { forecast: Forecast | null }) {
  if (!forecast || forecast.projected == null) {
    return null;
  }

  const current = forecast.current ?? forecast.projected;
  const delta = forecast.projected - current;
  const width = Math.min(100, Math.max(0, forecast.projected));

  return (
    <Card tone="panel">
      <Eyebrow>Readiness forecast</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">
        Projected {forecast.projected.toFixed(1)} · Current {current.toFixed(1)}
        {delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta.toFixed(1)})` : ""}
      </p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/60">
        <div
          className="h-full rounded-full bg-sky-400/80 transition-all"
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={forecast.projected}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </Card>
  );
}
