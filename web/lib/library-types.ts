export type LibraryTopicRef = {
  slug: string;
  title: string;
};

export type LibraryCategorySummary = {
  slug: string;
  title: string;
  description: string;
  cluster: string;
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
  primaryLanguage: string | null;
  primaryLanguages: string[];
  license: string | null;
  summary: string;
  description: string;
  stars: number;
  lastPushedAt: string | null;
  featured: boolean;
  flagship: boolean;
  qtanglRelevant: boolean;
  archived: boolean;
  imagePath: string | null;
};
