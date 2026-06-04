import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MarkdownReadinessArticle from "@/components/marketing/MarkdownReadinessArticle";
import {
  getReadinessBlogEntry,
  readinessBlogSlugs,
} from "@/lib/copy/readiness-content-registry";
import { loadReadinessMarkdown } from "@/lib/readiness-content";
import { buildPageMetadata } from "@/lib/seo";

type ReadinessBlogRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return readinessBlogSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ReadinessBlogRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const registry = getReadinessBlogEntry(slug);
  if (!registry) {
    return {};
  }

  const content = await loadReadinessMarkdown(registry.kind, slug, registry.markdownFile);

  return buildPageMetadata({
    path: `/blog/${slug}`,
    title: content.title,
    description: content.description,
    type: "article",
    absoluteTitle: true,
    image: `/blog/${slug}/opengraph-image`,
  });
}

export default async function ReadinessMarkdownBlogPage({ params }: ReadinessBlogRouteProps) {
  const { slug } = await params;
  const registry = getReadinessBlogEntry(slug);
  if (!registry) {
    notFound();
  }

  const content = await loadReadinessMarkdown(registry.kind, slug, registry.markdownFile);

  return (
    <MarkdownReadinessArticle
      content={content}
      registry={registry}
      path={`/blog/${slug}`}
    />
  );
}
