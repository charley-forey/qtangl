import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeadlineTimeline from "@/components/marketing/DeadlineTimeline";
import MoscaCalculator from "@/components/marketing/MoscaCalculator";
import QDayArticlePage from "@/components/marketing/QDayArticlePage";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import {
  getQDayArticle,
  qDayArticles,
  type QDayArticleSlug,
} from "@/lib/copy/readiness-qday-hub";
import { buildPageMetadata } from "@/lib/seo";

type QDayArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(qDayArticles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: QDayArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getQDayArticle(slug);
  if (!article) {
    return {};
  }

  return buildPageMetadata({
    path: `/q-day/${slug}`,
    title: article.metadata.title,
    description: article.metadata.description,
  });
}

export default async function QDayArticleRoute({ params }: QDayArticleRouteProps) {
  const { slug } = await params;
  const article = getQDayArticle(slug);
  if (!article) {
    notFound();
  }

  return (
    <PageShell>
      <QDayArticlePage slug={slug} />
      {slug === "mosca-inequality" ? (
        <Section gap="tight" className="pb-0">
          <MoscaCalculator />
        </Section>
      ) : null}
      {slug === "deadlines" ? (
        <Section gap="tight" className="pb-0">
          <DeadlineTimeline />
        </Section>
      ) : null}
    </PageShell>
  );
}

export type { QDayArticleSlug };
