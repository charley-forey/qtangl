import type { Metadata } from "next";

import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import CTA from "@/components/marketing/CTA";
import FeatureCard from "@/components/marketing/FeatureCard";
import Hero from "@/components/marketing/Hero";
import PageShell from "@/components/layout/PageShell";
import StateTransition from "@/components/quantum/StateTransition";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonLd from "@/components/seo/JsonLd";
import { homeHeadlineDemo, homepageNarrative } from "@/lib/copy/home";
import { quantumWorkflowPoints, useCases } from "@/lib/constants";
import { siteMetadata } from "@/lib/copy/product";
import { buildOrganizationJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "",
  title: "Home",
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
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <Eyebrow>{homeHeadlineDemo.eyebrow}</Eyebrow>
                <h2 className="heading-section mt-4">{homeHeadlineDemo.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
                  {homeHeadlineDemo.description}
                </p>
                <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-8 sm:max-w-lg">
                  {homeHeadlineDemo.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-label text-[var(--color-gray-500)]">{stat.label}</dt>
                      <dd className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <Button href={homeHeadlineDemo.primaryCta.href} className="shrink-0">
                {homeHeadlineDemo.primaryCta.label}
              </Button>
            </div>
          </Card>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <div className="content-reading">
            <Eyebrow>{homepageNarrative.workflowEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{homepageNarrative.workflowTitle}</h2>
          </div>
        </StateTransition>
        <Card tone="strong" className="mt-8 overflow-hidden rounded-[var(--radius-feature)]">
          <div className="grid divide-y divide-[var(--border)] md:grid-cols-3 md:divide-x md:divide-y-0">
            {quantumWorkflowPoints.map((point) => (
              <div key={point.title} className="px-6 py-6 sm:px-8">
                <p className="text-label">{point.eyebrow}</p>
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
            <Eyebrow>{homepageNarrative.domainEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{homepageNarrative.domainTitle}</h2>
          </div>
        </StateTransition>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {useCases.map((useCase, index) => (
            <StateTransition key={useCase.title} delay={0.04 * index}>
              <FeatureCard
                eyebrow={useCase.eyebrow}
                title={useCase.title}
                href={useCase.demoHref}
                ctaLabel={useCase.demoHref ? "Open demo →" : "Demo coming soon"}
              >
                <p className="text-sm leading-7 text-[var(--color-gray-300)]">{useCase.outcome}</p>
                <p className="text-label mt-4 text-white">{useCase.measurement}</p>
              </FeatureCard>
            </StateTransition>
          ))}
        </div>
        <StateTransition>
          <div className="mt-8">
            <Button href="/demo" variant="ghost" size="sm" className="px-0">
              See all live demos →
            </Button>
          </div>
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
