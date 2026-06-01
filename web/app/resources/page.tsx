import type { Metadata } from "next";

import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { resourcesPageCopy } from "@/lib/copy/readiness-resources";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/resources",
  title: resourcesPageCopy.metadata.title,
  description: resourcesPageCopy.metadata.description,
});

export default function ResourcesPage() {
  const { hero, cards } = resourcesPageCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <FeatureCard
              key={card.href}
              title={card.title}
              description={card.description}
              href={card.href}
              ctaLabel="Open →"
            />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
