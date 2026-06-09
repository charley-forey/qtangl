import type { Metadata } from "next";
import Link from "next/link";

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
  title: "Data retention & lifecycle",
  description: "Scan retention, evidence vault, upload TTLs, and tenant offboarding.",
});

export default function DataRetentionPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/operations/data-retention" title="Data retention" description="Retention policy." />
      <DocsShell
        title="Data retention & lifecycle"
        description="Unified retention policy for production tenants. Pilot deployments may use shorter TTLs."
        pathname="/docs/operations/data-retention"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-09</p>

        <DocsSection>
          <DocsHeading>Scan data</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Scan metadata and reports persist per tenant when Postgres is enabled.</li>
            <li>Default evidence retention: 12 months (configurable via tenant settings).</li>
            <li>Explicit retention: <code className="font-mono text-white">POST /tenant/evidence/{"{scanId}"}/retain</code></li>
            <li>Delete individual scans: <code className="font-mono text-white">DELETE /tenant/scans/{"{scanId}"}</code></li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Ephemeral data</DocsHeading>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
            <li>Upload bundle sessions: 24-hour TTL.</li>
            <li>Webhook DLQ entries: 30 days after successful replay.</li>
            <li>Schedule run logs: 90-day TTL sweep.</li>
            <li>Rate-limit counters: rolling 60-second window only.</li>
          </ul>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Offboarding & DSAR</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Full tenant deletion via <code className="font-mono text-white">DELETE /tenant/data</code> (operator+) or{" "}
            <code className="font-mono text-white">POST /tenant/offboard</code> (admin). Removes scans, webhooks,
            integrations, audit log, settings, and blob storage. See{" "}
            <Link href="/docs/guides/data-model" className="text-white underline underline-offset-4">
              Data model guide
            </Link>
            .
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Enterprise agreements</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Custom retention windows and EU residency available by contract. Contact{" "}
            <a href={`mailto:${siteMetadata.contactEmail}`} className="text-white underline underline-offset-4">
              {siteMetadata.contactEmail}
            </a>
            . See{" "}
            <Link href="/docs/trust/data-residency" className="text-white underline underline-offset-4">
              Data residency
            </Link>
            .
          </p>
        </DocsSection>
      </DocsShell>
    </div>
  );
}
