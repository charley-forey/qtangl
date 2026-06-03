export type ReadinessJourneyStage = "assess" | "monitor" | "convert" | "all";

export type ReadinessContentKind = "blog" | "video-companion" | "framework";

export type ReadinessContentFrontmatter = {
  title: string;
  description: string;
  keyword: string;
  journeyStage: ReadinessJourneyStage;
  hubLink: string;
  hubLabel: string;
  ctaPrimary: string;
  datePublished: string;
  eyebrow: string;
  intro: string;
  sourceIds: readonly string[];
  videoId?: string;
  videoTitle?: string;
};

export type ReadinessBlogRegistryEntry = {
  slug: string;
  kind: ReadinessContentKind;
  markdownFile: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  coverAlt: string;
  excerpt: string;
  readiness: true;
  featured?: boolean;
  faq?: readonly { question: string; answer: string }[];
};

export type ReadinessFrameworkRegistryEntry = {
  slug: string;
  markdownFile: string;
  externalSourceIds: readonly string[];
};

export type LoadedReadinessContent = ReadinessContentFrontmatter & {
  slug: string;
  kind: ReadinessContentKind;
  markdownBody: string;
};
