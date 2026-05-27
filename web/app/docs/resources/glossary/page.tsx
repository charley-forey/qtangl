import type { Metadata } from "next";

import DocsHeading from "@/components/docs/DocsHeading";
import DocsJsonLd from "@/components/docs/DocsJsonLd";
import DocsSection from "@/components/docs/DocsSection";
import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import { glossary } from "@/lib/docs/glossary";
import { docsSearchIndex } from "@/lib/docs/search-index-export";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/docs/resources/glossary",
  title: "Glossary",
  description: "Quantum vocabulary mapped to engineering language for Qtangl.",
});

export default function GlossaryPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsJsonLd pathname="/docs/resources/glossary" title="Glossary" description="Term definitions." />
      <DocsShell
        title="Glossary"
        description="Surface vocabulary for product and ops. Underneath: constraint graphs, solvers, and ranked JSON."
        pathname="/docs/resources/glossary"
        searchIndex={docsSearchIndex}
      >
        <div className="grid gap-4">
          {glossary.map((entry) => (
            <DocsSection key={entry.id}>
              <DocsHeading id={entry.id}>{entry.quantum}</DocsHeading>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
                  <p className="text-label">Quantum</p>
                  <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                    {entry.quantumMeaning}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-black/40 p-4">
                  <p className="text-label">{entry.engineering}</p>
                  <p className="mt-2 text-sm text-[var(--color-gray-300)]">
                    {entry.engineeringMeaning}
                  </p>
                </div>
              </div>
            </DocsSection>
          ))}
        </div>
      </DocsShell>
    </div>
  );
}
