export type NextBestAction = {
  id: string;
  kind: string;
  title: string;
  impact: string;
  effort: string;
  score: number;
  owner?: string | null;
  deepLink?: string | null;
  cta?: { label: string; action: string };
};

export type MorningBriefing = {
  generatedAt: string;
  persona: string;
  headline: string;
  bullets: string[];
  nextActions: NextBestAction[];
  methodNote: string;
};

export type RunwayMilestone = {
  id: string;
  label: string;
  date: string;
  kind: string;
  description: string;
};

export type RunwayData = {
  milestones: RunwayMilestone[];
  scenarios: Array<{ id: string; label: string; readinessDelta: number; description: string }>;
  framing: string;
};

export type GlobalLens = {
  businessUnit: string | null;
  framework: string | null;
  severity: string | null;
  environment: string | null;
  query: string | null;
};

export type MarketplaceTile = {
  id: string;
  name: string;
  publisher: string;
  description: string;
  category: string;
  installed: boolean;
};

export const EMPTY_LENS: GlobalLens = {
  businessUnit: null,
  framework: null,
  severity: null,
  environment: null,
  query: null,
};
