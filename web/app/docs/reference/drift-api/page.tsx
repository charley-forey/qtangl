import type { Metadata } from "next";

import DocsBadge from "@/components/docs/DocsBadge";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/reference/drift-api",
  title: "Drift API reference",
  description: "Tenant drift summary, scope detail, and history endpoints.",
});

export default function DriftApiReferencePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/reference/drift-api"
        title="Drift API reference"
        description="REST endpoints for unified drift monitoring."
      />
      <DocsShell
        title="Drift API"
        description="Authenticated tenant endpoints (Bearer API key)."
        pathname="/docs/reference/drift-api"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="ga" />
        <DocsSection>
          <DocsHeading>GET /tenant/drift/summary</DocsHeading>
          <p className="text-sm text-[var(--color-gray-300)]">
            Query <code>since_days</code> (default 7). Returns roll-up counts by source type.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>GET /tenant/drift/{"{sourceType}"}/{"{scopeKey}"}</DocsHeading>
          <p className="text-sm text-[var(--color-gray-300)]">
            Latest delta for a scope. <code>sourceType</code>: external, host, code, binary, cbom.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>GET /tenant/drift/history</DocsHeading>
          <p className="text-sm text-[var(--color-gray-300)]">
            Recent snapshots; optional <code>source_type</code> filter.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Webhooks</DocsHeading>
          <p className="text-sm text-[var(--color-gray-300)]">
            Event <code>drift.detected</code> with <code>driftDelta</code> and <code>alerts</code> (schema v2).
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
