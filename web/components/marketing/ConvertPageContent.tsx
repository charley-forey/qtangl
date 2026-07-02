"use client";

import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import ConvertExpectationsPanel from "@/components/dashboard/ConvertExpectationsPanel";
import ConvertAnchorNav from "@/components/marketing/ConvertAnchorNav";
import ConvertEvidenceCallout from "@/components/marketing/ConvertEvidenceCallout";
import ConvertFaqAccordion from "@/components/marketing/ConvertFaqAccordion";
import ConvertFeatureRows from "@/components/marketing/ConvertFeatureRows";
import ConvertHeroKpiStrip from "@/components/marketing/ConvertHeroKpiStrip";
import ConvertHeroSection from "@/components/marketing/ConvertHeroSection";
import ConvertHndlBlock from "@/components/marketing/ConvertHndlBlock";
import ConvertHonestyPanel from "@/components/marketing/ConvertHonestyPanel";
import ConvertInteractiveBlock, {
  ConvertDemoProviderWrapper,
} from "@/components/marketing/ConvertInteractiveBlock";
import ConvertJourneyStrip from "@/components/marketing/ConvertJourneyStrip";
import ConvertMigrationWaves from "@/components/marketing/ConvertMigrationWaves";
import ConvertMonitorCompareStrip from "@/components/marketing/ConvertMonitorCompareStrip";
import ConvertPartnerHub from "@/components/marketing/ConvertPartnerHub";
import ConvertPersonaTabs from "@/components/marketing/ConvertPersonaTabs";
import ConvertPricingAnchor, {
  ConvertProcurementStrip,
} from "@/components/marketing/ConvertPricingAnchor";
import ConvertRoiMini from "@/components/marketing/ConvertRoiMini";
import ConvertSampleArtifactButton from "@/components/marketing/ConvertSampleArtifactButton";
import ConvertSectionDivider from "@/components/marketing/ConvertSectionDivider";
import ConvertServicesMatrix from "@/components/marketing/ConvertServicesMatrix";
import ConvertStickyCta from "@/components/marketing/ConvertStickyCta";
import CTA from "@/components/marketing/CTA";
import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import MaturityModel from "@/components/marketing/MaturityModel";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import Section from "@/components/layout/Section";
import StateTransition from "@/components/quantum/StateTransition";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import TrustDogfoodSelfScan from "@/components/trust/TrustDogfoodSelfScan";
import {
  convertApiPreview,
  convertCtaPanel,
  convertHowItWorks,
  convertPageCopy,
  convertValueProofItems,
} from "@/lib/copy/readiness-convert";

