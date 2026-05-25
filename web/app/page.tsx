import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import CTA from "@/components/marketing/CTA";
import FeatureCard from "@/components/marketing/FeatureCard";
import Hero from "@/components/marketing/Hero";
import StateTransition from "@/components/quantum/StateTransition";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { homeHero, homepageNarrative } from "@/lib/copy/home";
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

export default function Home() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <Hero />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <StateTransition>
            <div>
              <Eyebrow>{homepageNarrative.problemEyebrow}</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {homepageNarrative.problemTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
                {homepageNarrative.problemDescription}
              </p>
              <Card className="mt-6 rounded-2xl">
                <p className="text-sm leading-7 text-[var(--color-gray-200)]">
                  {homeHero.signal}
                </p>
              </Card>
            </div>
          </StateTransition>

          <div className="grid gap-4 sm:grid-cols-2">
            {problemPoints.map((point, index) => (
              <StateTransition key={point} delay={0.05 * index}>
                <Card className="h-full rounded-2xl p-5">
                  <p className="text-sm leading-7 text-[var(--color-gray-300)]">
                    {point}
                  </p>
                </Card>
              </StateTransition>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <StateTransition>
            <div>
              <Eyebrow>System layer</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A quantum-native optimization interface for operational systems.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
                Qtangl holds onto the constraint field instead of flattening it into generic workflow software. Inputs stay structured. Trade-offs stay explicit. Outputs remain interpretable.
              </p>
            </div>
          </StateTransition>
          <div className="space-y-4">
            {solutionPoints.map((point, index) => (
              <StateTransition key={point} delay={0.05 * index}>
                <Card strong className="rounded-2xl p-5">
                  <p className="text-sm leading-7 text-[var(--color-gray-300)]">
                    {point}
                  </p>
                </Card>
              </StateTransition>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {platformHighlights.map((item, index) => (
            <StateTransition key={item.title} delay={0.05 * index}>
              <FeatureCard title={item.title} description={item.description} />
            </StateTransition>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <StateTransition>
            <div>
              <Eyebrow>{homepageNarrative.architectureEyebrow}</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {homepageNarrative.architectureTitle}
              </h2>
            </div>
          </StateTransition>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <StateTransition key={step.title} delay={0.05 * index}>
              <Card strong className="h-full rounded-2xl p-6">
                <div className="text-label text-white">0{index + 1}</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                  {step.description}
                </p>
              </Card>
            </StateTransition>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <StateTransition>
            <div>
              <Eyebrow>{homepageNarrative.domainEyebrow}</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {homepageNarrative.domainTitle}
              </h2>
            </div>
          </StateTransition>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <StateTransition key={useCase.title} delay={0.05 * index}>
              <FeatureCard
                eyebrow={useCase.eyebrow}
                title={useCase.title}
                description={useCase.description}
              >
                <p>
                  <span className="font-semibold text-white">Problem:</span>{" "}
                  {useCase.problem}
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

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <StateTransition>
            <div>
              <Eyebrow>{homepageNarrative.interfaceEyebrow}</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {homepageNarrative.interfaceTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--color-gray-300)]">
                Developers define the problem in JSON, Qtangl resolves the optimization workflow, and downstream systems receive a plan with traceable state, method, and cost metadata.
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

      <Section className="pb-20 sm:pb-24">
        <CTA />
      </Section>
    </main>
  );
}
