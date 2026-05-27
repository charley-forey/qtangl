import type { Metadata } from "next";
import Link from "next/link";

import DocsCallout from "@/components/docs/DocsCallout";
import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import MethodComparison from "@/components/visualization/quantum/MethodComparison";
import PipelineDiagram from "@/components/visualization/quantum/PipelineDiagram";
import { conceptsPage } from "@/lib/copy/docs";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/concepts",
  title: "Concepts",
  description:
    "Understand Qtangl's quantum-forward vocabulary, constraint model, and hybrid execution path.",
});

export default function ConceptsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd
        pathname="/docs/concepts"
        title={conceptsPage.title}
        description={conceptsPage.description}
      />
      <DocsShell
        title={conceptsPage.title}
        description={conceptsPage.description}
        pathname="/docs/concepts"
        searchIndex={docsSearchIndex}
      >
        <DocsSection>
          <DocsHeading>{conceptsPage.sections[0].title}</DocsHeading>
          <Card className="rounded-2xl">
            <p className="text-label">{conceptsPage.sections[0].eyebrow}</p>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {conceptsPage.sections[0].description}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-400)]">
              Scheduling, routing, and allocation share the same contract: entities, hard
              constraints, and objectives in — ranked executable plan out.
            </p>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Hard vs soft constraints</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Hard constraints cannot break in the returned plan (precedence, capacity, windows).
            Soft constraints influence ranking and objective scores but may trade off when
            infeasible combinations appear.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Objectives</DocsHeading>
          <p className="text-sm leading-8 text-[var(--color-gray-300)]">
            Objectives encode what your team optimizes for: duration, cost, overtime, miles, or
            coverage. The API returns metrics that map to those objectives so operators and
            engineers read the same story.
          </p>
        </DocsSection>

        <DocsSection>
          <DocsHeading>{conceptsPage.sections[1].title}</DocsHeading>
          <Card strong className="rounded-2xl">
            <p className="text-label">{conceptsPage.sections[1].eyebrow}</p>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {conceptsPage.sections[1].description}
            </p>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>{conceptsPage.sections[2].title}</DocsHeading>
          <Card className="relative overflow-hidden rounded-2xl">
            <ProbabilityGrid className="opacity-70" />
            <div className="relative">
              <p className="text-label">{conceptsPage.sections[2].eyebrow}</p>
              <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
                {conceptsPage.sections[2].description}
              </p>
              <HybridStackDiagram className="mt-6" />
            </div>
          </Card>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Method selection rules</DocsHeading>
          <DocsCallout variant="honesty">
            CP-SAT runs on every schedule job. QAOA is attempted only when the candidate is
            small enough and enabled in the environment. The response method field reflects what
            actually won — not what was attempted.
          </DocsCallout>
        </DocsSection>

        <DocsSection>
          <DocsHeading>Pipeline</DocsHeading>
          <PipelineDiagram />
        </DocsSection>

        <DocsSection>
          <DocsHeading>Classical vs hybrid</DocsHeading>
          <MethodComparison />
        </DocsSection>

        <DocsSection>
          <DocsHeading>{conceptsPage.glossaryTitle}</DocsHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {conceptsPage.glossary.map((term) => (
              <div
                key={term.label}
                className="rounded-xl border border-[var(--border)] bg-black/40 p-4"
              >
                <p className="text-label">{term.label}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {term.meaning}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm">
            <Link
              href="/docs/resources/glossary"
              className="text-white underline underline-offset-4"
            >
              Full glossary →
            </Link>
          </p>
        </DocsSection>

        <Card strong className="rounded-2xl">
          <p className="text-label">Go deeper</p>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Explore the{" "}
            <Link href="/learn" className="text-white underline underline-offset-4">
              Learn section
            </Link>{" "}
            or the{" "}
            <Link
              href="/learn/topics/start-writing-quantum-code"
              className="text-white underline underline-offset-4"
            >
              newcomer guide
            </Link>
            .
          </p>
        </Card>
      </DocsShell>
    </div>
  );
}
