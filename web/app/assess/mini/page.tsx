import type { Metadata } from "next";
import { Suspense } from "react";

import MiniAssessmentClient from "@/components/marketing/MiniAssessmentClient";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { miniAssessmentCopy } from "@/lib/copy/readiness-value";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/assess/mini",
  title: miniAssessmentCopy.metadata.title,
  description: miniAssessmentCopy.metadata.description,
});

export default function MiniAssessmentPage() {
  const { hero } = miniAssessmentCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />
      <Section gap="tight" className="pb-0">
        <Suspense
          fallback={
            <div className="mx-auto h-64 max-w-xl animate-pulse rounded-[var(--radius-feature)] bg-white/5" />
          }
        >
          <MiniAssessmentClient />
        </Suspense>
      </Section>
    </PageShell>
  );
}
