import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { siteMetadata } from "@/lib/copy/product";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/operations/data-retention",
  title: "Data retention",
  description: "What Qtangl logs during the pilot and how to request deletion.",
});

export default function DataRetentionPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/data-retention" title="Data retention" description="Retention policy." />
      <DocsShell
        title="Data retention"
        description="Pilot logging is minimal by design. Production policies will be contractual."
        pathname="/docs/operations/data-retention"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>What we store (pilot)</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Aggregated request metadata for rate limiting (per-key counters).</li>
            <li>Hospital roster upload sessions (24-hour TTL in memory).</li>
            <li>Server error logs without full request bodies by default.</li>
          </ul>
        </DocsSection>
        <DocsSection>
          <DocsHeading>What we do not store</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Qtangl does not persist completed optimize plans in a customer data warehouse during
            the pilot unless you opt into a future logging product.
          </p>
        </DocsSection>
        <DocsSection>
          <DocsHeading>Deletion requests</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Email{" "}
            <a
              href={`mailto:${siteMetadata.contactEmail}`}
              className="text-white underline underline-offset-4"
            >
              {siteMetadata.contactEmail}
            </a>{" "}
            with your organization name and the pilot key fingerprint (not the full key).
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
