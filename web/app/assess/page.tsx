import type { Metadata } from "next";

import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import ProductModeBanner from "@/components/marketing/ProductModeBanner";
import { assessPageCopy } from "@/lib/copy/readiness-assess";
import { sampleCbomPath } from "@/lib/copy/readiness-value";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/assess",
  title: assessPageCopy.metadata.title,
  description: assessPageCopy.metadata.description,
});

export default function AssessPage() {
  const { hero, features, scenarios, cta } = assessPageCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
      />

      <Section gap="tight">
        <ProductModeBanner mode="live" />
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
      </Section>

      <Section gap="tight">
        <Eyebrow>Sample artifact</Eyebrow>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-gray-400)]">
          Download a sample CycloneDX CBOM from a banking TLS scenario, or run a live scan to export your own.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={sampleCbomPath} variant="secondary">
            Download sample CBOM
          </Button>
          <Button href="/assess/mini" variant="secondary">
            Free mini-assessment
          </Button>
          <Button href="/q-day/cbom" variant="secondary">
            CBOM guide
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
