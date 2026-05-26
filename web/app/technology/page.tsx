import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
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
  description:
    "See how Qtangl evaluates operational constraints and returns ranked plans teams can review and run.",
};

export default function TechnologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={technologyPage.eyebrow}
        title={technologyPage.title}
        description={technologyPage.intro}
      />
      <Section className="pt-0">
        <Card strong className="overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--border)] bg-black/60">
            <Image
              src="/qtangl-technology-solver-grid.svg"
              alt="Black and white solver workflow diagram showing structured inputs, solver orchestration, and ranked output panels."
              fill
              priority
              sizes="(min-width: 1280px) 80vw, (min-width: 768px) 88vw, 100vw"
              className="object-cover grayscale"
            />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {technologyPage.diagramLabels.map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-[var(--border)] bg-black/55 px-4 py-4 text-center text-sm text-[var(--color-gray-200)]"
              >
                {label}
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {technologyPage.sections.map((section, index) => (
            <Card key={section.title} strong={index === 1} className="rounded-[2rem] p-6 sm:p-7">
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
              <Card key={step.title} className="rounded-[2rem] p-6 sm:p-7">
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

      <Section className="pt-0 pb-0">
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
    </PageShell>
  );
}
