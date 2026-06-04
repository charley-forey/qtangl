import Link from "next/link";
import Image from "next/image";

import BlogReferencesPanel from "@/components/marketing/BlogReferencesPanel";
import ContentQualityStrip from "@/components/marketing/ContentQualityStrip";
import HndlBlogLeadCapture from "@/components/marketing/HndlBlogLeadCapture";
import PageShell from "@/components/layout/PageShell";
import ReadinessMarkdown from "@/components/marketing/ReadinessMarkdown";
import Section from "@/components/layout/Section";
import YouTubeEmbed from "@/components/marketing/YouTubeEmbed";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import JsonLd from "@/components/seo/JsonLd";
import { readinessBlogCta } from "@/lib/copy/articles";
import type { ReadinessBlogRegistryEntry } from "@/lib/readiness-content-types";
import { getQDaySourcesByIds } from "@/lib/copy/q-day-sources";
import type { LoadedReadinessContent } from "@/lib/readiness-content-types";
import { buildBlogPostingJsonLd, buildFaqJsonLd } from "@/lib/seo";
import { buildAssessMiniHref } from "@/lib/hndl-funnel";
import { coverImageLoadingProps } from "@/lib/cover-image";

type MarkdownReadinessArticleProps = {
  content: LoadedReadinessContent;
  registry: ReadinessBlogRegistryEntry;
  path: string;
};

export default function MarkdownReadinessArticle({
  content,
  registry,
  path,
}: MarkdownReadinessArticleProps) {
  const sources = getQDaySourcesByIds(content.sourceIds);
  const faq = registry.faq;
  const primaryHref = registry.hndl
    ? buildAssessMiniHref({ source: `blog-${registry.slug}`, content: "cta-primary" })
    : content.ctaPrimary;

  return (
    <PageShell>
      <Section>
        <article className="mx-auto max-w-3xl space-y-10 text-[var(--color-gray-300)]">
          <header className="space-y-4">
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h1 className="text-3xl font-semibold text-white">{content.title}</h1>
            <p className="text-lg leading-8">{content.intro}</p>
          </header>

          <Card tone="feature" size="sm" className="relative overflow-hidden rounded-[var(--radius-feature)] p-0">
            <div className="relative aspect-[16/9]">
              <Image
                src={registry.coverImage}
                alt={registry.coverAlt}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                {...coverImageLoadingProps(registry.coverImage)}
                className="object-cover"
              />
            </div>
          </Card>

          {content.videoId && content.videoTitle ? (
            <YouTubeEmbed videoId={content.videoId} title={content.videoTitle} />
          ) : null}

          <ReadinessMarkdown markdown={content.markdownBody} />

          <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-black/30 p-5">
            <p className="text-sm text-[var(--color-gray-400)]">
              Continue on the Q-Day hub:{" "}
              <Link href={content.hubLink} className="text-white underline underline-offset-4">
                {content.hubLabel}
              </Link>
            </p>
          </section>

          <ContentQualityStrip />
          <BlogReferencesPanel sources={sources} />

          {registry.hndl ? <HndlBlogLeadCapture slug={registry.slug} /> : null}

          <section className="space-y-4 border-t border-[var(--border-subtle)] pt-8">
            <h2 className="text-xl font-semibold text-white">{readinessBlogCta.title}</h2>
            <p className="text-sm leading-7">{readinessBlogCta.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button href={primaryHref}>{readinessBlogCta.primaryLabel}</Button>
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
          headline: content.title,
          description: content.description,
          datePublished: content.datePublished,
        })}
      />
      {faq && faq.length > 0 ? <JsonLd data={buildFaqJsonLd(faq)} /> : null}
    </PageShell>
  );
}
