import type { Metadata } from "next";
import { Suspense } from "react";

import CompareHubAnalytics from "@/components/compare/CompareHubAnalytics";
import ComparisonCta from "@/components/compare/ComparisonCta";
import ComparisonGuideCapture from "@/components/compare/ComparisonGuideCapture";
import ComparisonMatrix from "@/components/compare/ComparisonMatrix";
import CompetitorCardGrid from "@/components/compare/CompetitorCardGrid";
import DiscoveryMethodChart from "@/components/compare/DiscoveryMethodChart";
import PositioningQuadrant from "@/components/compare/PositioningQuadrant";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  compareHubCopy,
  competitorsForMatrix,
  publishedCompetitors,
} from "@/lib/copy/competitors";
import { buildComparisonHubJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/compare",
  title: compareHubCopy.metadata.title,
  description: compareHubCopy.metadata.description,
  image: "/compare/opengraph-image",
});

export default function CompareHubPage() {
  const competitors = publishedCompetitors();
  const matrixVendors = competitorsForMatrix();

  return (
    <PageShell>
      <CompareHubAnalytics />
      <PageHero
        eyebrow={compareHubCopy.hero.eyebrow}
        title={compareHubCopy.hero.title}
        description={compareHubCopy.hero.description}
        actions={[
          { href: "/assess", label: "Run Q-Day scan" },
          { href: "#guide", label: "Get comparison guide", variant: "secondary" },
        ]}
        contentClassName="max-w-4xl"
      />

      <Section gap="tight">
        <div className="mx-auto max-w-3xl space-y-4">
          <Eyebrow>{compareHubCopy.category.eyebrow}</Eyebrow>
          <h2 className="text-2xl font-semibold text-white">{compareHubCopy.category.title}</h2>
          <p className="text-sm leading-7 text-[var(--color-gray-300)]">
            {compareHubCopy.category.description}
          </p>
        </div>
      </Section>

      <Section id="matrix" gap="tight">
        <div className="mb-6">
          <Eyebrow>Feature matrix</Eyebrow>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Capability comparison across vendors
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
            Qtangl is the only vendor with signed + public verify in this matrix. Discovery is table
            stakes — verifiable evidence is the differentiator.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-[var(--color-gray-400)]">Loading matrix…</p>}>
          <ComparisonMatrix competitors={matrixVendors} />
        </Suspense>
      </Section>

      <Section gap="tight">
        <PositioningQuadrant competitors={matrixVendors} />
      </Section>

      <Section gap="tight">
        <DiscoveryMethodChart competitors={matrixVendors} />
      </Section>

      <Section id="methodology" gap="tight">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 p-6">
          <h2 className="text-lg font-semibold text-white">{compareHubCopy.methodology.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {compareHubCopy.methodology.description}
          </p>
        </div>
      </Section>

      <Section gap="tight">
        <Eyebrow>Individual comparisons</Eyebrow>
        <h2 className="mt-2 text-xl font-semibold text-white">Qtangl vs each vendor</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          Deep-dive pages with radar charts, win/lose analysis, and when-to-choose guidance.
        </p>
        <div className="mt-8">
          <CompetitorCardGrid competitors={competitors} />
        </div>
      </Section>

      <Section gap="tight">
        <ComparisonGuideCapture />
      </Section>

      <Section>
        <ComparisonCta source="compare-hub" />
      </Section>

      <JsonLd
        data={buildComparisonHubJsonLd(
          competitors.map((c) => ({ slug: c.slug, name: c.name })),
        )}
      />
    </PageShell>
  );
}
