"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartTooltip from "@/components/charts/ChartTooltip";
import {
  chartAxisTick,
  chartGridStroke,
  readinessBandAreas,
  readinessBandForScore,
  readinessBandLegend,
} from "@/lib/chart-theme";

type TrendPoint = {
  scanId: string;
  createdAt: string;
  readinessScore: number;
  readinessBand?: string;
};

type ReadinessTrendProps = {
  points: TrendPoint[];
  showBands?: boolean;
  showLegend?: boolean;
  forecast?: { current: number; projected: number };
  forceChart?: boolean;
  height?: number;
};

export default function ReadinessTrend({
  points,
  showBands = false,
  showLegend = false,
  forecast,
  forceChart = false,
  height,
}: ReadinessTrendProps) {
  const [mounted, setMounted] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (forecast) setPulseKey((k) => k + 1);
  }, [forecast?.projected]);

  const sorted = useMemo(
    () => [...points].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [points]
  );

  if (sorted.length < 2) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        Run multiple scans (or enable scheduled monitoring) to see readiness trend.
      </p>
    );
  }

  const chartData: {
    label: string;
    score: number;
    scanId: string;
    kind: "actual" | "forecast";
  }[] = sorted.map((point) => ({
    label: new Date(point.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: point.readinessScore,
    scanId: point.scanId,
    kind: "actual" as const,
  }));

  if (forecast) {
    chartData.push({
      label: "What-if",
      score: forecast.projected,
      scanId: "forecast",
      kind: "forecast",
    });
  }

  const forecastIndex = forecast ? chartData.length - 1 : -1;
  const useChart = forceChart || (mounted && sorted.length >= 2);

  if (!useChart) {
    const max = Math.max(...sorted.map((p) => p.readinessScore), 100);
    return (
      <div className="flex gap-1" role="img" aria-label="Readiness trend">
        {sorted.map((point) => (
          <div key={point.scanId} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t bg-[var(--color-accent)]/70 transition-all duration-500"
                style={{ height: `${Math.max(8, (point.readinessScore / max) * 100)}%` }}
                title={`${point.readinessScore}`}
              />
            </div>
            <span className="font-mono text-[9px] text-[var(--color-gray-500)]">{point.readinessScore}</span>
          </div>
        ))}
      </div>
    );
  }

  const chartHeight = height ?? "100%";

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div
        className="w-full min-w-0 flex-1"
        style={typeof chartHeight === "number" ? { height: chartHeight } : undefined}
        role="img"
        aria-label="Readiness trend chart"
        key={pulseKey}
      >
        <ResponsiveContainer width="100%" height={typeof chartHeight === "number" ? chartHeight : "100%"}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="readinessAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {showBands
              ? readinessBandAreas.map((band) => (
                  <ReferenceArea
                    key={`${band.y1}-${band.y2}`}
                    y1={band.y1}
                    y2={band.y2}
                    fill={band.fill}
                    fillOpacity={band.opacity}
                  />
                ))
              : null}
            <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={chartAxisTick} axisLine={{ stroke: "#444" }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={chartAxisTick} width={28} axisLine={false} tickLine={false} />
            <Tooltip
              content={
                <ChartTooltip
                  valueLabel="Readiness"
                  extra={(row) => {
                    if (row.kind === "forecast") return "What-if projection from selected backlog";
                    const score = Number(row.score);
                    return readinessBandForScore(score);
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="none"
              fill="url(#readinessAreaFill)"
              isAnimationActive
              animationDuration={700}
            />
            {forecast ? (
              <ReferenceLine
                y={forecast.current}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ value: "Current", fill: "#94a3b8", fontSize: 10, position: "insideTopRight" }}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, index } = props as { cx: number; cy: number; index: number };
                const isForecast = index === forecastIndex;
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={isForecast ? 5 : 3.5}
                    fill={isForecast ? "#0a0a0a" : "var(--color-accent)"}
                    stroke="var(--color-accent)"
                    strokeWidth={isForecast ? 2 : 0}
                    strokeDasharray={isForecast ? "3 2" : undefined}
                    className={isForecast ? "animate-pulse" : undefined}
                  />
                );
              }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showLegend ? (
        <div className="mt-3 flex flex-wrap gap-3">
          {readinessBandLegend.map((band) => (
            <span key={band.label} className="flex items-center gap-1.5 text-[0.65rem] text-[var(--color-gray-500)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: band.color }} />
              {band.label}
            </span>
          ))}
          {forecast ? (
            <span className="flex items-center gap-1.5 text-[0.65rem] text-emerald-300/90">
              <span className="h-2 w-2 rounded-full border border-emerald-400 bg-transparent" />
              What-if point
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
