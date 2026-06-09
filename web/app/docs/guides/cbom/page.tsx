import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/cbom",
  title: "CBOM aggregator guide",
  description: "Build a tenant-wide cryptography bill of materials from multiple inventories and resolve conflicts.",
});

export default function CbomGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/cbom"
      title="CBOM aggregator guide"
      description="Aggregate cloud and PKI inventory into one normalized CBOM with provenance and drift deltas."
    >
      <DocsSection>
        <DocsHeading>What the aggregator does</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          The CBOM aggregator merges cryptographic component records from cloud inventories, key managers, and CLM into
          one canonical tenant view suitable for readiness scoring and audit exports.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Data collection and aggregation</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            Source inventory status: <code className="font-mono text-white">GET /pqc/cbom/sources</code>
          </li>
          <li>
            Trigger provider pull: <code className="font-mono text-white">POST /pqc/cbom/pull/{"{provider}"}</code>
          </li>
          <li>
            Read merged output: <code className="font-mono text-white">GET /pqc/cbom/aggregate</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Conflict resolution</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Mismatched records (algorithm, key size, ownership) surface as adjudication tasks.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            List unresolved conflicts: <code className="font-mono text-white">GET /pqc/cbom/conflicts</code>
          </li>
          <li>
            Apply resolution strategy:{" "}
            <code className="font-mono text-white">PUT /pqc/cbom/conflicts/{"{conflict_id}"}</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Drift and reporting</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Compare snapshots using <code className="font-mono text-white">GET /pqc/cbom/diff</code> and pair with{" "}
          <code className="font-mono text-white">GET /pqc/report/{"{scan_id}"}?format=cbom</code> to publish
          time-bound evidence for governance reviews.
        </p>
        <DocsCallout variant="tip">
          Keep source provenance fields intact when exporting to downstream systems. Provenance is often required for
          regulator and internal model-risk reviews.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
