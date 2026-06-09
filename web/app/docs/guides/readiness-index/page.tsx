import type { Metadata } from "next";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsSection from "@/components/docs/DocsSection";
import GuidePageLayout from "@/components/docs/GuidePageLayout";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/guides/readiness-index",
  title: "Readiness Index guide",
  description: "Understand how readiness scores are computed from inventory quality, risk, and remediation velocity.",
});

export default function ReadinessIndexGuidePage() {
  return (
    <GuidePageLayout
      pathname="/docs/guides/readiness-index"
      title="Readiness Index explainer"
      description="Readiness Index tracks migration posture by combining exposure, control coverage, and operational progress."
    >
      <DocsSection>
        <DocsHeading>How the index is used</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          The index gives leadership one comparable score per tenant while preserving technical drill-down for operators.
          Use it to prioritize teams, set quarterly targets, and demonstrate trend direction to stakeholders.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Inputs that influence the score</DocsHeading>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
          <li>Scan exposure from recent runs: <code className="font-mono text-white">POST /pqc/scan</code></li>
          <li>
            Drift pressure from recurring change: <code className="font-mono text-white">GET /tenant/drift-intel</code>
          </li>
          <li>
            Remediation throughput:{" "}
            <code className="font-mono text-white">GET /tenant/scans/{"{scan_id}"}/remediation</code>
          </li>
          <li>
            Compliance overlays: <code className="font-mono text-white">GET /tenant/compliance/posture</code>
          </li>
        </ul>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Benchmarking and forecasting</DocsHeading>
        <p className="text-sm leading-8 text-[var(--color-gray-300)]">
          Compare program performance with <code className="font-mono text-white">GET /tenant/benchmarks</code> and
          project trend-lines via <code className="font-mono text-white">GET /tenant/analytics/forecast</code> for
          capacity planning.
        </p>
      </DocsSection>

      <DocsSection>
        <DocsHeading>Governance recommendations</DocsHeading>
        <DocsCallout variant="info">
          Treat index deltas as decision signals, not absolute truth. Pair score movement with raw evidence from{" "}
          <code className="font-mono text-white">GET /tenant/export</code> and signed reports before changing policy
          thresholds or executive commitments.
        </DocsCallout>
      </DocsSection>
    </GuidePageLayout>
  );
}
