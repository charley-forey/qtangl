import type { Metadata } from "next";
import { Suspense } from "react";

import ComparisonMatrix from "@/components/compare/ComparisonMatrix";
import CompetitorCardGrid from "@/components/compare/CompetitorCardGrid";
import DiscoveryMethodChart from "@/components/compare/DiscoveryMethodChart";
import PositioningQuadrant from "@/components/compare/PositioningQuadrant";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import {
  compareHubCopy,
  competitorsForMatrix,
  publishedCompetitors,
} from "@/lib/copy/competitors";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/compare/guide",
  title: "PQC Vendor Comparison Guide",
  description:
    "Printable post-quantum readiness vendor comparison — feature matrix, positioning map, and per-vendor summaries.",
  noIndex: true,
});

export default function CompareGuidePage() {
  const competitors = publishedCompetitors();
  const matrixVendors = competitorsForMatrix();

  return (
    <PageShell className="learn-print-area">
      <Section>
        <div className="mx-auto max-w-4xl space-y-2 print:space-y-4">
          <p className="text-label">Qtangl — PQC Vendor Comparison Guide</p>
          <h1 className="text-3xl font-semibold text-white">
            Post-quantum readiness vendors compared
          </h1>
          <p className="text-sm text-[var(--color-gray-400)]">
            {compareHubCopy.methodology.description} Last validated{" "}
            {competitors[0]?.lastValidated ?? "2026-06-06"}.
          </p>
        </div>
      </Section>

      <Section gap="tight">
        <Suspense fallback={<p className="text-sm text-[var(--color-gray-400)]">Loading matrix…</p>}>
          <ComparisonMatrix competitors={matrixVendors} showPicker={false} />
        </Suspense>
      </Section>

      <Section gap="tight" className="print:break-before-page">
        <PositioningQuadrant competitors={matrixVendors} />
      </Section>

      <Section gap="tight" className="print:break-before-page">
        <DiscoveryMethodChart competitors={matrixVendors} />
      </Section>

      <Section className="print:break-before-page">
        <CompetitorCardGrid competitors={competitors} />
      </Section>
    </PageShell>
  );
}
