"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MonitorDriftBySource } from "@/lib/copy/monitor-scenarios";

const SOURCE_LABELS = {
  external: "External TLS",
  host: "Host fleet",
  code: "Code/runtime",
  cbom: "CBOM",
} as const;

export default function MonitorDriftSourcesChart({ data }: { data: MonitorDriftBySource }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = (Object.keys(SOURCE_LABELS) as (keyof MonitorDriftBySource)[]).map(
    (key) => ({
      source: SOURCE_LABELS[key],
      added: data[key].added,
      removed: data[key].removed,
    })
  );

  if (!mounted) {
    return (
      <div className="space-y-3" role="img" aria-label="Drift by source">
        {chartData.map((row) => (
          <div key={row.source}>
            <div className="mb-1 flex justify-between text-xs text-[var(--color-gray-400)]">
              <span>{row.source}</span>
              <span>+{row.added} / −{row.removed}</span>
            </div>
            <div className="flex h-3 gap-1">
              <div
                className="rounded bg-sky-400/80"
                style={{ width: `${Math.min(100, row.added * 8)}%` }}
              />
              <div
                className="rounded bg-red-400/60"
                style={{ width: `${Math.min(100, row.removed * 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-44 w-full" role="img" aria-label="Drift changes by source type">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="source" tick={{ fill: "#9ca3af", fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={48} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} width={24} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="added" name="Added" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="removed" name="Removed" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="sr-only">
        <caption>Drift by source</caption>
        <thead>
          <tr>
            <th>Source</th>
            <th>Added</th>
            <th>Removed</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row) => (
            <tr key={row.source}>
              <td>{row.source}</td>
              <td>{row.added}</td>
              <td>{row.removed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
