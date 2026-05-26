import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

export type LibraryTopicRef = {
  slug: string;
  title: string;
};

export type LibraryCategorySummary = {
  slug: string;
  title: string;
  description: string;
  topicSlugs: string[];
  heroImagePath: string;
  resourceCount: number;
  resourceSlugs: string[];
  featuredSlugs: string[];
};

export type LibraryIndexEntry = {
  slug: string;
  title: string;
  owner: string;
  name: string;
  repoUrl: string;
  category: {
    slug: string;
    title: string;
    description: string;
  };
  topics: LibraryTopicRef[];
  primaryLanguage: string;
  license: string;
  summary: string;
  description: string;
  stars: number;
  featured: boolean;
  flagship: boolean;
  qtanglRelevant: boolean;
  archived: boolean;
  imagePath: string | null;
};

export type LibraryEntry = LibraryIndexEntry & {
  homepageUrl: string | null;
  whatItIs: string[];
  whoItsFor: string;
  whatYouCanBuild: string[];
  readmeExcerpt: string;
  readmePath: string | null;
  clonePath: string | null;
  lastPushedAt: string | null;
  githubTopics: string[];
  relatedSlugs: string[];
};

export type LibraryMeta = {
  generatedAt: string;
  repoCount: number;
  sourceUrl: string;
  featuredSlugs: string[];
  flagshipSlugs: string[];
  qtanglRelevantSlugs: string[];
};

const LIBRARY_ROOT = path.join(process.cwd(), "content", "library");

async function readJsonFile<T>(...segments: string[]): Promise<T> {
  const filePath = path.join(LIBRARY_ROOT, ...segments);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export const getLibraryIndex = cache(async () => readJsonFile<LibraryIndexEntry[]>("index.json"));

export const getLibraryCategories = cache(async () =>
  readJsonFile<LibraryCategorySummary[]>("categories.json")
);

export const getLibraryMeta = cache(async () => readJsonFile<LibraryMeta>("meta.json"));

export const getLibraryEntry = cache(async (slug: string) =>
  readJsonFile<LibraryEntry>("entries", `${slug}.json`)
);

export async function getLibraryEntryOrNull(slug: string) {
  try {
    return await getLibraryEntry(slug);
  } catch {
    return null;
  }
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getLibraryCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getLibraryEntriesBySlugs(slugs: string[]) {
  const index = await getLibraryIndex();
  const slugSet = new Set(slugs);
  return index.filter((entry) => slugSet.has(entry.slug));
}

export async function getFeaturedLibraryEntries(limit?: number) {
  const index = await getLibraryIndex();
  const featured = index.filter((entry) => entry.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export async function getQtanglRelevantEntries(limit?: number) {
  const index = await getLibraryIndex();
  const relevant = index.filter((entry) => entry.qtanglRelevant);
  return typeof limit === "number" ? relevant.slice(0, limit) : relevant;
}

export async function getLibraryEntriesForCategory(slug: string) {
  const index = await getLibraryIndex();
  return index.filter((entry) => entry.category.slug === slug);
}

export async function getLibraryEntriesForTopic(slug: string) {
  const index = await getLibraryIndex();
  return index.filter((entry) => entry.topics.some((topic) => topic.slug === slug));
}
