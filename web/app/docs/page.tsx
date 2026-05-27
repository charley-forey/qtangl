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
import { docsCards } from "@/lib/constants";
import { docsIndex } from "@/lib/copy/product";
import { docsSections } from "@/lib/docs/nav";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs",
  title: "Docs",
  description:
    "Send planning inputs. Read ranked plans, summaries, and measurements from Qtangl's quantum-aware API.",
});

export default function DocsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs"
        title={docsIndex.title}
        description={docsIndex.description}
      />
      <DocsShell
        title={docsIndex.title}
        description={docsIndex.description}
        pathname="/docs"
        searchIndex={docsSearchIndex}
      >
        <DocsCallout variant="honesty">
          Classical baseline on every job. Hybrid QAOA runs only on bounded research candidates.
          If QAOA cannot beat classical, you receive the classical plan with an honest method
          label.
        </DocsCallout>

        <DocsSection>
          <DocsHeading>What it is</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            {docsIndex.whatItIs.description}
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>When to use it</DocsHeading>
          <ul className="space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {docsIndex.whenToUseIt.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm leading-7 text-[var(--color-gray-400)]">
            {docsIndex.whenToUseIt.kicker}
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Start here</DocsHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              title="Quickstart"
              description="First POST /optimize in minutes."
              href="/docs/quickstart"
            />
            <FeatureCard
              title="Authentication"
              description="Bearer tokens and API keys."
              href="/docs/authentication"
            />
            <FeatureCard
              title="API reference"
              description="Per-endpoint fields and examples."
              href="/docs/reference/optimize"
            />
            <FeatureCard
              title="Sandbox"
              description="Try the live API in the browser."
              href="/sandbox"
            />
          </div>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Core guides</DocsHeading>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {docsCards.map((card) => (
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
            <h2 className="heading-section !text-2xl">{docsIndex.whatItIs.title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              One API for scheduling, routing, and staffing. Hard rules in, ranked plan and
              plain-English why out.
            </p>
          </Card>
          <Card tone="feature" className="rounded-[var(--radius-feature)]">
            <h2 className="heading-section !text-2xl">Three phases</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              <li>1. Send the planning state (tasks, crews, windows, constraints).</li>
              <li>2. Search and rank feasible options under hard rules.</li>
              <li>3. Collapse to one executable plan with measurements.</li>
            </ol>
          </Card>
        </div>
      </DocsShell>
    </div>
  );
}
