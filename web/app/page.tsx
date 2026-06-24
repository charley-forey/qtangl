import type { Metadata } from "next";

import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import CoverImage from "@/components/marketing/CoverImage";
import CTA from "@/components/marketing/CTA";
import FeatureCard from "@/components/marketing/FeatureCard";
import Hero from "@/components/marketing/Hero";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import QDayLearningStrip from "@/components/marketing/QDayLearningStrip";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import PageShell from "@/components/layout/PageShell";
import StateTransition from "@/components/quantum/StateTransition";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonLd from "@/components/seo/JsonLd";
import {
  readinessHeadlineDemo,
  readinessHomeNarrative,
  readinessJourneyPoints,
  readinessUseCases,
} from "@/lib/copy/readiness-home";
import { siteMetadata } from "@/lib/copy/product";
import { buildOrganizationJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "",
  title: "Cryptographic Posture Management",
  description: siteMetadata.description,
});

export default function Home() {
  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <Hero />
      </Section>

      <Section>
        <StateTransition>
          <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
            <div className="grid gap-8 lg:grid-cols-[1fr_minmax(220px,320px)] lg:items-center">
              <div>
                <Eyebrow>{readinessHeadlineDemo.eyebrow}</Eyebrow>
                <h2 className="heading-section mt-4">{readinessHeadlineDemo.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
                  {readinessHeadlineDemo.description}
                </p>
                <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-8 sm:max-w-lg">
                  {readinessHeadlineDemo.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-label text-[var(--color-gray-500)]">{stat.label}</dt>
                      <dd className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 lg:hidden">
                  <Button href={readinessHeadlineDemo.primaryCta.href}>
                    {readinessHeadlineDemo.primaryCta.label}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[#141414]">
                  <CoverImage
                    src={readinessHeadlineDemo.image}
                    alt={readinessHeadlineDemo.imageAlt}
                    className="object-cover grayscale"
                  />
                </div>
                <Button href={readinessHeadlineDemo.primaryCta.href} className="hidden shrink-0 lg:inline-flex">
                  {readinessHeadlineDemo.primaryCta.label}
                </Button>
              </div>
            </div>
          </Card>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <div className="content-reading">
            <Eyebrow>{readinessHomeNarrative.workflowEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{readinessHomeNarrative.workflowTitle}</h2>
          </div>
        </StateTransition>
        <Card tone="strong" className="mt-8 overflow-hidden rounded-[var(--radius-feature)]">
          <div className="grid divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {readinessJourneyPoints.map((point) => (
              <div key={point.title} className="px-6 py-6 sm:px-8">
                <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-black/30">
                  <CoverImage
                    src={point.image}
                    alt={point.imageAlt}
                    className="object-cover grayscale opacity-90"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full border border-[var(--border)] bg-black/30 p-2">
                    <MarketingIcon name={point.icon} className="h-5 w-5 text-white" />
                  </span>
                  <p className="text-label">{point.eyebrow}</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{point.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-gray-400)]">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section>
        <StateTransition>
          <div className="content-reading">
            <Eyebrow>{readinessHomeNarrative.domainEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{readinessHomeNarrative.domainTitle}</h2>
          </div>
        </StateTransition>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {readinessUseCases.map((useCase, index) => (
            <StateTransition key={useCase.title} delay={0.04 * index}>
              <FeatureCard
                eyebrow={useCase.eyebrow}
                title={useCase.title}
                href={useCase.demoHref}
                ctaLabel="Open scenario →"
                imageSrc={useCase.image}
                imageAlt={useCase.imageAlt}
              >
                <p className="text-sm leading-7 text-[var(--color-gray-300)]">{useCase.outcome}</p>
                <p className="text-label mt-4 text-white">{useCase.measurement}</p>
              </FeatureCard>
            </StateTransition>
          ))}
        </div>
        <StateTransition>
          <div className="mt-8">
            <Button href={readinessHomeNarrative.qDayLink.href} variant="ghost" size="sm" className="px-0">
              {readinessHomeNarrative.qDayLink.label}
            </Button>
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <QDayLearningStrip />
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <ValueProofStrip title="Why security teams choose Qtangl" />
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <ApiPreviewSection />
        </StateTransition>
      </Section>

      <Section gap="tight" className="pb-0">
        <CTA />
      </Section>
      <JsonLd data={buildOrganizationJsonLd()} />
    </PageShell>
  );
}
