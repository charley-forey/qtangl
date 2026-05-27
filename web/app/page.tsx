import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import CTA from "@/components/marketing/CTA";
import FeatureCard from "@/components/marketing/FeatureCard";
import Hero from "@/components/marketing/Hero";
import ProductPreview from "@/components/marketing/ProductPreview";
import PageShell from "@/components/layout/PageShell";
import StateTransition from "@/components/quantum/StateTransition";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  homeHeadlineDemo,
  homeProductPreview,
  homepageNarrative,
} from "@/lib/copy/home";
import { quantumLexicon } from "@/lib/copy/voice";
import {
  apiPreviewRequest,
  apiPreviewResponse,
  quantumWorkflowPoints,
  useCases,
} from "@/lib/constants";
import { siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "Home",
  description: siteMetadata.description,
};

const { interference, measurement } = quantumLexicon;

export default function Home() {
  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <Hero />
      </Section>

      <Section gap="tight">
        <StateTransition>
          <Card tone="feature" className="rounded-[var(--radius-feature)]">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <Eyebrow>{homeHeadlineDemo.eyebrow}</Eyebrow>
                <h2 className="heading-section mt-4">{homeHeadlineDemo.title}</h2>
                <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">
                  {homeHeadlineDemo.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button href={homeHeadlineDemo.primaryCta.href}>
                  {homeHeadlineDemo.primaryCta.label}
                </Button>
                <Button href={homeHeadlineDemo.secondaryCta.href} variant="secondary">
                  {homeHeadlineDemo.secondaryCta.label}
                </Button>
              </div>
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
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {quantumWorkflowPoints.map((point, index) => (
            <StateTransition key={point.title} delay={0.05 * index}>
              <Card tone="feature" size="lg" className="h-full rounded-[var(--radius-feature)]">
                <p className="text-label">{point.eyebrow}</p>
                <h3 className="mt-4 text-xl font-semibold text-white">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {point.description}
                </p>
              </Card>
            </StateTransition>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <StateTransition parallax parallaxOffset={12}>
          <ProductPreview
            eyebrow={homeProductPreview.eyebrow}
            title={homeProductPreview.title}
            description={homeProductPreview.description}
          />
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <div className="content-reading">
            <Eyebrow>{homepageNarrative.domainEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{homepageNarrative.domainTitle}</h2>
          </div>
        </StateTransition>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((useCase, index) => (
            <StateTransition key={useCase.title} delay={0.05 * index}>
              <FeatureCard
                eyebrow={useCase.eyebrow}
                title={useCase.title}
                description={useCase.description}
                imageSrc={useCase.image}
                imageAlt={useCase.imageAlt}
              >
                <p>
                  <span className="font-semibold text-white">{interference.label}:</span>{" "}
                  {useCase.interference}
                </p>
                <p>
                  <span className="font-semibold text-white">Outcome:</span> {useCase.outcome}
                </p>
                <p>
                  <span className="font-semibold text-white">{measurement.label}:</span>{" "}
                  {useCase.measurement}
                </p>
              </FeatureCard>
            </StateTransition>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <StateTransition>
            <div className="content-reading">
              <Eyebrow>{homepageNarrative.interfaceEyebrow}</Eyebrow>
              <h2 className="heading-section mt-4">
                {homepageNarrative.interfaceTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
                {homepageNarrative.interfaceDescription}
              </p>
            </div>
          </StateTransition>
          <div className="grid gap-5">
            <StateTransition>
              <CodeBlock title="Request" code={apiPreviewRequest} />
            </StateTransition>
            <StateTransition delay={0.05}>
              <CodeBlock title="Response" code={apiPreviewResponse} />
            </StateTransition>
          </div>
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <CTA />
      </Section>
    </PageShell>
  );
}
