import type { Metadata } from "next";

import ExecutiveBriefingClient from "@/components/marketing/ExecutiveBriefingClient";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { executiveBriefingCopy } from "@/lib/copy/readiness-briefing";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/q-day/briefing",
  title: executiveBriefingCopy.metadata.title,
  description: executiveBriefingCopy.metadata.description,
});

export default function ExecutiveBriefingPage() {
  const { hero } = executiveBriefingCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />
      <Section gap="tight" className="pb-0">
        <ExecutiveBriefingClient />
      </Section>
    </PageShell>
  );
}
