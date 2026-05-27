export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  items: string[];
  tags?: ("ga" | "pilot" | "fix" | "docs")[];
};

export const changelog: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2026-05-27",
    title: "Enterprise docs surface",
    tags: ["docs"],
    items: [
      "Full-platform documentation with grouped navigation, search, and per-endpoint reference.",
      "JSON Schema viewer sourced from backend contracts.",
      "Roadmap and changelog pages for operational honesty.",
    ],
  },
  {
    version: "0.1.0-pilot",
    date: "2026-05-26",
    title: "Hospital demo API",
    tags: ["pilot"],
    items: [
      "Hospital re-staffing endpoints under /hospital/* with classical + hybrid audit flow.",
      "CSV roster upload with 24-hour session storage.",
    ],
  },
  {
    version: "0.1.0-pilot",
    date: "2026-05-25",
    title: "Schedule optimizer GA",
    tags: ["ga"],
    items: [
      "POST /optimize live for schedule problems with CP-SAT baseline.",
      "Bounded QAOA research path with classical fallback.",
      "Bearer and x-api-key authentication; 120 req/min default rate limit.",
    ],
  },
];
