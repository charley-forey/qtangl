import type { Metadata } from "next";

import FeatureCard from "@/components/marketing/FeatureCard";
import ProductPreview from "@/components/marketing/ProductPreview";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  platformHighlights,
  useCases,
  workflowSteps,
} from "@/lib/constants";
import { technologyPage } from "@/lib/copy/product";

export const metadata: Metadata = {
  title: "Technology",
  description: "How Qtangl models constraints, runs hybrid optimization, and returns ranked plans.",
};

export default function TechnologyPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="content-reading">
          <Eyebrow>{technologyPage.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {technologyPage.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
            {technologyPage.intro}
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <Card strong className="rounded-[2rem]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto] xl:items-center">
            {technologyPage.diagramLabels.map((label) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border)] bg-black/55 px-4 py-5 text-center text-sm text-[var(--color-gray-200)]"
              >
                {label}
              </div>
            ))}
            <div className="hidden text-center text-[var(--color-gray-500)] xl:block">
              →
            </div>
          </div>
        </Card>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {technologyPage.sections.map((section, index) => (
            <Card key={section.title} strong={index === 1} className="rounded-2xl">
              <Eyebrow>0{index + 1}</Eyebrow>
              <h2 className="mt-4 text-2xl font-semibold text-white">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {section.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {platformHighlights.map((item) => (
            <FeatureCard
              key={item.title}
              eyebrow="Platform"
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <ProductPreview
          eyebrow="Execution preview"
          title="How the product should feel in use."
          description="Qtangl is designed to translate a difficult planning problem into a ranked output that engineering, operations, and product teams can all read quickly."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <Eyebrow>Solver workflow</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hybrid execution stays readable from input model to final output.
            </h2>
          </div>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <Card key={step.title} className="rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="text-label min-w-[2rem] text-white">0{index + 1}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0 pb-20 sm:pb-24">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((useCase) => (
            <FeatureCard
              key={useCase.title}
              eyebrow={useCase.eyebrow}
              title={useCase.title}
              description={useCase.description}
              imageSrc={useCase.image}
              imageAlt={useCase.imageAlt}
            >
              <p>
                <span className="font-semibold text-white">Outcome:</span>{" "}
                {useCase.outcome}
              </p>
            </FeatureCard>
          ))}
        </div>
      </Section>
    </main>
  );
}
