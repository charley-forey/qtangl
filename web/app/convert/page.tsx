import type { Metadata } from "next";

import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import ConvertExpectationsPanel from "@/components/dashboard/ConvertExpectationsPanel";
import ConvertFeatureRows from "@/components/marketing/ConvertFeatureRows";
import ConvertHeroSection from "@/components/marketing/ConvertHeroSection";
import ConvertHndlBlock from "@/components/marketing/ConvertHndlBlock";
import ConvertHonestyPanel from "@/components/marketing/ConvertHonestyPanel";
import ConvertInteractiveBlock, {
  ConvertDemoProviderWrapper,
} from "@/components/marketing/ConvertInteractiveBlock";
import ConvertJourneyStrip from "@/components/marketing/ConvertJourneyStrip";
import ConvertMigrationWaves from "@/components/marketing/ConvertMigrationWaves";
import ConvertPartnerHub from "@/components/marketing/ConvertPartnerHub";
import ConvertPersonaTabs from "@/components/marketing/ConvertPersonaTabs";
import ConvertPricingAnchor, {
  ConvertProcurementStrip,
} from "@/components/marketing/ConvertPricingAnchor";
import ConvertSectionNav from "@/components/marketing/ConvertSectionNav";
import ConvertServicesMatrix from "@/components/marketing/ConvertServicesMatrix";
import CTA from "@/components/marketing/CTA";
import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import MaturityModel from "@/components/marketing/MaturityModel";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import StateTransition from "@/components/quantum/StateTransition";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonLd from "@/components/seo/JsonLd";
import TrustDogfoodSelfScan from "@/components/trust/TrustDogfoodSelfScan";
import {
  convertApiPreview,
  convertCtaPanel,
  convertFaqItems,
  convertHowItWorks,
  convertPageCopy,
  convertValueProofItems,
} from "@/lib/copy/readiness-convert";
import { absoluteUrl, buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";
import { siteMetadata } from "@/lib/copy/product";

export const metadata: Metadata = buildPageMetadata({
  path: "/convert",
  title: convertPageCopy.metadata.title,
  description: convertPageCopy.metadata.description,
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteMetadata.url },
    { "@type": "ListItem", position: 2, name: "Platform", item: absoluteUrl("/platform") },
    { "@type": "ListItem", position: 3, name: "Convert", item: absoluteUrl("/convert") },
  ],
};

export default function ConvertPage() {
  const { features, evidence, personas, enterprise, howItWorks } = {
    ...convertPageCopy,
    howItWorks: convertHowItWorks,
  };

  return (
    <PageShell>
      <JsonLd data={buildFaqJsonLd(convertFaqItems)} />
      <JsonLd data={breadcrumbJsonLd} />

      <Section gap="tight" className="pt-8 sm:pt-10">
        <StateTransition>
          <ConvertHeroSection />
        </StateTransition>
      </Section>

      <Section gap="tight">
        <ConvertSectionNav />
        <StateTransition>
          <ConvertJourneyStrip />
        </StateTransition>
      </Section>

      <Section gap="tight">
        <StateTransition>
          <ConvertHonestyPanel />
        </StateTransition>
        <ProductModeBanner mode="preview" />
      </Section>

      <ConvertDemoProviderWrapper>
        <Section gap="tight" id="convert-program" className="scroll-mt-28">
          <StateTransition>
            <ConvertInteractiveBlock showProgram showInventory />
          </StateTransition>
          <LiveTodayFootnote
            features={[
              "Remediation board with owners + target dates",
              "Verify-fix across scans",
              "Live status in PDF/board exports",
            ]}
          />
        </Section>

        <Section gap="tight" id="convert-evidence" className="scroll-mt-28">
          <div className="content-reading">
            <Eyebrow>{evidence.eyebrow}</Eyebrow>
            <h2 className="heading-section mt-4">{evidence.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
              {evidence.description}
            </p>
          </div>
          <StateTransition>
            <ConvertInteractiveBlock showVerifyLoop showEvidence showMigrationDiagram />
          </StateTransition>
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

      <Section gap="tight" id="convert-why-now" className="scroll-mt-28">
        <StateTransition>
          <ConvertHndlBlock />
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <FrameworkCoverageStrip intro="Every playbook maps to the mandate driving your audit cycle — ranked by deadline pressure and Mosca exposure." />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <ConvertExpectationsPanel marketing />
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="heading-section mt-4">Four steps to proof of fix</h2>
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item) => (
            <li
              key={item.step}
              className="rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-5"
            >
              <p className="text-label">Step {item.step}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">{item.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section gap="tight" id="convert-personas" className="scroll-mt-28">
        <div className="content-reading">
          <Eyebrow>{personas.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{personas.title}</h2>
        </div>
        <StateTransition>
          <div className="mt-8">
            <ConvertPersonaTabs />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <MaturityModel defaultStage={4} />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <Eyebrow>Migration waves</Eyebrow>
            <div className="mt-6">
              <ConvertMigrationWaves />
            </div>
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{features.title}</h2>
        </div>
        <StateTransition>
          <div className="mt-10">
            <ConvertFeatureRows />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <ConvertPartnerHub />
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight" id="convert-enterprise" className="scroll-mt-28">
        <div className="content-reading">
          <Eyebrow>{enterprise.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{enterprise.title}</h2>
        </div>
        <StateTransition>
          <div className="mt-8">
            <ValueProofStrip
              eyebrow="Why Convert"
              title="Evidence, velocity, and honest scope"
              items={convertValueProofItems}
            />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <ConvertServicesMatrix />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <TrustDogfoodSelfScan />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
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
          <div className="mt-10">
            <ConvertPricingAnchor />
          </div>
        </StateTransition>
        <StateTransition>
          <div className="mt-10">
            <Eyebrow>{enterprise.procurementTitle}</Eyebrow>
            <div className="mt-6">
              <ConvertProcurementStrip />
            </div>
          </div>
        </StateTransition>
      </Section>

      <Section gap="tight" id="convert-faq" className="scroll-mt-28">
        <div className="content-reading">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="heading-section mt-4">Convert tier questions</h2>
        </div>
        <div className="mt-8 space-y-4">
          {convertFaqItems.map((item) => (
            <Card key={item.question} tone="ghost" className="rounded-[var(--radius-xl)]">
              <p className="text-sm font-semibold text-white">{item.question}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">{item.answer}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <StateTransition>
          <CTA panel={convertCtaPanel} />
        </StateTransition>
      </Section>
    </PageShell>
  );
}
