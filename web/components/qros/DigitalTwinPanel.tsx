"use client";

import { useCallback, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import DependencyGraph, {
  type DependencyGraphLink,
  type DependencyGraphNode,
} from "@/components/dashboard/charts/DependencyGraph";
import { fetchDigitalTwin } from "@/lib/qros-api";
import { useQrosQuery } from "@/lib/qros-hooks";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type Props = {
  scanId: string | null;
};

export default function DigitalTwinPanel({ scanId }: Props) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const fetcher = useCallback(
    () => (scanId ? fetchDigitalTwin(scanId, selectedNodeId) : Promise.reject(new Error("no scan"))),
    [scanId, selectedNodeId]
  );

  const { data, loading, error } = useQrosQuery(fetcher, [scanId, selectedNodeId]);

  const graphNodes = useMemo(() => {
    const raw = (data?.graph?.nodes as Array<Record<string, unknown>>) ?? [];
    return raw.map(
      (n): DependencyGraphNode => ({
        id: String(n.id),
        label: String(n.label ?? n.id),
        kind: String(n.kind ?? "host"),
        quantumVulnerable: Boolean(n.quantumVulnerable),
        drillTarget: (n.drillTarget as string | null) ?? null,
      })
    );
  }, [data]);

  const graphLinks = useMemo(() => {
    const raw = (data?.graph?.edges as Array<Record<string, unknown>>) ?? [];
    return raw.map(
      (e): DependencyGraphLink => ({
        source: String(e.source),
        target: String(e.target),
      })
    );
  }, [data]);

  if (!scanId) {
    return (
      <EmptyState title="Digital twin unavailable" description="Complete a scan to load the dependency model." />
    );
  }

  if (error) {
    return <EmptyState title="Digital twin unavailable" description="Unable to load dependency graph." />;
  }

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Crypto digital twin</h2>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Click a node to simulate blast radius for migration sequencing.
      </p>
      {loading ? (
        <p className="mt-4 text-sm text-[var(--color-gray-400)]" aria-live="polite">
          Loading graph…
        </p>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
            <DependencyGraph
              nodes={graphNodes}
              links={graphLinks}
              height={320}
              onNodeClick={(node) => {
                setSelectedNodeId(node.id);
                trackDashboardEvent({
                  event: "cc_chart_interacted",
                  properties: { chart: "digital_twin", tab: "remediate" },
                });
              }}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-gray-500)]">{data?.simulationNote}</p>
          <p className="mt-2 text-sm text-white">
            Blast radius: {(data?.blastRadius ?? []).length} node(s)
            {selectedNodeId ? ` · selected ${selectedNodeId}` : ""}
          </p>
        </>
      )}
    </Card>
  );
}
