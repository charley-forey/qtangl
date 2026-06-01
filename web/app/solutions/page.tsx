import type { Metadata } from "next";

import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
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
          { href: "/assess", label: "Run Q-Day scan" },
          { href: "/assess/mini", label: "Free mini-assessment", variant: "secondary" },
        ]}
      />
      <Section gap="tight">
        <Eyebrow>Vertical playbooks</Eyebrow>
        <SolutionsIndex items={items} />
      </Section>
      <Section gap="tight" className="pb-0">
        <FrameworkCoverageStrip intro="Banking, government, and healthcare teams use Qtangl to map quantum-vulnerable cryptography to the exact mandates their assessors cite — NSM-10, CNSA 2.0, NIST IR 8547, PCI-DSS 4.0, and CMMC — with signed, verifiable evidence." />
      </Section>
    </PageShell>
  );
}
