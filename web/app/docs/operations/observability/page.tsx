import type { Metadata } from "next";
import Link from "next/link";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import LatencyEnvelope from "@/components/visualization/quantum/LatencyEnvelope";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/observability",
  title: "Observability",
  description: "Diagnostics, latency envelope, and method metadata in API responses.",
});

export default function ObservabilityPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/observability" title="Observability" description="Diagnostics." />
      <DocsShell
        title="Observability"
        description="Read solver truth from every response — no black-box optimization."
        pathname="/docs/operations/observability"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>Response diagnostics</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Every successful <code className="font-mono text-white">/optimize</code> response includes{" "}
            <code className="font-mono text-white">details.solver</code>,{" "}
            <code className="font-mono text-white">details.backend</code>, and{" "}
            <code className="font-mono text-white">details.diagnostics</code> describing
            orchestration, QAOA eligibility, and fallback reasons.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Latency envelope</DocsHeading>
          <LatencyEnvelope />
        </DocsSection>
        <DocsSection>
          <DocsHeading>Request IDs (planned)</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Structured <code className="font-mono text-white">X-Request-Id</code> headers are on the{" "}
            <Link href="/docs/resources/roadmap" className="text-white underline underline-offset-4">
              roadmap
            </Link>
            . Until then, log correlation ids at your API gateway.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
