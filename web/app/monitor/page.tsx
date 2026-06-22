import type { Metadata } from "next";

import FeatureCard from "@/components/marketing/FeatureCard";
import MonitorAlertPreview from "@/components/marketing/MonitorAlertPreview";
import MonitorPreview from "@/components/marketing/MonitorPreview";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { monitorPageCopy } from "@/lib/copy/readiness-monitor";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/monitor",
  title: monitorPageCopy.metadata.title,
  description: monitorPageCopy.metadata.description,
});

export default function MonitorPage() {
  const { hero, features, dashboard, cta } = monitorPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
      />

      <Section gap="tight">
        <ProductModeBanner mode="preview" />
        <Card tone="panel" className="mb-6 p-4">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-medium text-white">Live product:</span> schedules, alert thresholds, webhook DLQ, and scan diff — on{" "}
            <a href="/dashboard" className="text-white underline">
              Dashboard
            </a>
            .
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <span className="font-medium text-white">Ops note:</span> scheduled re-scans require a Redis worker and{" "}
            <code className="text-xs">QTANGL_ENABLE_SCHEDULER=true</code> — continuous monitoring is deployment-dependent, not implicit on every tier.
          </p>
        </Card>
        <MonitorPreview />
      </Section>

      <Section gap="tight">
        <MonitorAlertPreview />
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
          <Button href="/access" variant="secondary">
            Request Monitor pilot
          </Button>
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
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
          </div>
        </Card>
      </Section>
    </PageShell>
  );
}
