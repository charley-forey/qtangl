import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import PhaseRibbon from "@/components/layout/PhaseRibbon";
import Section from "@/components/layout/Section";
import FeatureCard from "@/components/marketing/FeatureCard";
import ProductPreview from "@/components/marketing/ProductPreview";
import ReadinessCrossLink from "@/components/marketing/ReadinessCrossLink";
import TechnologyChapter from "@/components/technology/TechnologyChapter";
import TechnologyBlock from "@/components/technology/TechnologyBlock";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonContract from "@/components/visualization/JsonContract";
import { CandidateFunnelContent } from "@/components/visualization/quantum/CandidateFunnel";
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
  const { chapters } = technologyPage;

  return (
    <PageShell>
      <PageHero
        eyebrow={technologyPage.eyebrow}
        title={technologyPage.title}
        description={technologyPage.intro}
      />

      <Section gap="tight" className="pt-0">
        <ReadinessCrossLink />
      </Section>

      <PhaseRibbon />

      <Section id="pipeline" gap="loose" className="pb-0">
        <TechnologyChapter
          eyebrow={chapters.howItRuns.eyebrow}
          title={chapters.howItRuns.title}
          className="border-t-0 pt-0"
        />
      </Section>

      <Section gap="tight">
        <PipelineDiagram />
      </Section>

      <Section id="phases" gap="tight">
        <div className="tech-grid-cards">
          {technologyPage.sections.map((section, index) => (
            <Card
              key={section.title}
              tone={index === 1 ? "feature" : "strong"}
              size="lg"
              className="flex h-full flex-col rounded-[var(--radius-feature)]"
            >
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <h2 className="heading-section mt-4 !text-2xl">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {section.description}
              </p>
              <p className="mt-auto border-t border-[var(--border)] pt-4 text-xs leading-6 text-[var(--color-gray-500)]">
                <span className="font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-400)]">
                  Under the hood ·{" "}
                </span>
                {phaseUnderTheHood[index]?.operation ?? section.underTheHood}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="hybrid-stack" gap="loose" className="pb-0">
        <TechnologyChapter
          eyebrow={chapters.solverTruth.eyebrow}
          title={chapters.solverTruth.title}
        />
      </Section>

      <Section gap="tight">
        <div className="tech-stack xl:grid xl:grid-cols-2 xl:items-start">
          <HybridStackDiagram className="h-full" />
          <TechnologyBlock
            id="honesty"
            eyebrow={technologyPage.honesty.eyebrow}
            title={technologyPage.honesty.title}
            description={technologyPage.honesty.description}
            className="h-full"
          >
            <CandidateFunnelContent />
          </TechnologyBlock>
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

      <Section id="contract" gap="loose" className="pb-0">
        <TechnologyChapter
          eyebrow={chapters.integrate.eyebrow}
          title={chapters.integrate.title}
        />
      </Section>

      <Section gap="tight">
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

      <Section id="platform" gap="loose" className="pb-0">
        <TechnologyChapter eyebrow={chapters.runIt.eyebrow} title={chapters.runIt.title} />
      </Section>

      <Section gap="tight">
        <div className="tech-grid-cards md:grid-cols-2 xl:grid-cols-3">
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
          layout="combined"
          eyebrow={technologyPage.preview.eyebrow}
          title={technologyPage.preview.title}
          description={technologyPage.preview.description}
        />
      </Section>

      <Section id="workflow" gap="tight">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="content-reading">
            <Eyebrow>{technologyPage.workflow.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{technologyPage.workflow.title}</h2>
          </div>
          <div className="tech-stack">
            {workflowSteps.map((step) => (
              <Card key={step.title} tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className="text-label shrink-0 text-white">{step.eyebrow}</div>
                  <div className="min-w-0">
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

      <Section id="use-cases" gap="tight" className="pb-0">
        <div className="tech-grid-cards">
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
          name: "Qtangl Cryptographic Visibility / Quantum Readiness",
          description: technologyDescription,
        })}
      />
    </PageShell>
  );
}
