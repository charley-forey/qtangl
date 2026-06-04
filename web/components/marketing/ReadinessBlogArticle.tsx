import Link from "next/link";

import BlogReferencesPanel from "@/components/marketing/BlogReferencesPanel";
import CoverImage from "@/components/marketing/CoverImage";
import HndlKeyTerms from "@/components/marketing/HndlKeyTerms";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonLd from "@/components/seo/JsonLd";
import { readinessBlogCta, readinessArticles } from "@/lib/copy/articles";
import { getQDaySourcesByIds } from "@/lib/copy/q-day-sources";
import { buildBlogPostingJsonLd, buildFaqJsonLd } from "@/lib/seo";

type ReadinessArticleKey = keyof typeof readinessArticles;

type ReadinessBlogArticleProps = {
  slug: ReadinessArticleKey;
  path: string;
  hubHref?: string;
  hubLabel?: string;
  keyTermIds?: readonly string[];
  faq?: readonly { question: string; answer: string }[];
};

export default function ReadinessBlogArticle({
  slug,
  path,
  hubHref,
  hubLabel,
  keyTermIds,
  faq,
}: ReadinessBlogArticleProps) {
  const article = readinessArticles[slug];
  const sources = getQDaySourcesByIds(article.sourceIds);

  return (
    <PageShell>
      <Section>
        <article className="mx-auto max-w-3xl space-y-10 text-[var(--color-gray-300)]">
          <header className="space-y-4">
            <Eyebrow>{article.eyebrow}</Eyebrow>
            <h1 className="text-3xl font-semibold text-white">{article.title}</h1>
            <p className="text-lg leading-8">{article.intro}</p>
            {keyTermIds?.length ? <HndlKeyTerms termIds={keyTermIds} /> : null}
          </header>

          {article.coverImage ? (
            <Card tone="feature" size="sm" className="relative overflow-hidden rounded-[var(--radius-feature)] p-0">
              <div className="relative aspect-[16/9]">
                <CoverImage src={article.coverImage} alt={article.coverAlt} />
              </div>
            </Card>
          ) : null}

          {article.sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {hubHref && hubLabel ? (
            <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 p-5">
              <p className="text-sm text-[var(--color-gray-400)]">
                Continue on the Q-Day hub:{" "}
                <Link href={hubHref} className="text-white underline underline-offset-4">
                  {hubLabel}
                </Link>
              </p>
            </section>
          ) : null}

          <BlogReferencesPanel sources={sources} />

          <section className="space-y-4 border-t border-[var(--border-subtle)] pt-8">
            <h2 className="text-xl font-semibold text-white">{readinessBlogCta.title}</h2>
            <p className="text-sm leading-7">{readinessBlogCta.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button href={readinessBlogCta.primaryHref}>{readinessBlogCta.primaryLabel}</Button>
              <Button href={readinessBlogCta.secondaryHref} variant="secondary">
                {readinessBlogCta.secondaryLabel}
              </Button>
              <Link
                href="/q-day"
                className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
              >
                Q-Day hub
              </Link>
            </div>
          </section>
        </article>
      </Section>

      <JsonLd
        data={buildBlogPostingJsonLd({
          path,
          headline: article.title,
          description: article.intro,
          datePublished: article.datePublished,
        })}
      />
      {faq && faq.length > 0 ? <JsonLd data={buildFaqJsonLd(faq)} /> : null}
    </PageShell>
  );
}
