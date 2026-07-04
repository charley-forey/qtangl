"use client";

import DependencyGraph from "@/components/dashboard/charts/DependencyGraph";
import type { DemoGraphResponse } from "@/lib/demo";

export default function TopologyWall({ graph }: { graph: DemoGraphResponse | null }) {
  if (!graph?.nodes?.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4 text-sm text-[var(--color-gray-500)]">
        Topology will appear after the first assessment snapshot.
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
      <p className="text-sm font-semibold text-white">Live topology wall</p>
      <div className="mt-3">
        <DependencyGraph
          nodes={graph.nodes.map((node) => ({
            id: node.id,
            label: node.label,
            kind: node.kind,
            quantumVulnerable: node.quantumVulnerable,
          }))}
          links={graph.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
          }))}
          height={320}
        />
      </div>
    </div>
  );
}
