"use client";

import { useMemo } from "react";
import { ResponsiveContainer, Treemap } from "recharts";

import ChartTooltip from "@/components/charts/ChartTooltip";
import { ChartEmptyState } from "@/components/dashboard/charts/ChartStates";

export type TreemapDatum = { name: string; value: number; fill?: string };

export default function CcTreemap({
  data,
  height = 220,
  onCellClick,
}: {
  data: TreemapDatum[];
  height?: number;
  onCellClick?: (name: string) => void;
}) {
  const filtered = useMemo(() => data.filter((d) => d.value > 0), [data]);
  if (!filtered.length) return <ChartEmptyState message="No business-unit breakdown yet." />;

  return (
    <div role="img" aria-label="Business unit treemap">
      <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={filtered}
        dataKey="value"
        nameKey="name"
        stroke="rgba(255,255,255,0.08)"
        fill="#38bdf8"
        content={(props) => {
          const { x, y, width, height: h, name, value, fill } = props as TreemapDatum & {
            x: number;
            y: number;
            width: number;
            height: number;
          };
          if (width < 4 || h < 4) return <g />;
          return (
            <g
              onClick={() => onCellClick?.(String(name))}
              style={{ cursor: onCellClick ? "pointer" : "default" }}
            >
              <rect x={x} y={y} width={width} height={h} fill={fill || "#38bdf8"} rx={4} />
              {width > 40 && h > 20 ? (
                <text x={x + 6} y={y + 16} fill="#e5e7eb" fontSize={10}>
                  {name}
                </text>
              ) : null}
              {width > 40 && h > 34 ? (
                <text x={x + 6} y={y + 30} fill="#9ca3af" fontSize={9}>
                  {value}
                </text>
              ) : null}
            </g>
          );
        }}
      >
        <ChartTooltip />
      </Treemap>
    </ResponsiveContainer>
    </div>
  );
}
