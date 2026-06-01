import type { Metadata } from "next";

import DeadlineTimeline from "@/components/marketing/DeadlineTimeline";
import FeatureCard from "@/components/marketing/FeatureCard";
import MoscaCalculator from "@/components/marketing/MoscaCalculator";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { frameworkGuideList } from "@/lib/copy/readiness-frameworks";
import { qDayHubCopy } from "@/lib/copy/readiness-qday-hub";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/q-day",
  title: qDayHubCopy.metadata.title,
  description: qDayHubCopy.metadata.description,
});

export default function QDayHubPage() {
  const { hero, resources, deadlines, artifacts, solutions } = qDayHubCopy;

  return (
    <PageShell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={hero.actions}
      />

      <Section gap="tight">
        <MoscaCalculator />
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{deadlines.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{deadlines.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {deadlines.description}
          </p>
        </div>
        <div className="mt-8">
          <DeadlineTimeline />
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>Framework guides</Eyebrow>
          <h2 className="heading-section mt-4">Compliance pillar content</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            Long-form guides mapped to NSM-10, CNSA 2.0, PCI-DSS, CMMC, and ML-KEM migration.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {frameworkGuideList.map((guide) => (
            <FeatureCard
              key={guide.slug}
              eyebrow={guide.deadline}
              title={guide.title}
              description={guide.summary}
              href={`/q-day/frameworks/${guide.slug}`}
              ctaLabel="Read guide →"
            />
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{resources.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{resources.title}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {resources.items.map((item) => (
            <FeatureCard
              key={item.slug}
              title={item.title}
              description={item.description}
              href={item.href}
              ctaLabel="Read guide →"
            />
          ))}
        </div>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <Eyebrow>{artifacts.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{artifacts.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-gray-300)]">
            {artifacts.description}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {artifacts.items.map((item) => (
            <Button key={item.href} href={item.href} variant="secondary">
              {item.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="content-reading">
          <Eyebrow>{solutions.eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4">{solutions.title}</h2>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {solutions.items.map((item) => (
            <Button key={item.href} href={item.href} variant="secondary">
              {item.label}
            </Button>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
