import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import CompareSpokeAnalytics from "@/components/compare/CompareSpokeAnalytics";
import ComparisonCta from "@/components/compare/ComparisonCta";
import ComparisonMatrix from "@/components/compare/ComparisonMatrix";
import CompetitorRadar from "@/components/compare/CompetitorRadar";
import DiscoveryMethodChart from "@/components/compare/DiscoveryMethodChart";
import LastValidatedNote from "@/components/compare/LastValidatedNote";
import WinLoseColumns from "@/components/compare/WinLoseColumns";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  competitorSlugs,
  getCompetitor,
  parseCompareRouteSlug,
} from "@/lib/copy/competitors";
import {
  buildComparisonJsonLd,
  buildFaqJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

type CompareSpokeProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return competitorSlugs.map((slug) => ({ slug: `qtangl-vs-${slug}` }));
}

export async function generateMetadata({ params }: CompareSpokeProps): Promise<Metadata> {
  const { slug: routeSlug } = await params;
  const competitorSlug = parseCompareRouteSlug(routeSlug);
  if (!competitorSlug) return {};
  const entry = getCompetitor(competitorSlug);
  if (!entry) return {};

  return buildPageMetadata({
    path: `/compare/${routeSlug}`,
    title: entry.seo.title,
    description: entry.seo.description,
    absoluteTitle: true,
    image: `/compare/${routeSlug}/opengraph-image`,
  });
}

export default async function CompareSpokePage({ params }: CompareSpokeProps) {
  const { slug: routeSlug } = await params;
  const slug = parseCompareRouteSlug(routeSlug);
  if (!slug) notFound();

  const competitor = getCompetitor(slug);
  if (!competitor || competitor.status !== "published") {
    notFound();
  }

  return (
    <PageShell>
      <CompareSpokeAnalytics slug={slug} />
      <Section>
        <article className="mx-auto max-w-4xl space-y-10">
          <header className="space-y-4">
            <Eyebrow>Qtangl vs {competitor.name}</Eyebrow>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {competitor.seo.title}
            </h1>
            <p className="text-lg leading-8 text-[var(--color-gray-300)]">{competitor.oneLiner}</p>
            <p className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[#6ee7a0]/[0.06] px-5 py-4 text-sm leading-7 text-[var(--color-gray-300)]">
              <strong className="text-white">Land the point:</strong> {competitor.landThePoint}
            </p>
          </header>

          <Card tone="panel" size="md" className="rounded-[var(--radius-xl)]">
            <p className="text-label">Their pitch</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
              {competitor.theirPitch}
            </p>
            <p className="mt-4 text-xs text-[var(--color-gray-500)]">
              Discovery: {competitor.discoveryMethod}
            </p>
          </Card>

          <Suspense fallback={<p className="text-sm text-[var(--color-gray-400)]">Loading…</p>}>
            <ComparisonMatrix
              competitors={[competitor]}
              basePath={`/compare/${routeSlug}`}
              showPicker={false}
              compact
            />
          </Suspense>

          <CompetitorRadar competitor={competitor} />

          <DiscoveryMethodChart competitors={[competitor]} focusSlug={slug} />

          <WinLoseColumns competitor={competitor} />

          <div className="grid gap-6 md:grid-cols-2">
            <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
              <Eyebrow>When to choose {competitor.name}</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {competitor.whenToChooseThem}
              </p>
            </Card>
            <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
              <Eyebrow>When to choose Qtangl</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {competitor.whenToChooseQtangl}
              </p>
            </Card>
          </div>

          {competitor.coopetitionNote ? (
            <Card tone="panel" size="md" className="rounded-[var(--radius-xl)]">
              <Eyebrow>Coopetition</Eyebrow>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                {competitor.coopetitionNote}
              </p>
            </Card>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">FAQ</h2>
            <div className="space-y-4">
              {competitor.faq.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-5"
                >
                  <h3 className="font-medium text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <LastValidatedNote
            lastValidated={competitor.lastValidated}
            sources={competitor.sources}
          />

          <div className="flex flex-wrap gap-3 border-t border-[var(--border-subtle)] pt-8">
            <Button href="/compare" variant="secondary">
              Full landscape
            </Button>
            <Button href="/assess">Run Q-Day scan</Button>
            <Link
              href="/blog/pqc-readiness-vendors-compared-2026"
              className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
            >
              Read vendor roundup
            </Link>
          </div>
        </article>
      </Section>

      <Section>
        <ComparisonCta source={`compare-spoke-${slug}`} />
      </Section>

      <JsonLd
        data={buildComparisonJsonLd({
          slug,
          title: competitor.seo.title,
          description: competitor.seo.description,
          competitorName: competitor.name,
        })}
      />
      <JsonLd data={buildFaqJsonLd(competitor.faq)} />
    </PageShell>
  );
}
