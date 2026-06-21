import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Card from "@/components/ui/Card";
import { pqcDocsCards } from "@/lib/constants";
import { readinessDocsIndex } from "@/lib/copy/product";
import { docsSections } from "@/lib/docs/nav";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs",
  title: "Docs",
  description: readinessDocsIndex.description,
});

export default function DocsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs"
        title={readinessDocsIndex.title}
        description={readinessDocsIndex.description}
      />
      <DocsShell
        title={readinessDocsIndex.title}
        description={readinessDocsIndex.description}
        pathname="/docs"
        searchIndex={docsSearchIndex}
      >
        <p className="text-xs text-[var(--color-gray-500)]">Last updated: 2026-06-21</p>

        <DocsCallout variant="honesty">
          Inventory aid, not formal audit. Quantum-vulnerable algorithms are not broken today — Qtangl
          quantifies exposure and exports signed evidence with independent verify links.
        </DocsCallout>

        <DocsSection>
          <DocsHeading>Post-quantum readiness</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            {readinessDocsIndex.whatItIs.description}
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>When to use the PQC scanner</DocsHeading>
          <ul className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {readinessDocsIndex.whenToUseIt.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm leading-7 text-[var(--color-gray-400)]">
            {readinessDocsIndex.whenToUseIt.kicker}
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Start here — PQC journey</DocsHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title="Assess workflow"
              description="Run a baseline scan and persist results."
              href="/docs/guides/assess"
            />
            <FeatureCard
              title="Report formats"
              description="PDF, bundle, executive, board, and auditor exports."
              href="/docs/guides/report-formats"
            />
            <FeatureCard
              title="Verify evidence"
              description="Independently check signed assessment proofs."
              href="/docs/guides/verify"
            />
            <FeatureCard
              title="Monitor workflow"
              description="Scheduled re-scans, drift alerts, and remediation."
              href="/docs/guides/monitor-workflow"
            />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>PQC guides & reference</DocsHeading>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pqcDocsCards.map((card) => (
              <FeatureCard
                key={card.href}
                title={card.title}
                description={card.description}
                href={card.href}
              />
            ))}
          </div>
        </DocsSection>

        <DocsSection>
          <DocsCallout variant="info" title="Labs / optimization (expansion)">
            Hybrid scheduling and routing APIs remain available for expansion demos. Primary documentation
            focuses on Q-Day readiness — Assess, Monitor, Convert. See{" "}
            <Link href="/docs/labs">Labs overview</Link> for optimization guides and{" "}
            <code className="text-xs">POST /optimize</code> reference.
          </DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Documentation map</DocsHeading>
          <div className="grid gap-6 lg:grid-cols-2">
            {docsSections.map((section) => (
              <Card key={section.id} className="rounded-2xl">
                <p className="text-label">{section.title}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-[var(--color-gray-300)] underline-offset-4 hover:text-white hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </DocsSection>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card tone="strong" className="rounded-[var(--radius-xl)]">
            <h2 className="heading-section !text-2xl">{readinessDocsIndex.whatItIs.title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              Assess → Monitor → Convert with signed evidence on every assessment.
            </p>
          </Card>
          <Card tone="feature" className="rounded-[var(--radius-feature)]">
            <h2 className="heading-section !text-2xl">Three tiers</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              <li>1. Assess — baseline scan, Mosca HNDL, CBOM, signed PDF.</li>
              <li>2. Monitor — scheduled re-scans, diff alerts, remediation board.</li>
              <li>3. Convert — playbooks, workshops, re-scan verification.</li>
            </ol>
          </Card>
        </div>
      </DocsShell>
    </div>
  );
}
