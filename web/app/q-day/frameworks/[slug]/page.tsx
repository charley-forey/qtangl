import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FrameworkGuideLayout from "@/components/marketing/FrameworkGuideLayout";
import PageShell from "@/components/layout/PageShell";
import JsonLd from "@/components/seo/JsonLd";
import {
  frameworkGuideList,
  getFrameworkGuide,
} from "@/lib/copy/readiness-frameworks";
import { getReadinessFrameworkMarkdownEntry } from "@/lib/copy/readiness-content-registry";
import { loadReadinessMarkdown } from "@/lib/readiness-content";
import { buildFrameworkJsonLd, buildPageMetadata } from "@/lib/seo";

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

  const markdownEntry = getReadinessFrameworkMarkdownEntry(slug);
  let markdown = null;
  if (markdownEntry) {
    markdown = await loadReadinessMarkdown("framework", slug, markdownEntry.markdownFile);
  }

  return (
    <PageShell>
      <JsonLd data={buildFrameworkJsonLd(guide)} />
      <FrameworkGuideLayout
        guide={guide}
        markdown={markdown}
        externalSourceIds={markdownEntry?.externalSourceIds}
      />
    </PageShell>
  );
}
