import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import EntanglementField from "@/components/quantum/EntanglementField";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { aboutContent } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Qtangl builds coherent planning systems for teams making decisions under hard constraints.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={aboutContent.eyebrow}
        title={aboutContent.title}
        description={aboutContent.intro}
      />
      <Section gap="tight">
        <Card tone="feature" size="lg" className="relative rounded-[var(--radius-feature)]">
          <ProbabilityGrid />
          <div className="relative grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <div>
              <Eyebrow>{aboutContent.missionEyebrow}</Eyebrow>
              <p className="heading-section mt-4 !text-2xl">
                {aboutContent.missionTitle}
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <EntanglementField className="h-full" />
              <div className="grid gap-4">
                {aboutContent.principles.map((principle) => (
                  <div
                    key={principle.title}
                    className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/55 p-4"
                  >
                    <h2 className="text-lg font-semibold text-white">{principle.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {aboutContent.cards.map((card) => (
            <Card key={card.eyebrow} tone="strong" className="rounded-[var(--radius-xl)]">
              <Eyebrow>{card.eyebrow}</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
