"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type VelocityPoint = { week: string; closed: number };

export default function RemediationVelocityChart({ points }: { points: readonly VelocityPoint[] }) {
  const [useChart, setUseChart] = useState(false);

  useEffect(() => {
    setUseChart(typeof window !== "undefined" && window.innerWidth >= 640);
  }, []);

  const data = points.map((p) => ({ label: p.week, closed: p.closed }));

  if (useChart) {
    return (
      <div className="h-full w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} width={24} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }}
              formatter={(value) => [value, "Items closed"]}
            />
            <Bar dataKey="closed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {data.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-20 w-full items-end">
            <div
              className="w-full rounded-t bg-[var(--color-accent)]/70"
              style={{ height: `${Math.max(8, (point.closed / 4) * 100)}%` }}
              title={`${point.closed} items`}
            />
          </div>
          <span className="font-mono text-[9px] text-[var(--color-gray-500)]">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
