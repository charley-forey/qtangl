"use client";

import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import DeadlineTimeline from "@/components/marketing/DeadlineTimeline";
import FeatureCard from "@/components/marketing/FeatureCard";
import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import MonitorAlertPreview from "@/components/marketing/MonitorAlertPreview";
import MonitorAssessCompareStrip from "@/components/marketing/MonitorAssessCompareStrip";
import MonitorCommandCenterPreview from "@/components/marketing/MonitorCommandCenterPreview";
import MonitorDriftTimeline from "@/components/marketing/MonitorDriftTimeline";
import MonitorFaq from "@/components/marketing/MonitorFaq";
import MonitorHero from "@/components/marketing/MonitorHero";
import MonitorIntegrationStrip from "@/components/marketing/MonitorIntegrationStrip";
import MonitorJourneyStrip from "@/components/marketing/MonitorJourneyStrip";
import MonitorPageAnalytics from "@/components/marketing/MonitorPageAnalytics";
import MonitorPeerBenchmarkPreview from "@/components/marketing/MonitorPeerBenchmarkPreview";
import MonitorPersonaTabs from "@/components/marketing/MonitorPersonaTabs";
import MonitorProofStrip from "@/components/marketing/MonitorProofStrip";
import MonitorRoiMini from "@/components/marketing/MonitorRoiMini";
import MonitorScheduleWhatIf from "@/components/marketing/MonitorScheduleWhatIf";
import MonitorRemediationSection from "@/components/marketing/MonitorRemediationSection";
import MonitorSectionHeader from "@/components/marketing/MonitorSectionHeader";
import { MonitorScenarioProvider } from "@/components/marketing/MonitorScenarioContext";
import MonitorStickyCta from "@/components/marketing/MonitorStickyCta";
import MonitorWorkflowDiagram from "@/components/marketing/MonitorWorkflowDiagram";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  monitorDriftSummaryRequest,
  monitorDriftSummaryResponse,
} from "@/lib/copy/monitor-api-examples";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorPageContent() {
  const {
    howItWorks,
    compareAssess,
    features,
    framework,
    api,
    dashboard,
    cta,
    liveToday,
    chapters,
  } = monitorPageCopy;

  return (
    <MonitorScenarioProvider>
      <MonitorPageAnalytics />
      <MonitorStickyCta />

      <Section gap="tight" className="pt-6 sm:pt-8">
        <MonitorHero />
        <div className="mt-8 sm:mt-10">
          <MonitorJourneyStrip />
        </div>
        <div className="mt-8 sm:mt-10">
          <MonitorProofStrip />
        </div>
      </Section>

      <Section gap="normal">
        <MonitorSectionHeader
          eyebrow="Monitor loop"
          title="How continuous monitoring works"
          description="A five-step loop from scheduled re-scan to board-ready trends — click a step or watch the tour advance."
        />
        <div className="mt-8 sm:mt-10">
          <MonitorWorkflowDiagram />
        </div>
      </Section>

      <Section gap="loose" id="command-center" className="scroll-mt-32">
        <MonitorSectionHeader
          eyebrow={chapters.commandCenter.eyebrow}
          title={chapters.commandCenter.title}
          description={chapters.commandCenter.description}
        />
        <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
          <ProductModeBanner mode="preview" />
          <MonitorCommandCenterPreview />
          <LiveTodayFootnote features={[...liveToday]} />
        </div>
      </Section>

      <Section gap="loose" id="drift-theater" className="scroll-mt-32">
        <MonitorSectionHeader
          eyebrow={chapters.driftTheater.eyebrow}
          title={chapters.driftTheater.title}
          description={chapters.driftTheater.description}
        />
        <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
          <MonitorDriftTimeline />
          <MonitorScheduleWhatIf />
          <MonitorAlertPreview />
        </div>
      </Section>

      <Section gap="loose" id="personas" className="scroll-mt-32">
        <MonitorPersonaTabs />
      </Section>

      <Section gap="loose" id="enterprise-proof" className="scroll-mt-32">
        <MonitorSectionHeader
          eyebrow={chapters.enterprise.eyebrow}
          title={chapters.enterprise.title}
          description={chapters.enterprise.description}
        />
        <div className="mt-8 space-y-6 sm:mt-10 sm:space-y-8">
          <MonitorRemediationSection />
          <MonitorPeerBenchmarkPreview />
          <FrameworkCoverageStrip heading={framework.heading} intro={framework.intro} />
          <DeadlineTimeline />
        </div>
      </Section>

      <Section gap="normal">
        <MonitorSectionHeader
          eyebrow="How it works"
          title="From baseline to QBR-ready trends"
        />
        <ol className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {howItWorks.map((item) => (
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

      <Section gap="normal">
        <MonitorSectionHeader eyebrow={compareAssess.eyebrow} title={compareAssess.title} />
        <div className="mt-8 sm:mt-10">
          <MonitorAssessCompareStrip />
        </div>
      </Section>

      <Section gap="normal">
        <MonitorIntegrationStrip />
      </Section>

      <Section gap="normal">
        <MonitorRoiMini />
      </Section>

      <Section gap="normal">
        <ApiPreviewSection
          eyebrow={api.eyebrow}
          title={api.title}
          description={api.description}
          request={monitorDriftSummaryRequest}
          response={monitorDriftSummaryResponse}
          docsHref={api.docsHref}
        />
      </Section>

      <Section gap="normal">
        <ValueProofStrip eyebrow="Why Monitor" title="Evidence, drift, and honest scope" />
      </Section>

      <Section gap="normal">
        <MonitorSectionHeader
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.opsNote}
        />
        <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-2 md:gap-8">
          {features.items.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              imageSrc={item.image}
              imageAlt={item.imageAlt}
            >
              <p>{item.description}</p>
              {"docHref" in item && item.docHref ? (
                <p className="mt-3">
                  <a href={item.docHref} className="text-sm text-sky-400 underline underline-offset-4">
                    Read the guide →
                  </a>
                </p>
              ) : null}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section gap="normal">
        <MonitorSectionHeader
          eyebrow={dashboard.eyebrow}
          title={dashboard.title}
          description={dashboard.description}
        />
        <div className="mt-8 flex flex-wrap gap-3 sm:mt-10">
          <Button href={dashboard.href}>{dashboard.cta}</Button>
          <Button href="/access#monitor" variant="secondary">
            Request Monitor pilot
          </Button>
        </div>
      </Section>

      <Section gap="normal">
        <ContentQualityStrip />
        <div className="mt-8 sm:mt-10">
          <MonitorFaq />
        </div>
      </Section>

      <Section gap="loose" className="pb-28 sm:pb-32" id="pilot">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)] p-6 sm:p-8 lg:p-10">
          <h2 className="heading-section">{cta.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
            {cta.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={cta.primary.href}>{cta.primary.label}</Button>
            <Button href={cta.secondary.href} variant="secondary">
              {cta.secondary.label}
            </Button>
            <Button href="/command-center" variant="secondary">
              Open tenant dashboard
            </Button>
          </div>
        </Card>
      </Section>
    </MonitorScenarioProvider>
  );
}
