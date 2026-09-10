"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#f87171",
  high: "#fbbf24",
  medium: "#94a3b8",
  low: "#64748b",
  info: "#475569",
};

export default function SeverityCountsDonut({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  if (total === 0) {
    return <p className="text-xs text-[var(--color-gray-500)]">No severity data yet.</p>;
  }
  const chartData = entries.map(([severity, count]) => ({
    name: severity,
    value: count,
    fill: SEVERITY_COLORS[severity] ?? "#64748b",
  }));

  return (
    <div>
      <div className="relative h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-white">{total}</span>
        </div>
      </div>
      <ul aria-label="Severity counts" className="mt-3 space-y-1 text-xs text-[var(--color-gray-300)]">
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 capitalize">
              <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
              {entry.name}
            </span>
            <span className="font-mono">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
