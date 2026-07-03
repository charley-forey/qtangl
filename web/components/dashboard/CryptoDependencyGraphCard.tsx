"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import DependencyGraph, {
  type DependencyGraphLink,
  type DependencyGraphNode,
} from "@/components/dashboard/charts/DependencyGraph";
import { ChartErrorBoundary } from "@/components/dashboard/charts/ChartStates";
import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { buildDashboardDeepLink } from "@/lib/dashboard-deep-links";

type GraphPayload = {
  nodes?: Array<{
    id: string;
    label: string;
    kind: string;
    quantumVulnerable?: boolean;
    drillTarget?: string | null;
  }>;
  edges?: Array<{ source: string; target: string }>;
};

export default function CryptoDependencyGraphCard({ scanId }: { scanId?: string | null }) {
  const [nodes, setNodes] = useState<DependencyGraphNode[]>([]);
  const [links, setLinks] = useState<DependencyGraphLink[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ccFlags.graph || !scanId) return;
    setLoading(true);
    void fetchDashboardJson<GraphPayload>(`/tenant/scans/${scanId}/graph`)
      .then((data) => {
        setNodes(
          (data.nodes ?? []).map((n) => ({
            id: n.id,
            label: n.label,
            kind: n.kind,
            quantumVulnerable: n.quantumVulnerable,
            drillTarget: n.drillTarget,
          }))
        );
        setLinks((data.edges ?? []).map((e) => ({ source: e.source, target: e.target })));
      })
      .catch(() => {
        setNodes([]);
        setLinks([]);
      })
      .finally(() => setLoading(false));
  }, [scanId]);

  if (!ccFlags.graph || !scanId) return null;

  return (
    <Card tone="panel" className="p-4">
      <Eyebrow>Crypto dependency graph</Eyebrow>
      <p className="mt-1 text-[10px] text-[var(--color-gray-500)]">
        Hosts → services → certificates → algorithms. Red = quantum-vulnerable classification from inventory.
      </p>
      <div className="mt-3">
        <ChartErrorBoundary title="Dependency graph unavailable">
          <DependencyGraph
            nodes={nodes}
            links={links}
            onNodeClick={(node) => {
              if (node.drillTarget) {
                window.location.href = buildDashboardDeepLink({ tab: "remediate" });
              }
            }}
          />
        </ChartErrorBoundary>
      </div>
      {loading ? <p className="mt-2 text-[10px] text-[var(--color-gray-500)]">Loading graph…</p> : null}
    </Card>
  );
}
