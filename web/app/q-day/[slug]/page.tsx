import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeadlineTimeline from "@/components/marketing/DeadlineTimeline";
import MoscaCalculator from "@/components/marketing/MoscaCalculator";
import QDayArticlePage from "@/components/marketing/QDayArticlePage";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import {
  getQDayArticle,
  qDayArticles,
  type QDayArticleSlug,
} from "@/lib/copy/readiness-qday-hub";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

const hndlFaqs = [
  {
    question: "Is my encryption broken today?",
    answer:
      "No. Quantum-vulnerable algorithms like RSA and ECDSA still protect data today. HNDL is about ciphertext captured now that may be decrypted after a future CRQC arrives.",
  },
  {
    question: "Who faces the highest HNDL exposure?",
    answer:
      "Organizations holding data with long confidentiality requirements — healthcare records, financial archives, government data — especially when migration takes five to ten years.",
  },
  {
    question: "What is the first step to reduce HNDL risk?",
    answer:
      "Run a cryptographic inventory, quantify data shelf-life against migration runway using Mosca's inequality, and begin phased post-quantum migration with evidence.",
  },
] as const;

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
      {slug === "hndl" ? <JsonLd data={buildFaqJsonLd(hndlFaqs)} /> : null}
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
