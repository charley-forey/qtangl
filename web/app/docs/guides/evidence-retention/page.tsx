import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/evidence-retention",
  title: "Evidence retention guide",
  description: "Configure evidence vault retention and legal-hold-ready exports for scan and remediation artifacts.",
});

export default function EvidenceRetentionGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/evidence-retention"
      title="Evidence retention guide"
      description="Evidence vault workflows preserve report artifacts for audits while allowing policy-controlled retention changes."
    >
      <DocsSection>
        <DocsHeading>Retention objectives</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Retention policy must balance compliance requirements, incident forensics, and storage cost. Keep signed
          evidence long enough to support regulator lookback periods and contractual attestation windows.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Evidence vault APIs</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>
            List retained evidence: <code className="font-mono text-white">GET /tenant/evidence</code>
          </li>
          <li>
            Apply per-scan retention policy:{" "}
            <code className="font-mono text-white">POST /tenant/evidence/{"{scan_id}"}/retain</code>
          </li>
          <li>
            Export auditable history: <code className="font-mono text-white">GET /tenant/audit/export</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Recommended policy tiers</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Hot evidence: recent 90-180 days for active remediation and customer reviews.</li>
          <li>Warm evidence: 1-3 years for contractual and annual compliance evidence.</li>
          <li>Cold evidence: long-term immutable storage for legal hold or critical incident cases.</li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Lifecycle automation</DocsHeading>
        <DocsCallout variant="tip">
          Trigger retention updates immediately after report generation using{" "}
          <code className="font-mono text-white">GET /tenant/scans/{"{scan_id}"}/report</code> followed by{" "}
          <code className="font-mono text-white">POST /tenant/evidence/{"{scan_id}"}/retain</code>. This avoids orphan
          evidence and keeps retention states deterministic.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
