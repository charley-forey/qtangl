"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { CryptoAsset } from "@/lib/pqc";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#f87171",
  high: "#fbbf24",
  medium: "#94a3b8",
  low: "#64748b",
  info: "#475569",
};

export default function SeverityDonut({ assets }: { assets: CryptoAsset[] }) {
  const counts = assets.reduce<Record<string, number>>((acc, asset) => {
    const key = asset.vulnerability.severity;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const total = assets.length;
  const entries = Object.entries(counts);

  if (total === 0) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        No severity data captured. This scan may have found zero classified assets or returned partial
        coverage.
      </p>
    );
  }

  const chartData = entries.map(([severity, count]) => ({
    name: severity,
    value: count,
    fill: SEVERITY_COLORS[severity] ?? "#64748b",
  }));

  return (
    <div>
      <div
        className="relative h-40 w-full"
        role="img"
        aria-label={`Severity mix: ${entries.map(([s, c]) => `${s} ${Math.round((c / total) * 100)} percent`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
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
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="uppercase text-[var(--color-gray-400)]">{entry.name}</span>
            <span className="text-white">{Math.round((entry.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Severity distribution</caption>
        <thead>
          <tr>
            <th scope="col">Severity</th>
            <th scope="col">Count</th>
            <th scope="col">Percent</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((entry) => (
            <tr key={entry.name}>
              <td>{entry.name}</td>
              <td>{entry.value}</td>
              <td>{Math.round((entry.value / total) * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
