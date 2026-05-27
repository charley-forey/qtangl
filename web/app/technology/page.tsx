import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import FeatureCard from "@/components/marketing/FeatureCard";
import ProductPreview from "@/components/marketing/ProductPreview";
import Section from "@/components/layout/Section";
import EntanglementField from "@/components/quantum/EntanglementField";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import CollapseMeter from "@/components/visualization/quantum/CollapseMeter";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import InterferenceHeatmap from "@/components/visualization/quantum/InterferenceHeatmap";
import {
  platformHighlights,
  useCases,
  workflowSteps,
} from "@/lib/constants";
import { technologyPage } from "@/lib/copy/product";
import { technologyInterferenceMap } from "@/lib/copy/visualization";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata, buildSoftwareApplicationJsonLd } from "@/lib/seo";

const technologyDescription =
  "See the phase diagram behind Qtangl's classical-first, quantum-aware planning workflow.";

export const metadata: Metadata = buildPageMetadata({
  path: "/technology",
  title: "Technology",
  description: technologyDescription,
});

export default function TechnologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={technologyPage.eyebrow}
        title={technologyPage.title}
        description={technologyPage.intro}
      />
      <Section gap="tight">
        <Card tone="feature" size="lg" className="overflow-hidden rounded-[var(--radius-feature)]">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/60">
              <Image
                src="/qtangl-technology-solver-grid.svg"
                alt="Black and white solver workflow diagram showing structured inputs, solver orchestration, and ranked output panels."
                fill
                priority
                sizes="(min-width: 1280px) 52vw, (min-width: 768px) 88vw, 100vw"
                className="object-cover grayscale"
              />
            </div>
            <EntanglementField />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {technologyPage.diagramLabels.map((label) => (
              <div
                key={label}
                className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/55 px-4 py-4 text-center text-sm text-[var(--color-gray-200)]"
              >
                {label}
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section gap="tight">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {technologyPage.sections.map((section, index) => (
            <Card
              key={section.title}
              tone={index === 1 ? "feature" : "strong"}
              size="lg"
              className="rounded-[var(--radius-feature)]"
            >
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <h2 className="heading-section mt-4 !text-2xl">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {section.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <HybridStackDiagram />
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>{technologyPage.honesty.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4 !text-2xl">{technologyPage.honesty.title}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              {technologyPage.honesty.description}
            </p>
            <CollapseMeter candidatesEvaluated={9} className="mt-6" />
          </Card>
        </div>
      </Section>

      <Section gap="tight">
        <InterferenceHeatmap
          xLabels={[...technologyInterferenceMap.xLabels]}
          yLabels={[...technologyInterferenceMap.yLabels]}
          values={technologyInterferenceMap.values.map((row) => [...row])}
        />
      </Section>

      <Section gap="tight">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {platformHighlights.map((item) => (
            <FeatureCard
              key={item.title}
              eyebrow={item.eyebrow}
              title={item.title}
              description={item.description}
            />
          ))}
          <FeatureCard
            eyebrow="Deeper context"
            title="Compare the optimization stack"
            description="OpenQAOA, dimod, qbsolv, Qiskit Optimization — mapped in one guide."
            href="/learn/topics/quantum-optimization-compared"
            ctaLabel="Read the comparison guide"
          />
        </div>
      </Section>

      <Section gap="tight">
        <ProductPreview
          eyebrow={technologyPage.preview.eyebrow}
          title={technologyPage.preview.title}
          description={technologyPage.preview.description}
        />
      </Section>

      <Section gap="tight">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <Eyebrow>{technologyPage.workflow.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{technologyPage.workflow.title}</h2>
          </div>
          <div className="space-y-4">
            {workflowSteps.map((step) => (
              <Card key={step.title} tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                <div className="flex items-start gap-4">
                  <div className="text-label min-w-[4.5rem] text-white">{step.eyebrow}</div>
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

      <Section gap="tight" className="pb-0">
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
                <span className="font-semibold text-white">Outcome:</span> {useCase.outcome}
              </p>
              <p>
                <span className="font-semibold text-white">Measurement:</span>{" "}
                {useCase.measurement}
              </p>
            </FeatureCard>
          ))}
        </div>
      </Section>
      <JsonLd
        data={buildSoftwareApplicationJsonLd({
          path: "/technology",
          name: "Qtangl Quantum Planning API",
          description: technologyDescription,
        })}
      />
    </PageShell>
  );
}
