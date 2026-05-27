import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";

export type {
  LibraryCategorySummary,
  LibraryIndexEntry,
  LibraryTopicRef,
} from "@/lib/library-types";

import type { LibraryCategorySummary, LibraryIndexEntry } from "@/lib/library-types";

export type CodeSample = {
  title: string;
  language: string;
  source: string;
  path: string;
};

export type PackageMeta = {
  name?: string;
  version?: string;
  requiresPython?: string;
  dependencies?: string[];
};

export type ExternalLinks = {
  docs?: string[];
  paper?: string[];
  community?: string[];
  pypi?: string[];
};

export type QuickstartBlock = {
  language: string;
  source: string;
};

export type LibraryEntry = LibraryIndexEntry & {
  homepageUrl: string | null;
  whatItIs: string[];
  whoItsFor: string;
  whatYouCanBuild: string[];
  readmeExcerpt: string;
  readmePath: string | null;
  readmeMarkdownPath: string | null;
  clonePath: string | null;
  defaultBranch: string;
  githubTopics: string[];
  quickstart: QuickstartBlock | null;
  codeSamples: CodeSample[];
  packageMeta: PackageMeta;
  citationBibtex: string | null;
  supportedBackendSlugs: string[];
  externalLinks: ExternalLinks;
  openIssuesCount: number | null;
  subscribersCount: number | null;
  latestRelease: string | null;
  ownerType: string | null;
  ownerUrl: string | null;
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

export async function getLibraryReadmeMarkdown(slug: string) {
  try {
    return await fs.readFile(
      path.join(LIBRARY_ROOT, "readmes", `${slug}.md`),
      "utf-8"
    );
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

export async function getRecentlyUpdatedEntries(limit = 6, sinceDays = 365) {
  const index = await getLibraryIndex();
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
  return index
    .filter((entry) => entry.lastPushedAt && new Date(entry.lastPushedAt).getTime() >= cutoff)
    .sort(
      (a, b) =>
        new Date(b.lastPushedAt ?? 0).getTime() - new Date(a.lastPushedAt ?? 0).getTime()
    )
    .slice(0, limit);
}

export async function getLibraryEntriesForCategory(slug: string) {
  const index = await getLibraryIndex();
  return index.filter((entry) => entry.category.slug === slug);
}

export async function getLibraryEntriesForTopic(slug: string) {
  const index = await getLibraryIndex();
  return index.filter((entry) => entry.topics.some((topic) => topic.slug === slug));
}

export { formatRelativeDate, isNewThisMonth } from "@/lib/library-utils";
