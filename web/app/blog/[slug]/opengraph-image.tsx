import { notFound } from "next/navigation";

import { getReadinessBlogEntry } from "@/lib/copy/readiness-content-registry";
import { loadReadinessMarkdown } from "@/lib/readiness-content";
import {
  readinessOgContentType,
  readinessOgSize,
  renderReadinessOgImage,
} from "@/lib/readiness-og-image";

export const size = readinessOgSize;
export const contentType = readinessOgContentType;

type BlogOgImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: BlogOgImageProps) {
  const { slug } = await params;
  const registry = getReadinessBlogEntry(slug);
  if (!registry) {
    notFound();
  }

  const content = await loadReadinessMarkdown(registry.kind, slug, registry.markdownFile);

  return renderReadinessOgImage({
    eyebrow: "Q-Day readiness",
    title: content.title,
    description: content.description,
    footer: "Qtangl Blog",
  });
}
