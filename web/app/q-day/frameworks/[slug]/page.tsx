import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  frameworkGuideList,
  getFrameworkGuide,
} from "@/lib/copy/readiness-frameworks";
import { buildPageMetadata } from "@/lib/seo";

type FrameworkRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return frameworkGuideList.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: FrameworkRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getFrameworkGuide(slug);
  if (!guide) {
    return {};
  }

  return buildPageMetadata({
    path: `/q-day/frameworks/${slug}`,
    title: guide.metadata.title,
    description: guide.metadata.description,
  });
}

export default async function FrameworkGuidePage({ params }: FrameworkRouteProps) {
  const { slug } = await params;
  const guide = getFrameworkGuide(slug);
  if (!guide) {
    notFound();
  }

  return (
    <PageShell>
      <PageHero
        eyebrow={guide.eyebrow}
        title={guide.title}
        description={guide.description}
        actions={[
          { href: "/demo/pqc", label: "Run Q-Day scan" },
          { href: "/q-day", label: "Q-Day hub", variant: "secondary" },
        ]}
      />

      <Section gap="tight">
        <Card tone="feature" className="rounded-[var(--radius-xl)]">
          <Eyebrow>Framework</Eyebrow>
          <p className="mt-3 text-lg font-semibold text-white">{guide.summary}</p>
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">Deadline: {guide.deadline}</p>
        </Card>
      </Section>

      <Section gap="tight">
        <div className="content-reading">
          <h2 className="heading-section">Why it matters</h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{guide.whyItMatters}</p>
        </div>
      </Section>

      <Section gap="tight">
        <Eyebrow>Qtangl mapping</Eyebrow>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
          {guide.qtanglMapping.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section gap="tight">
        <Eyebrow>Try it</Eyebrow>
        <div className="mt-6 flex flex-wrap gap-3">
          {guide.relatedScenarios.map((item) => (
            <Button key={item.href} href={item.href} variant="secondary">
              {item.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <Eyebrow>Related</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {guide.relatedArticles.map((item) => (
            <FeatureCard
              key={item.href}
              title={item.label}
              href={item.href}
              ctaLabel="Read →"
            />
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