export default function ConvertPageContent() {
  const { features, evidence, personas, enterprise } = convertPageCopy;

  return (
    <>
      <ConvertStickyCta />
      <ConvertAnchorNav />

      <Section gap="tight" className="pt-6 sm:pt-8">
        <StateTransition>
          <ConvertHeroSection />
        </StateTransition>
        <div className="mt-8 sm:mt-10">
          <ConvertHeroKpiStrip />
        </div>
        <div className="mt-8 sm:mt-10">
          <ConvertJourneyStrip />
        </div>
      </Section>

      <ConvertSectionDivider />

      <Section gap="tight">
        <StateTransition>
          <ConvertHonestyPanel />
        </StateTransition>
        <div className="mt-6 sm:mt-8">
          <ProductModeBanner mode="preview" />
        </div>
      </Section>

      <ConvertDemoProviderWrapper>
        <Section gap="normal" id="convert-program" className="scroll-mt-32">
          <StateTransition>
            <ConvertInteractiveBlock showProgram showInventory />
          </StateTransition>
          <div className="mt-6 sm:mt-8">
            <LiveTodayFootnote
              features={[
                "Remediation board with owners + target dates",
                "Verify-fix across scans",
                "Live status in PDF/board exports",
              ]}
            />
          </div>
        </Section>

        <Section gap="normal" id="convert-evidence" className="scroll-mt-32">
          <div className="content-reading">
            <Eyebrow>{evidence.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{evidence.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
              {evidence.description}
            </p>
          </div>
          <div className="mt-6 sm:mt-8">
            <ConvertEvidenceCallout />
          </div>
          <StateTransition>
            <div className="mt-6 sm:mt-8">
              <ConvertInteractiveBlock showVerifyLoop showEvidence showMigrationDiagram />
            </div>
          </StateTransition>
          <div className="mt-6 sm:mt-8">
            <ConvertSampleArtifactButton />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {evidence.actions.map((action) => (
              <Button
                key={action.href}
                href={action.href}
                variant={"variant" in action && action.variant === "secondary" ? "secondary" : "primary"}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Section>
      </ConvertDemoProviderWrapper>

      <ConvertSectionDivider />

      <Section gap="normal" id="convert-why-now" className="scroll-mt-32">
        <StateTransition>
          <ConvertHndlBlock />
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <FrameworkCoverageStrip intro="Every playbook maps to the mandate driving your audit cycle — ranked by deadline pressure and Mosca exposure." />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <ConvertExpectationsPanel marketing />
          </div>
        </StateTransition>
      </Section>

      <Section gap="normal">
        <div className="content-reading">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="heading-section mt-4">Four steps to proof of fix</h2>
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {convertHowItWorks.map((item) => (
            <li
              key={item.step}
              className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/25 px-5 py-6"
            >
              <p className="text-label">Step {item.step}</p>
              <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-gray-400)]">{item.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section gap="loose" id="convert-personas" className="scroll-mt-32">
        <div className="content-reading">
          <Eyebrow>{personas.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{personas.title}</h2>
        </div>
        <StateTransition>
          <div className="mt-8 sm:mt-10">
            <ConvertPersonaTabs />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <MaturityModel defaultStage={4} />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <Eyebrow>Migration waves</Eyebrow>
            <div className="mt-6">
              <ConvertMigrationWaves />
            </div>
          </div>
        </StateTransition>
      </Section>

      <Section gap="normal">
        <div className="content-reading">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{features.title}</h2>
        </div>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <ConvertFeatureRows />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <ConvertPartnerHub />
          </div>
        </StateTransition>
      </Section>

      <Section gap="loose" id="convert-enterprise" className="scroll-mt-32">
        <div className="content-reading">
          <Eyebrow>{enterprise.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{enterprise.title}</h2>
        </div>
        <StateTransition>
          <div className="mt-8 sm:mt-10">
            <ValueProofStrip
              eyebrow="Why Convert"
              title="Evidence, velocity, and honest scope"
              items={convertValueProofItems}
            />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <ConvertServicesMatrix />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <TrustDogfoodSelfScan />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <ApiPreviewSection
              eyebrow={convertApiPreview.eyebrow}
              title={convertApiPreview.title}
              description={convertApiPreview.description}
              request={convertApiPreview.request}
              response={convertApiPreview.response}
              docsHref={convertApiPreview.docsHref}
            />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <ConvertPricingAnchor />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10 sm:mt-12">
            <Eyebrow>{enterprise.procurementTitle}</Eyebrow>
            <div className="mt-6">
              <ConvertProcurementStrip />
            </div>
          </div>
        </StateTransition>
      </Section>

      <Section gap="normal">
        <div className="content-reading">
          <Eyebrow>Compare tiers</Eyebrow>
          <h2 className="heading-section mt-4">Monitor baseline vs Convert program</h2>
        </div>
        <div className="mt-8 sm:mt-10">
          <ConvertMonitorCompareStrip />
        </div>
      </Section>

      <Section gap="normal">
        <ConvertRoiMini />
      </Section>

      <Section gap="normal" id="convert-faq" className="scroll-mt-32">
        <ContentQualityStrip />
        <div className="mt-8 content-reading sm:mt-10">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="heading-section mt-4">Convert tier questions</h2>
        </div>
        <div className="mt-8 sm:mt-10">
          <ConvertFaqAccordion />
        </div>
      </Section>

      <Section gap="loose" className="pb-28 sm:pb-32">
        <StateTransition>
          <CTA panel={convertCtaPanel} />
        </StateTransition>
      </Section>
    </>
  );
}
