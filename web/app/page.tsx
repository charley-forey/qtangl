import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import CTA from "@/components/marketing/CTA";
import FeatureCard from "@/components/marketing/FeatureCard";
import Hero from "@/components/marketing/Hero";
import ProductPreview from "@/components/marketing/ProductPreview";
import PageShell from "@/components/layout/PageShell";
import StateTransition from "@/components/quantum/StateTransition";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { homeProductPreview, homeSections, homeHero, homepageNarrative } from "@/lib/copy/home";
import { quantumLexicon } from "@/lib/copy/voice";
import {
  apiPreviewRequest,
  apiPreviewResponse,
  platformHighlights,
  problemPoints,
  solutionPoints,
  useCases,
  workflowSteps,
} from "@/lib/constants";
import { siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "Home",
  description: siteMetadata.description,
};

const { interference } = quantumLexicon;

export default function Home() {
  return (
    <PageShell>
      <Section gap="tight" className="pt-8 sm:pt-10">
        <Hero />
      </Section>

      <Section gap="tight">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <StateTransition>
            <div className="content-reading">
              <Eyebrow>{homepageNarrative.problemEyebrow}</Eyebrow>
              <h2 className="heading-section mt-4">
                {homepageNarrative.problemTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
                {homepageNarrative.problemDescription}
              </p>
              <Card tone="strong" className="mt-6 rounded-[var(--radius-xl)]">
                <p className="text-sm leading-7 text-[var(--color-gray-200)]">
                  {homeHero.signal}
                </p>
              </Card>
            </div>
          </StateTransition>

          <div className="grid gap-4 md:grid-cols-2">
            {problemPoints.map((point, index) => (
              <StateTransition key={point.description} delay={0.05 * index}>
                <Card tone="strong" size="md" className="h-full rounded-[var(--radius-xl)]">
                  <p className="text-label">{point.eyebrow}</p>
                  <p className="text-sm leading-7 text-[var(--color-gray-300)]">
                    {point.description}
                  </p>
                </Card>
              </StateTransition>
            ))}
          </div>
        </div>
      </Section>

      <Section gap="tight">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <StateTransition>
            <div className="content-reading">
              <Eyebrow>{homeSections.solution.eyebrow}</Eyebrow>
              <h2 className="heading-section mt-4">
                {homeSections.solution.title}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
                {homeSections.solution.description}
              </p>
            </div>
          </StateTransition>
          <div className="space-y-4">
            {solutionPoints.map((point, index) => (
              <StateTransition key={point.description} delay={0.05 * index}>
                <Card tone="strong" size="md" className="rounded-[var(--radius-xl)]">
                  <p className="text-label">{point.eyebrow}</p>
                  <p className="text-sm leading-7 text-[var(--color-gray-300)]">
                    {point.description}
                  </p>
                </Card>
              </StateTransition>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {platformHighlights.map((item, index) => (
            <StateTransition key={item.title} delay={0.05 * index}>
              <FeatureCard
                eyebrow={item.eyebrow}
                title={item.title}
                description={item.description}
              />
            </StateTransition>
          ))}
          <StateTransition delay={0.05 * platformHighlights.length}>
            <FeatureCard
              eyebrow="Ecosystem map"
              title="Learn the landscape behind the product"
              description="Explore the open-source quantum tools, frameworks, simulators, and optimization libraries that shape the broader ecosystem around Qtangl."
              href="/learn"
              ctaLabel="Open Learn"
            >
              <p>
                <span className="font-semibold text-white">Start here:</span> category
                guides, flagship tools, and optimization comparisons.
              </p>
            </FeatureCard>
          </StateTransition>
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
        <div className="flex items-end justify-between gap-4">
          <StateTransition>
            <div className="content-reading">
              <Eyebrow>{homepageNarrative.architectureEyebrow}</Eyebrow>
              <h2 className="heading-section mt-4">
                {homepageNarrative.architectureTitle}
              </h2>
            </div>
          </StateTransition>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <StateTransition key={step.title} delay={0.05 * index}>
              <Card tone="feature" size="lg" className="h-full rounded-[var(--radius-feature)]">
                <div className="text-label text-white">{step.eyebrow}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {step.description}
                </p>
              </Card>
            </StateTransition>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="flex items-end justify-between gap-4">
          <StateTransition>
            <div className="content-reading">
              <Eyebrow>{homepageNarrative.domainEyebrow}</Eyebrow>
              <h2 className="heading-section mt-4">
                {homepageNarrative.domainTitle}
              </h2>
            </div>
          </StateTransition>
        </div>
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
                  <span className="font-semibold text-white">Problem:</span>{" "}
                  {useCase.problem}
                </p>
                <p>
                  <span className="font-semibold text-white">{interference.label}:</span>{" "}
                  {useCase.interference}
                </p>
                <p>
                  <span className="font-semibold text-white">Outcome:</span>{" "}
                  {useCase.outcome}
                </p>
                <p>
                  <span className="font-semibold text-white">Value:</span>{" "}
                  {useCase.value}
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
