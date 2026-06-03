import Link from "next/link";

import BlogReferencesPanel from "@/components/marketing/BlogReferencesPanel";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import ReadinessMarkdown from "@/components/marketing/ReadinessMarkdown";
import FeatureCard from "@/components/marketing/FeatureCard";
import PageHero from "@/components/layout/PageHero";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { FrameworkGuide } from "@/lib/copy/readiness-frameworks";
import { getQDaySourcesByIds } from "@/lib/copy/q-day-sources";
import type { LoadedReadinessContent } from "@/lib/readiness-content-types";

type FrameworkGuideLayoutProps = {
  guide: FrameworkGuide;
  markdown?: LoadedReadinessContent | null;
  externalSourceIds?: readonly string[];
};

export default function FrameworkGuideLayout({
  guide,
  markdown,
  externalSourceIds = [],
}: FrameworkGuideLayoutProps) {
  const sources = getQDaySourcesByIds(
    externalSourceIds.length > 0 ? externalSourceIds : [],
  );

  return (
    <>
      <PageHero
        eyebrow={guide.eyebrow}
        title={guide.title}
        description={guide.description}
        actions={[
          { href: "/assess", label: "Run Q-Day scan" },
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

      {markdown ? (
        <Section gap="tight">
          <ReadinessMarkdown markdown={markdown.markdownBody} />
        </Section>
      ) : (
        <Section gap="tight">
          <div className="content-reading">
            <h2 className="heading-section">Why it matters</h2>
            <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{guide.whyItMatters}</p>
          </div>
        </Section>
      )}

      <Section gap="tight">
        <Eyebrow>Qtangl mapping</Eyebrow>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
          {guide.qtanglMapping.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      {sources.length > 0 ? (
        <Section gap="tight">
          <BlogReferencesPanel sources={sources} />
        </Section>
      ) : null}

      <Section gap="tight">
        <ContentQualityStrip />
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
            <FeatureCard key={item.href} title={item.label} href={item.href} ctaLabel="Read →" />
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/q-day"
            className="text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
          >
            ← Q-Day hub
          </Link>
        </div>
      </Section>
    </>
  );
}
