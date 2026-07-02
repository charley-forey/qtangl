import FeatureCard from "@/components/marketing/FeatureCard";
import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
import AssessCompareSection from "@/components/marketing/AssessCompareSection";
import AssessDeliverablePreview from "@/components/marketing/AssessDeliverablePreview";
import AssessFaqAccordion from "@/components/marketing/AssessFaqAccordion";
import AssessHowItWorks from "@/components/marketing/AssessHowItWorks";
import AssessMaturityTeaser from "@/components/marketing/AssessMaturityTeaser";
import AssessMiniTeaser from "@/components/marketing/AssessMiniTeaser";
import AssessMonitorTeaser from "@/components/marketing/AssessMonitorTeaser";
import AssessSectionAnalytics from "@/components/marketing/AssessSectionAnalytics";
import ConvertPreview from "@/components/marketing/ConvertPreview";
import { ConvertDemoProviderWrapper } from "@/components/marketing/ConvertInteractiveBlock";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import PlatformSampleEmbed from "@/components/marketing/PlatformSampleEmbed";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import StateTransition from "@/components/quantum/StateTransition";
import TrustDogfoodSelfScan from "@/components/trust/TrustDogfoodSelfScan";
import { assessPageCopy } from "@/lib/copy/readiness-assess";

export default function AssessLandingMarketing() {
  const { features, scenarios } = assessPageCopy;

  return (
    <>
      <Section gap="tight">
        <AssessHowItWorks />
      </Section>

      <Section gap="tight" id="deliverables" className="scroll-mt-28">
        <AssessSectionAnalytics sectionId="deliverables" />
        <StateTransition>
          <div className="content-reading">
            <Eyebrow>Deliverables</Eyebrow>
            <h2 className="heading-section mt-4">What every assessment exports</h2>
          </div>
          <div className="mt-8 space-y-6">
            <AssessDeliverablePreview />
            <PlatformSampleEmbed />
            <ValueProofStrip />
            <LiveTodayFootnote
              features={[
                "Fixture + OQS live demo scans",
                "Signed PDF + CycloneDX CBOM",
                "Public /verify for auditors",
              ]}
            />
            <ContentQualityStrip />
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition delay={0.04}>
          <div className="content-reading">
            <Eyebrow>{features.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{features.title}</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.items.map((item, index) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                imageSrc={item.image}
                imageAlt={item.imageAlt}
                imageLoading={index === 0 ? "eager" : "lazy"}
              >
                <p>{item.description}</p>
              </FeatureCard>
            ))}
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <AssessMonitorTeaser />
      </Section>

      <Section gap="tight">
        <StateTransition delay={0.06}>
          <div className="content-reading">
            <Eyebrow>{scenarios.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{scenarios.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
              {scenarios.description}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {scenarios.items.map((item) => (
              <Button key={item.href} href={item.href} variant="secondary">
                {item.label}
              </Button>
            ))}
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight" id="frameworks" className="scroll-mt-28">
        <AssessSectionAnalytics sectionId="frameworks" />
        <FrameworkCoverageStrip intro="Every assessment maps your quantum-vulnerable findings to the frameworks driving your program — NSM-10, CNSA 2.0, NIST IR 8547, PCI-DSS 4.0, and CMMC — with control themes, deadlines, and a signed report your auditors can verify independently." />
      </Section>

      <Section gap="tight">
        <Eyebrow>Sample artifact</Eyebrow>
        <AssessMiniTeaser />
      </Section>

      <Section gap="tight" id="compare" className="scroll-mt-28">
        <AssessSectionAnalytics sectionId="compare" />
        <AssessCompareSection />
        <div className="mt-8">
          <AssessMaturityTeaser />
        </div>
      </Section>

      <Section gap="tight">
        <ConvertDemoProviderWrapper>
          <ConvertPreview />
        </ConvertDemoProviderWrapper>
      </Section>

      <Section gap="tight">
        <Eyebrow>Case study</Eyebrow>
        <TrustDogfoodSelfScan deferLoad />
      </Section>

      <Section gap="tight" id="faq" className="scroll-mt-28">
        <AssessSectionAnalytics sectionId="faq" />
        <div className="content-reading">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="heading-section mt-4">Common questions</h2>
        </div>
        <div className="mt-8">
          <AssessFaqAccordion />
        </div>
        <div className="mt-8">
          <ContentQualityStrip />
        </div>
      </Section>
    </>
  );
}
