"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type TrendPoint = {
  scanId: string;
  createdAt: string;
  readinessScore: number;
  readinessBand?: string;
};

export default function ReadinessTrend({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        Run multiple scans (or enable scheduled monitoring) to see readiness trend.
      </p>
    );
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = sorted.map((point) => ({
    label: new Date(point.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: point.readinessScore,
    scanId: point.scanId,
  }));

  const [useChart, setUseChart] = useState(false);
  useEffect(() => {
    setUseChart(sorted.length >= 2 && typeof window !== "undefined" && window.innerWidth >= 640);
  }, [sorted.length]);

  if (useChart) {
    return (
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 10 }} width={28} />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }}
              formatter={(value) => [value, "Readiness"]}
            />
            <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const max = Math.max(...sorted.map((p) => p.readinessScore), 100);

  return (
    <div className="flex gap-1">
      {sorted.map((point) => (
        <div key={point.scanId} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-24 w-full items-end">
            <div
              className="w-full rounded-t bg-[var(--color-accent)]/70"
              style={{ height: `${Math.max(8, (point.readinessScore / max) * 100)}%` }}
              title={`${point.readinessScore} — ${point.scanId}`}
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
