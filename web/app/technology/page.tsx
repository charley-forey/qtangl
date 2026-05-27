import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import PhaseRibbon from "@/components/layout/PhaseRibbon";
import Section from "@/components/layout/Section";
import FeatureCard from "@/components/marketing/FeatureCard";
import ProductPreview from "@/components/marketing/ProductPreview";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonContract from "@/components/visualization/JsonContract";
import CandidateFunnel from "@/components/visualization/quantum/CandidateFunnel";
import DecoherencePanel from "@/components/visualization/quantum/DecoherencePanel";
import HybridStackDiagram from "@/components/visualization/quantum/HybridStackDiagram";
import InterferenceHeatmap from "@/components/visualization/quantum/InterferenceHeatmap";
import LatencyEnvelope from "@/components/visualization/quantum/LatencyEnvelope";
import LexiconGlossary from "@/components/visualization/quantum/LexiconGlossary";
import MethodComparison from "@/components/visualization/quantum/MethodComparison";
import PipelineDiagram from "@/components/visualization/quantum/PipelineDiagram";
import {
  platformHighlights,
  useCases,
  workflowSteps,
} from "@/lib/constants";
import { technologyPage } from "@/lib/copy/product";
import { phaseUnderTheHood } from "@/lib/copy/technology-deep";
import { technologyInterferenceMap } from "@/lib/copy/visualization";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata, buildSoftwareApplicationJsonLd } from "@/lib/seo";

const technologyDescription =
  "Hybrid planning pipeline: CP-SAT baseline every job, bounded QAOA on research candidates, ranked JSON out.";

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

      <PhaseRibbon />

      <Section id="pipeline" gap="tight">
        <PipelineDiagram />
      </Section>

      <Section id="phases" gap="tight">
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
              <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs leading-6 text-[var(--color-gray-500)]">
                <span className="font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-400)]">
                  Under the hood ·{" "}
                </span>
                {phaseUnderTheHood[index]?.operation ?? section.underTheHood}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="hybrid-stack" gap="tight">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <HybridStackDiagram />
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <Eyebrow>{technologyPage.honesty.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4 !text-2xl">{technologyPage.honesty.title}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              {technologyPage.honesty.description}
            </p>
            <CandidateFunnel compact className="mt-6 border-0 bg-transparent p-0" />
          </Card>
        </div>
      </Section>

      <Section id="interference" gap="tight">
        <InterferenceHeatmap
          xLabels={[...technologyInterferenceMap.xLabels]}
          yLabels={[...technologyInterferenceMap.yLabels]}
          values={technologyInterferenceMap.values.map((row) => [...row])}
        />
      </Section>

      <Section id="comparison" gap="tight">
        <MethodComparison />
      </Section>

      <Section id="contract" gap="tight">
        <JsonContract />
      </Section>

      <Section id="latency" gap="tight">
        <LatencyEnvelope />
      </Section>

      <Section id="lexicon" gap="tight">
        <LexiconGlossary />
      </Section>

      <Section id="decoherence" gap="tight">
        <DecoherencePanel />
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

      <Section id="preview" gap="tight">
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
