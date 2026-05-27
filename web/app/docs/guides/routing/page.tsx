import type { Metadata } from "next";
import Link from "next/link";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsCallout from "@/components/docs/DocsCallout";
import DocsFieldTable from "@/components/docs/DocsFieldTable";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { tryScenarios } from "@/lib/demo-data";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import type { DocsFieldRow } from "@/lib/docs/types";
import { buildPageMetadata } from "@/lib/seo";

const routingScenario = tryScenarios.find((s) => s.id === "routing")!;

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/routing",
  title: "Routing guide",
  description: "Model stops, vehicles, and delivery windows for route optimization.",
});

export default function RoutingGuidePage() {
  const fields: DocsFieldRow[] = [
    {
      name: "stops[].id",
      type: "string",
      required: true,
      description: "Stop identifier.",
      example: "hospital",
    },
    {
      name: "stops[].serviceWindow",
      type: "string",
      description: "Time window the stop must respect.",
      example: "08:30-10:00",
    },
    {
      name: "vehicles[].id",
      type: "string",
      description: "Fleet unit identifier.",
    },
    {
      name: "constraints[]",
      type: "string[]",
      description: "Ordering and timing rules.",
    },
  ];

  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/routing"
        title="Routing guide"
        description="Routing payload shapes and pilot status."
      />
      <DocsShell
        title="Routing guide"
        description="Documented payload shape for delivery and field-service routing. Live solver path coming soon."
        pathname="/docs/guides/routing"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="pilot" />

        <DocsCallout variant="honesty">
          The API accepts <code className="font-mono text-white">type: routing</code> at the edge,
          but the current backend returns <strong className="text-white">501 Not Implemented</strong>{" "}
          until the routing parser and solver ship. Use the sandbox and examples below to prepare
          integrations. Track progress on the{" "}
          <Link href="/docs/resources/roadmap" className="underline underline-offset-4">
            roadmap
          </Link>
          .
        </DocsCallout>

        <DocsSection>
          <DocsHeading>When to use routing</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Dispatch scenarios where stop order, vehicle capacity, and customer windows dominate
            the objective.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Request fields</DocsHeading>
          <DocsFieldTable fields={fields} />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Example payload</DocsHeading>
          <pre className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-black/40 p-4 text-xs text-[var(--color-gray-200)]">
            {JSON.stringify(routingScenario.apiRequest, null, 2)}
          </pre>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
