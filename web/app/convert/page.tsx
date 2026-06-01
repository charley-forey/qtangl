import type { Metadata } from "next";

import ConvertPreview from "@/components/marketing/ConvertPreview";
import LiveTodayFootnote from "@/components/marketing/LiveTodayFootnote";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { convertPageCopy } from "@/lib/copy/readiness-convert";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/convert",
  title: convertPageCopy.metadata.title,
  description: convertPageCopy.metadata.description,
});

export default function ConvertPage() {
  const { hero, features, evidence, cta } = convertPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
      />

      <Section gap="tight">
        <Card tone="panel" className="mb-6 p-4">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-medium text-white">In product today:</span> remediation board, verify-fix API, Jira when configured.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            <span className="font-medium text-white">Services / roadmap:</span> workshop cadence and partner orchestration are delivered with Convert engagements — not self-serve in the dashboard yet.
          </p>
        </Card>
        <ProductModeBanner mode="preview" />
        <ConvertPreview />
        <LiveTodayFootnote
          features={[
            "Remediation board with owners + target dates",
            "Verify-fix across scans",
            "Live status in PDF/board exports",
          ]}
        />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{features.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{features.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.items.map((item) => (
            <FeatureCard key={item.title} title={item.title}>
              <p>{item.description}</p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{evidence.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{evidence.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {evidence.description}
          </p>
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
            <Button href="/dashboard" variant="secondary">
              Open tenant dashboard
            </Button>
          </div>
        </Card>
      </Section>
    </PageShell>
  );
}
