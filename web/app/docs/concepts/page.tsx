import type { Metadata } from "next";

import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import { conceptsPage } from "@/lib/copy/docs";

export const metadata: Metadata = {
  title: "Concepts",
  description:
    "Understand Qtangl's quantum-forward vocabulary, constraint model, and hybrid execution path.",
};

export default function ConceptsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsShell
        title={conceptsPage.title}
        description={conceptsPage.description}
      >
        <div className="grid gap-6">
          <Card as="section" className="rounded-2xl">
            <p className="text-label">{conceptsPage.sections[0].eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">{conceptsPage.sections[0].title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {conceptsPage.sections[0].description}
            </p>
          </Card>

          <Card as="section" strong className="rounded-2xl">
            <p className="text-label">{conceptsPage.sections[1].eyebrow}</p>
            <h2 className="text-2xl font-semibold text-white">{conceptsPage.sections[1].title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {conceptsPage.sections[1].description}
            </p>
          </Card>

          <Card as="section" className="relative overflow-hidden rounded-2xl">
            <ProbabilityGrid className="opacity-70" />
            <div className="relative">
              <p className="text-label">{conceptsPage.sections[2].eyebrow}</p>
              <h2 className="text-2xl font-semibold text-white">{conceptsPage.sections[2].title}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
                {conceptsPage.sections[2].description}
              </p>
              <HybridStackDiagram className="mt-6" />
            </div>
          </Card>

          <Card as="section" className="rounded-2xl">
            <h2 className="text-2xl font-semibold text-white">{conceptsPage.glossaryTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          </Card>
        </div>
      </DocsShell>
    </div>
  );
}
