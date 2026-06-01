import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { SolutionsIndex } from "@/components/marketing/SolutionLandingPage";
import Eyebrow from "@/components/ui/Eyebrow";
import { solutionsCopy } from "@/lib/copy/readiness-solutions";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/solutions",
  title: solutionsCopy.index.metadata.title,
  description: solutionsCopy.index.metadata.description,
});

export default function SolutionsIndexPage() {
  const { hero, items } = solutionsCopy.index;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={[
          { href: "/demo/pqc", label: "Run Q-Day scan" },
          { href: "/assess/mini", label: "Free mini-assessment", variant: "secondary" },
        ]}
      />
      <Section gap="tight" className="pb-0">
        <Eyebrow>Vertical playbooks</Eyebrow>
        <SolutionsIndex items={items} />
      </Section>
    </PageShell>
  );
}
