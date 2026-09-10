"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import { ChartEmptyState } from "@/components/dashboard/charts/ChartStates";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

export type DependencyGraphNode = SimulationNodeDatum & {
  id: string;
  label: string;
  kind: string;
  quantumVulnerable?: boolean;
  drillTarget?: string | null;
};

export type DependencyGraphLink = SimulationLinkDatum<DependencyGraphNode> & {
  source: string | DependencyGraphNode;
  target: string | DependencyGraphNode;
};

const MAX_RENDER_NODES = 300;

export default function DependencyGraph({
  nodes,
  links,
  onNodeClick,
  height = 360,
}: {
  nodes: DependencyGraphNode[];
  links: DependencyGraphLink[];
  onNodeClick?: (node: DependencyGraphNode) => void;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const capped = useMemo(() => {
    const slice = nodes.slice(0, MAX_RENDER_NODES);
    const ids = new Set(slice.map((n) => n.id));
    const l = links.filter((link) => {
      const s = typeof link.source === "string" ? link.source : link.source.id;
      const t = typeof link.target === "string" ? link.target : link.target.id;
      return ids.has(s) && ids.has(t);
    });
    return { nodes: slice, links: l };
  }, [nodes, links]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !capped.nodes.length) return;

    const width = svg.clientWidth || 800;
    const simNodes = capped.nodes.map((n) => ({ ...n }));
    const simLinks = capped.links.map((l) => ({ ...l }));

    const simulation = forceSimulation(simNodes)
      .force(
        "link",
        forceLink<DependencyGraphNode, DependencyGraphLink>(simLinks)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(width / 2, height / 2));

    if (reducedMotion) simulation.stop();

    const tick = () => {
      const g = svg.querySelector("g.graph-root");
      if (!g) return;
      g.innerHTML = "";
      for (const link of simLinks) {
        const s = link.source as DependencyGraphNode;
        const t = link.target as DependencyGraphNode;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(s.x ?? 0));
        line.setAttribute("y1", String(s.y ?? 0));
        line.setAttribute("x2", String(t.x ?? 0));
        line.setAttribute("y2", String(t.y ?? 0));
        line.setAttribute("stroke", "rgba(148,163,184,0.35)");
        g.appendChild(line);
      }
      for (const node of simNodes) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(node.x ?? 0));
        circle.setAttribute("cy", String(node.y ?? 0));
        circle.setAttribute("r", node.kind === "host" ? "8" : "5");
        circle.setAttribute(
          "fill",
          node.quantumVulnerable ? "#f87171" : node.kind === "algorithm" ? "#a78bfa" : "#38bdf8"
        );
        circle.setAttribute("tabindex", "0");
        circle.setAttribute("role", "button");
        circle.setAttribute("aria-label", `${node.label} ${node.kind}`);
        circle.style.cursor = "pointer";
        const activate = () => {
          trackDashboardEvent({ event: "cc_chart_interacted", properties: { chart: "dependency_graph", tab: "overview" } });
          onNodeClick?.(node);
        };
        circle.addEventListener("click", activate);
        circle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") activate();
        });
        g.appendChild(circle);
      }
    };

    simulation.on("tick", tick);
    if (reducedMotion) {
      simulation.tick(120);
      tick();
    }
    return () => {
      simulation.stop();
    };
  }, [capped, height, onNodeClick, reducedMotion]);

  if (!nodes.length) return <ChartEmptyState message="Run a scan to map crypto dependencies." />;

  return (
    <svg
      ref={svgRef}
      className="w-full rounded-xl bg-black/30"
      height={height}
      role="img"
      aria-label={`Crypto dependency graph with ${capped.nodes.length} nodes`}
    >
      <g className="graph-root" />
      {nodes.length > MAX_RENDER_NODES ? (
        <text x={8} y={16} fill="#9ca3af" fontSize={10}>
          Showing {MAX_RENDER_NODES} of {nodes.length} nodes
        </text>
      ) : null}
    </svg>
  );
}
