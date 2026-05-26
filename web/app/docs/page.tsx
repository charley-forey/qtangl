import type { Metadata } from "next";

import DocsShell from "@/components/docs/DocsShell";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import Card from "@/components/ui/Card";
import { docsCards } from "@/lib/constants";
import { docsIndex } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Measure the API: learn how to send planning inputs and read ranked outputs from Qtangl's quantum-aware workflow.",
};

export default function DocsPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <DocsShell
        title={docsIndex.title}
        description={docsIndex.description}
      >
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

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card tone="strong" className="rounded-[var(--radius-xl)]">
            <h2 className="heading-section !text-2xl">{docsIndex.whatItIs.title}</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
              {docsIndex.whatItIs.description}
            </p>
          </Card>

          <Card tone="feature" className="rounded-[var(--radius-feature)]">
            <h2 className="heading-section !text-2xl">{docsIndex.whenToUseIt.title}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {docsIndex.whenToUseIt.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-[var(--color-gray-400)]">
              {docsIndex.whenToUseIt.kicker}
            </p>
          </Card>
        </div>
      </DocsShell>
    </div>
  );
}
