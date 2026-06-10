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
  path: "/docs/guides/drift-monitoring",
  title: "Unified drift monitoring",
  description: "Cross-source drift snapshots for external scans, host fleet, code/binary, and CBOM.",
});

export default function DriftMonitoringGuidePage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/guides/drift-monitoring"
        title="Unified drift monitoring"
        description="Portfolio drift across Monitor and Discovery sources."
      />
      <DocsShell
        title="Drift monitoring"
        description="Qtangl persists drift snapshots per source and scope, then computes unified deltas on each scheduled or manual rescan."
        pathname="/docs/guides/drift-monitoring"
        searchIndex={docsSearchIndex}
      >
        <DocsBadge status="ga" />
        <DocsSection>
          <DocsHeading>Sources</DocsHeading>
          <ul className="list-disc pl-5 text-sm text-[var(--color-gray-300)]">
            <li>External TLS scans — per target domain</li>
            <li>Host fleet — per fleet or agent scope</li>
            <li>Code / binary — per repo or image ref</li>
            <li>CBOM — per tenant aggregate</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>API</DocsHeading>
          <p className="text-sm text-[var(--color-gray-300)]">
            See <a href="/docs/reference/drift-api">Drift API reference</a> for{" "}
            <code>GET /tenant/drift/summary</code> and scope detail endpoints.
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
