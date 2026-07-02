"use client";

import ApiPreviewSection from "@/components/marketing/ApiPreviewSection";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import DeadlineTimeline from "@/components/marketing/DeadlineTimeline";
import FeatureCard from "@/components/marketing/FeatureCard";
import FrameworkCoverageStrip from "@/components/marketing/FrameworkCoverageStrip";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import MonitorAlertPreview from "@/components/marketing/MonitorAlertPreview";
import MonitorAnchorNav from "@/components/marketing/MonitorAnchorNav";
import MonitorAssessCompareStrip from "@/components/marketing/MonitorAssessCompareStrip";
import MonitorCommandCenterPreview from "@/components/marketing/MonitorCommandCenterPreview";
import MonitorDriftTimeline from "@/components/marketing/MonitorDriftTimeline";
import MonitorFaq from "@/components/marketing/MonitorFaq";
import MonitorHeroKpiStrip from "@/components/marketing/MonitorHeroKpiStrip";
import MonitorIntegrationStrip from "@/components/marketing/MonitorIntegrationStrip";
import MonitorJourneyStrip from "@/components/marketing/MonitorJourneyStrip";
import MonitorPageAnalytics from "@/components/marketing/MonitorPageAnalytics";
import MonitorPeerBenchmarkPreview from "@/components/marketing/MonitorPeerBenchmarkPreview";
import MonitorPersonaTabs from "@/components/marketing/MonitorPersonaTabs";
import MonitorRoiMini from "@/components/marketing/MonitorRoiMini";
import MonitorScheduleWhatIf from "@/components/marketing/MonitorScheduleWhatIf";
import MonitorRemediationSection from "@/components/marketing/MonitorRemediationSection";
import { MonitorScenarioProvider } from "@/components/marketing/MonitorScenarioContext";
import MonitorStickyCta from "@/components/marketing/MonitorStickyCta";
import MonitorWorkflowDiagram from "@/components/marketing/MonitorWorkflowDiagram";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import ValueProofStrip from "@/components/marketing/ValueProofStrip";
import PageHero from "@/components/layout/PageHero";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  monitorDriftSummaryRequest,
  monitorDriftSummaryResponse,
} from "@/lib/copy/monitor-api-examples";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";

export default function MonitorPageContent() {
  const { hero, trustSignals, howItWorks, compareAssess, features, framework, api, dashboard, cta, liveToday } =
    monitorPageCopy;

  return (
    <MonitorScenarioProvider>
      <MonitorPageAnalytics />
      <MonitorStickyCta />
      <MonitorAnchorNav />

      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
        actionsSlot={
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              {hero.actions.map((action) => (
                <Button
                  key={action.href}
                  href={action.href}
                  variant={"variant" in action && action.variant === "secondary" ? "secondary" : "primary"}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {trustSignals.map((signal) => (
                <Button key={signal.label} href={signal.href} variant="secondary" size="sm">
                  {signal.label}
                </Button>
              ))}
            </div>
          </div>
        }
      />

      <Section gap="tight">
        <MonitorJourneyStrip />
      </Section>

      <Section gap="tight">
        <MonitorHeroKpiStrip />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>Monitor loop</Eyebrow>
          <h2 className="heading-section mt-4">How continuous monitoring works</h2>
        </div>
        <div className="mt-8">
          <MonitorWorkflowDiagram />
        </div>
      </Section>

      <Section gap="tight">
        <ProductModeBanner mode="preview" />
        <MonitorCommandCenterPreview />
        <LiveTodayFootnote features={[...liveToday]} />
      </Section>

      <Section gap="tight">
        <MonitorDriftTimeline />
      </Section>

      <Section gap="tight">
        <MonitorScheduleWhatIf />
      </Section>

      <Section gap="tight">
        <MonitorAlertPreview />
      </Section>

      <Section gap="tight">
        <MonitorPersonaTabs />
      </Section>

      <Section gap="tight">
        <MonitorRemediationSection />
      </Section>

      <Section gap="tight">
        <FrameworkCoverageStrip heading={framework.heading} intro={framework.intro} />
        <div className="mt-10">
          <DeadlineTimeline />
        </div>
      </Section>

      <Section gap="tight">
        <MonitorPeerBenchmarkPreview />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="heading-section mt-4">From baseline to QBR-ready trends</h2>
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

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{compareAssess.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{compareAssess.title}</h2>
        </div>
        <div className="mt-8">
          <MonitorAssessCompareStrip />
        </div>
      </Section>

      <Section gap="tight">
        <MonitorIntegrationStrip />
      </Section>

      <Section gap="tight">
        <MonitorRoiMini />
      </Section>

      <Section gap="tight">
        <ApiPreviewSection
          eyebrow={api.eyebrow}
          title={api.title}
          description={api.description}
          request={monitorDriftSummaryRequest}
          response={monitorDriftSummaryResponse}
          docsHref={api.docsHref}
        />
      </Section>

      <Section gap="tight">
        <ValueProofStrip
          eyebrow="Why Monitor"
          title="Evidence, drift, and honest scope"
        />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{features.title}</h2>
          {"opsNote" in features && features.opsNote ? (
            <p className="mt-4 max-w-3xl text-sm text-[var(--color-gray-400)]">{features.opsNote}</p>
          ) : null}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
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
                  <a href={item.docHref} className="text-sm text-sky-400 underline">
                    Read the guide →
                  </a>
                </p>
              ) : null}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{dashboard.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{dashboard.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {dashboard.description}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={dashboard.href}>{dashboard.cta}</Button>
          <Button href="/access#monitor" variant="secondary">
            Request Monitor pilot
          </Button>
        </div>
      </Section>

      <Section gap="tight">
        <ContentQualityStrip />
        <div className="mt-8">
          <MonitorFaq />
        </div>
      </Section>

      <Section gap="tight" className="pb-24" id="pilot">
        <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
          <h2 className="heading-section">{cta.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-gray-300)]">
            {cta.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={cta.primary.href}>{cta.primary.label}</Button>
            <Button href={cta.secondary.href} variant="secondary">
              {cta.secondary.label}
            </Button>
            <Button href="/dashboard" variant="secondary">
              Open tenant dashboard
            </Button>
          </div>
        </Card>
      </Section>
    </MonitorScenarioProvider>
  );
}
