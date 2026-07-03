"use client";

import { useMemo } from "react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

import { ChartEmptyState } from "@/components/dashboard/charts/ChartStates";

export type SankeyLink = { source: number; target: number; value: number };
export type SankeyNode = { name: string };

export default function CcSankey({
  nodes,
  links,
  height = 220,
}: {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
}) {
  const data = useMemo(() => ({ nodes, links }), [nodes, links]);
  if (!links.length) {
    return <ChartEmptyState message="Remediation flow will appear after status updates." />;
  }

  return (
    <div role="img" aria-label="Remediation flow sankey">
      <ResponsiveContainer width="100%" height={height}>
      <Sankey
        data={data}
        node={{ fill: "#1e293b", stroke: "#334155" }}
        link={{ stroke: "#38bdf8", strokeOpacity: 0.35 }}
        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
      >
        <Tooltip />
      </Sankey>
    </ResponsiveContainer>
    </div>
  );
}
