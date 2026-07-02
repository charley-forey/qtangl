"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonitorTrendPoint } from "@/lib/copy/monitor-scenarios";

type Props = {
  points: MonitorTrendPoint[];
  forecast?: { current: number; projected: number };
  anomalyIndex?: number;
  height?: number;
};

export default function MonitorReadinessChart({
  points,
  forecast,
  anomalyIndex,
  height = 160,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (points.length < 2) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        Run multiple scans to see readiness trend.
      </p>
    );
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = sorted.map((point, index) => ({
    label: new Date(point.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    score: point.readinessScore,
    scanId: point.scanId,
    isAnomaly: anomalyIndex === index,
  }));

  if (forecast) {
    chartData.push({
      label: "Forecast",
      score: forecast.projected,
      scanId: "forecast",
      isAnomaly: false,
    });
  }

  if (!mounted) {
    const max = Math.max(...sorted.map((p) => p.readinessScore), 100);
    return (
      <div className="flex gap-1" role="img" aria-label="Readiness trend chart">
        {sorted.map((point) => (
          <div key={point.scanId} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t bg-[var(--color-accent)]/70"
                style={{ height: `${Math.max(8, (point.readinessScore / max) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-[var(--color-gray-500)]">
              {point.readinessScore}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const forecastIndex = forecast ? chartData.length - 1 : -1;

  return (
    <div className="w-full" style={{ height }} role="img" aria-label="Readiness trend with forecast">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <ReferenceArea y1={0} y2={60} fill="#ef4444" fillOpacity={0.06} />
          <ReferenceArea y1={60} y2={80} fill="#f59e0b" fillOpacity={0.06} />
          <ReferenceArea y1={80} y2={100} fill="#22c55e" fillOpacity={0.06} />
          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} width={28} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }}
            formatter={(value) => [value, "Readiness"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, index } = props as { cx: number; cy: number; index: number };
              const isForecast = index === forecastIndex;
              const isAnomaly = chartData[index]?.isAnomaly;
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={isAnomaly ? 5 : 3}
                  fill={isAnomaly ? "#f87171" : isForecast ? "transparent" : "var(--color-accent)"}
                  stroke={isForecast ? "var(--color-accent)" : undefined}
                  strokeDasharray={isForecast ? "4 2" : undefined}
                />
              );
            }}
            strokeDasharray={forecast ? undefined : undefined}
          />
          {forecast ? (
            <ReferenceLine
              y={forecast.current}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{ value: "Current", fill: "#64748b", fontSize: 10 }}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>Readiness trend data</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.scanId}>
              <td>{p.createdAt}</td>
              <td>{p.readinessScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
