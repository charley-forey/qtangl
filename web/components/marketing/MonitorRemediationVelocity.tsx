"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type VelocityPoint = { week: string; open: number; closed: number };

export default function MonitorRemediationVelocity({ data }: { data: VelocityPoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="space-y-2" role="img" aria-label="Remediation velocity">
        {data.map((row) => (
          <div key={row.week} className="flex justify-between text-xs text-[var(--color-gray-400)]">
            <span>{row.week}</span>
            <span>
              Open {row.open} · Closed {row.closed}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-48 w-full" role="img" aria-label="Remediation open vs closed over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} width={28} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="open"
            name="Open"
            stroke="#fb923c"
            fill="#fb923c"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="closed"
            name="Closed"
            stroke="#34d399"
            fill="#34d399"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
