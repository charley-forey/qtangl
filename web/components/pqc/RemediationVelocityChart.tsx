"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartTooltip from "@/components/charts/ChartTooltip";
import { chartAxisTick, chartGridStroke } from "@/lib/chart-theme";

type VelocityPoint = { week: string; closed: number };

type RemediationVelocityChartProps = {
  points: readonly VelocityPoint[];
  forceChart?: boolean;
  activeWeek?: string | null;
  onWeekHover?: (week: string | null) => void;
};

export default function RemediationVelocityChart({
  points,
  forceChart = false,
  activeWeek,
  onWeekHover,
}: RemediationVelocityChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const data = points.map((p) => ({ label: p.week, closed: p.closed }));
  const highlight = activeWeek ?? hovered;
  const useChart = forceChart || (mounted && typeof window !== "undefined" && window.innerWidth >= 640);

  if (!useChart) {
    return (
      <div className="flex gap-1" role="img" aria-label="Remediation velocity">
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-20 w-full items-end">
              <div
                className="w-full rounded-t bg-[var(--color-accent)]/70 transition-all duration-300"
                style={{ height: `${Math.max(8, (point.closed / 6) * 100)}%` }}
                title={`${point.closed} items`}
              />
            </div>
            <span className="font-mono text-[9px] text-[var(--color-gray-500)]">{point.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full w-full min-w-0" role="img" aria-label="Program velocity chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="velocityBarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="velocityBarDim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#64748b" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={chartAxisTick} axisLine={{ stroke: "#444" }} tickLine={false} />
          <YAxis tick={chartAxisTick} width={24} allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={
              <ChartTooltip
                valueLabel="Items closed"
                extra={() => "Illustrative weekly throughput"}
              />
            }
          />
          <Bar
            dataKey="closed"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={600}
            onMouseLeave={() => {
              setHovered(null);
              onWeekHover?.(null);
            }}
          >
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={highlight && highlight !== entry.label ? "url(#velocityBarDim)" : "url(#velocityBarFill)"}
                onMouseEnter={() => {
                  setHovered(entry.label);
                  onWeekHover?.(entry.label);
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
