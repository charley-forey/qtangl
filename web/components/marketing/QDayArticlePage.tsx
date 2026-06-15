import Link from "next/link";
import Image from "next/image";

import BlogReferencesPanel from "@/components/marketing/BlogReferencesPanel";
import FeatureCard from "@/components/marketing/FeatureCard";
import HndlFeatureCard from "@/components/marketing/HndlFeatureCard";
import HndlHubFooterActions from "@/components/marketing/HndlHubFooterActions";
import HndlHubHeroActions from "@/components/marketing/HndlHubHeroActions";
import HndlHubSections from "@/components/marketing/HndlHubSections";
import HndlKeyTerms from "@/components/marketing/HndlKeyTerms";
import PageHero from "@/components/layout/PageHero";
import Section from "@/components/layout/Section";
import YouTubeEmbed from "@/components/marketing/YouTubeEmbed";
import Eyebrow from "@/components/ui/Eyebrow";
import { getQDaySourcesByIds } from "@/lib/copy/q-day-sources";
import {
  getQDayArticle,
  getRelatedQDayResources,
} from "@/lib/copy/readiness-qday-hub";

type QDayArticlePageProps = {
  slug: string;
};

export default function QDayArticlePage({ slug }: QDayArticlePageProps) {
  const article = getQDayArticle(slug);
  if (!article) {
    return null;
  }

  const related = getRelatedQDayResources(article.related);
  const sources = article.externalSourceIds
    ? getQDaySourcesByIds(article.externalSourceIds)
    : [];
  const isHndl = slug === "hndl";

  return (
    <>
      <PageHero
        eyebrow={article.eyebrow}
        title={article.title}
        description={article.description}
        actions={
          isHndl
            ? undefined
            : [
                { href: "/assess/mini", label: "Free mini-assessment" },
                { href: "/q-day", label: "Back to hub", variant: "secondary" },
              ]
        }
        actionsSlot={isHndl ? <HndlHubHeroActions /> : undefined}
      />

      {article.sections.map((section) => (
        <Section key={section.heading} gap="tight" id={section.anchor}>
          <div className="content-reading">
            <h2 className="heading-section">{section.heading}</h2>
            <p className="mt-4 text-base leading-8 text-[var(--color-gray-300)]">{section.body}</p>
            {section.keyTerms?.length ? (
              <HndlKeyTerms termIds={section.keyTerms} />
            ) : null}
            {section.diagram ? (
              <figure className="mt-8 overflow-hidden rounded-[var(--radius-feature)] border border-[var(--border)]">
                <Image
                  src={section.diagram}
                  alt={section.diagramAlt ?? section.heading}
                  width={1200}
                  height={630}
                  className="h-auto w-full"
                />
              </figure>
            ) : null}
          </div>
        </Section>
      ))}

      {isHndl ? <HndlHubSections /> : null}

      {article.videoId && article.videoTitle ? (
        <Section gap="tight">
          <Eyebrow>Video explainer</Eyebrow>
          <div className="mt-6 max-w-3xl">
            <YouTubeEmbed videoId={article.videoId} title={article.videoTitle} />
          </div>
        </Section>
      ) : null}

      {sources.length > 0 ? (
        <Section gap="tight">
          <BlogReferencesPanel sources={sources} />
        </Section>
      ) : null}

      {article.blogCompanionHref && article.blogCompanionTitle ? (
        <Section gap="tight">
          <Eyebrow>Deep dive</Eyebrow>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {isHndl ? (
              <HndlFeatureCard
                title={article.blogCompanionTitle}
                description="Extended analysis with industry context, action checklists, and Qtangl product tie-ins."
                href={article.blogCompanionHref}
                ctaLabel="Read blog post →"
                placement="deep-dive"
              />
            ) : (
              <FeatureCard
                title={article.blogCompanionTitle}
                description="Extended analysis with industry context, action checklists, and Qtangl product tie-ins."
                href={article.blogCompanionHref}
                ctaLabel="Read blog post →"
              />
            )}
            {isHndl ? (
              <HndlFeatureCard
                title="How encrypted data is harvested"
                description="Practitioner guide to collection vectors — breach, backups, cloud, and transit."
                href="/blog/how-encrypted-data-is-harvested"
                ctaLabel="Read guide →"
                placement="deep-dive"
              />
            ) : null}
          </div>
        </Section>
      ) : null}

      {related.length ? (
        <Section gap="tight">
          <Eyebrow>Related</Eyebrow>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((item) =>
              isHndl ? (
                <HndlFeatureCard
                  key={item.slug}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  ctaLabel="Read guide →"
                  placement="related"
                />
              ) : (
                <FeatureCard
                  key={item.slug}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  ctaLabel="Read guide →"
                />
              ),
            )}
          </div>
        </Section>
      ) : null}

      <Section gap="tight" className="pb-0">
        {isHndl ? (
          <HndlHubFooterActions />
        ) : (
          <div className="flex flex-wrap gap-3">
            <Link
              href="/assess/mini"
              className="touch-target relative inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black"
            >
              Free mini-assessment
            </Link>
            <Link
              href="/assess"
              className="touch-target relative inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.02] px-6 text-sm font-medium text-white"
            >
              Try PQC demo
            </Link>
            <Link
              href="/q-day"
              className="inline-flex items-center text-sm text-[var(--color-gray-400)] underline-offset-4 hover:text-white hover:underline"
            >
              ← Q-Day hub
            </Link>
          </div>
        )}
      </Section>
    </>
  );
}
