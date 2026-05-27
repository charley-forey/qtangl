"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import type { LibraryCategorySummary, LibraryIndexEntry } from "@/lib/library-types";
import { trackEvent } from "@/lib/analytics";

type GraphNode = SimulationNodeDatum & {
  id: string;
  label: string;
  kind: "category" | "entry";
  slug: string;
  x?: number;
  y?: number;
};

type GraphLink = SimulationLinkDatum<GraphNode> & {
  source: string | GraphNode;
  target: string | GraphNode;
};

type EcosystemGraphProps = {
  entries: LibraryIndexEntry[];
  categories: LibraryCategorySummary[];
};

export default function EcosystemGraph({ entries, categories }: EcosystemGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    const graphNodes: GraphNode[] = categories.map((category) => ({
      id: `cat-${category.slug}`,
      label: category.title,
      kind: "category",
      slug: category.slug,
    }));

    const graphLinks: GraphLink[] = [];

    for (const entry of entries.slice(0, 80)) {
      graphNodes.push({
        id: `entry-${entry.slug}`,
        label: entry.title,
        kind: "entry",
        slug: entry.slug,
      });
      graphLinks.push({
        source: `cat-${entry.category.slug}`,
        target: `entry-${entry.slug}`,
      });
    }

    return { nodes: graphNodes, links: graphLinks };
  }, [categories, entries]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    const width = svg.clientWidth || 900;
    const height = 520;

    const simulation = forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(links)
          .id((node) => node.id)
          .distance(90)
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(width / 2, height / 2));

    simulation.on("tick", () => {
      const circles = nodes
        .map(
          (node) =>
            `<circle cx="${node.x ?? 0}" cy="${node.y ?? 0}" r="${node.kind === "category" ? 10 : 5}" fill="${node.kind === "category" ? "#fff" : "#666"}" data-id="${node.slug}" data-kind="${node.kind}" />`
        )
        .join("");
      const labels = nodes
        .filter((node) => node.kind === "category")
        .map(
          (node) =>
            `<text x="${(node.x ?? 0) + 12}" y="${(node.y ?? 0) + 4}" fill="#ccc" font-size="11">${node.label}</text>`
        )
        .join("");
      svg.innerHTML = `<g>${circles}${labels}</g>`;
    });

    return () => {
      simulation.stop();
    };
  }, [links, nodes]);

  const filtered = selectedSlug
    ? entries.filter((entry) => entry.slug === selectedSlug || entry.category.slug === selectedSlug)
    : entries.slice(0, 12);

  return (
    <div className="space-y-6">
      <div
        className="overflow-hidden rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/40"
        onClick={(event) => {
          const target = event.target as SVGElement;
          if (target.tagName === "circle") {
            const slug = target.getAttribute("data-id");
            const kind = target.getAttribute("data-kind");
            if (slug && kind) {
              setSelectedSlug(slug);
              trackEvent("learn_map_select", { slug, kind });
            }
          }
        }}
      >
        <svg ref={svgRef} viewBox="0 0 900 520" className="h-[520px] w-full" role="img" aria-label="Ecosystem graph" />
      </div>
      <p className="text-sm text-[var(--color-gray-400)]">
        Click a node to filter. Showing {filtered.length} resources.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <Link
            key={entry.slug}
            href={`/learn/library/${entry.slug}`}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--color-gray-300)] hover:text-white"
          >
            {entry.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
