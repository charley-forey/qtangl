import "server-only";

import { cache } from "react";

import {
  quantumCryptoLearningLayers,
  quantumCryptoVideoCompanionSlugs,
} from "@/lib/copy/quantum-crypto-learning-path";
import { readinessBlogRegistry } from "@/lib/copy/readiness-content-registry";
import { loadReadinessMarkdown } from "@/lib/readiness-content";

export type PublicVideoCompanion = {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  videoId?: string;
  videoTitle?: string;
  thumbnailUrl?: string;
};

export type PublicBlogLink = {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  kind: "video-companion" | "blog";
  coverImage: string;
};

export type PublicLearningLayer = {
  id: string;
  title: string;
  checkpoint: string;
  diagramHref?: string;
  blogs: PublicBlogLink[];
};

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function registryBlogLink(slug: string): PublicBlogLink | null {
  const entry = readinessBlogRegistry.find((item) => item.slug === slug);
  if (!entry || (entry.kind !== "blog" && entry.kind !== "video-companion")) {
    return null;
  }
  return {
    slug: entry.slug,
    title: entry.title,
    excerpt: entry.excerpt,
    href: `/blog/${entry.slug}`,
    kind: entry.kind,
    coverImage: entry.coverImage,
  };
}

export const loadVideoCompanionCatalog = cache(async (): Promise<PublicVideoCompanion[]> => {
  const results = await Promise.all(
    quantumCryptoVideoCompanionSlugs.map(async (slug) => {
      const entry = readinessBlogRegistry.find((item) => item.slug === slug);
      if (!entry) {
        return null;
      }

      const loaded = await loadReadinessMarkdown("blog", slug, entry.markdownFile);
      const videoId = loaded.videoId;

      return {
        slug,
        title: entry.title,
        excerpt: entry.excerpt,
        href: `/blog/${slug}`,
        videoId,
        videoTitle: loaded.videoTitle,
        thumbnailUrl: videoId ? youtubeThumbnailUrl(videoId) : entry.coverImage,
      };
    }),
  );

  return results.filter((item) => item !== null) as PublicVideoCompanion[];
});

export const loadQuantumCryptoLayers = cache(async (): Promise<PublicLearningLayer[]> => {
  return quantumCryptoLearningLayers.map((layer) => ({
    id: layer.id,
    title: layer.title,
    checkpoint: layer.checkpoint,
    diagramHref: layer.diagramId ? `/learn/diagrams/${layer.diagramId}.png` : undefined,
    blogs: layer.blogSlugs
      .map((slug) => registryBlogLink(slug))
      .filter((item): item is PublicBlogLink => item !== null),
  }));
});

export function readinessVideoCompanionIndexPosts() {
  return readinessBlogRegistry
    .filter((entry) => entry.kind === "video-companion")
    .map((entry) => ({
      slug: entry.slug,
      href: `/blog/${entry.slug}`,
      category: "Video companion",
      coverImage: entry.coverImage,
      coverAlt: entry.coverAlt,
      title: entry.title,
      excerpt: entry.excerpt,
      description: entry.description,
      readiness: true as const,
      videoCompanion: true as const,
    }));
}
