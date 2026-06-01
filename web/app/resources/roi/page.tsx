import type { Metadata } from "next";

import ReadinessRoiCalculator from "@/components/marketing/ReadinessRoiCalculator";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { roiPageCopy } from "@/lib/copy/readiness-resources";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/resources/roi",
  title: roiPageCopy.metadata.title,
  description: roiPageCopy.metadata.description,
});

export default function RoiPage() {
  const { hero } = roiPageCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />
      <Section gap="tight" className="pb-0">
        <ReadinessRoiCalculator />
      </Section>
    </PageShell>
  );
}
