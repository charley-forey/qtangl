export type DemoStatus = "live" | "coming-soon";

export type DemoCatalogEntry = {
  slug: string;
  sector: string;
  title: string;
  oneLiner: string;
  runtime?: string;
  status: DemoStatus;
  href?: string;
};

export const demosPageCopy = {
  eyebrow: "Demos",
  title: "See Qtangl on real planning problems.",
  description:
    "Each demo is a full workflow: constraints in, ranked plan out, measurements your team can defend.",
} as const;

export const demoCatalog: readonly DemoCatalogEntry[] = [
  {
    slug: "hospital",
    sector: "Healthcare",
    title: "Hospital re-staffing",
    oneLiner:
      "Nurse call-out triggers a live CP-SAT solve, hybrid audit trace, and ops-ready scoreboard.",
    runtime: "4:11",
    status: "live",
    href: "/demo/hospital",
  },
  {
    slug: "construction",
    sector: "Construction",
    title: "Crew resequencing",
    oneLiner:
      "Resequence trades and inspections when one crew window moves — without rebuilding the job.",
    status: "coming-soon",
  },
  {
    slug: "logistics",
    sector: "Logistics",
    title: "Route under tight windows",
    oneLiner:
      "Re-route stops when a driver drops or customer windows tighten — ranked order, not guesswork.",
    status: "coming-soon",
  },
] as const;
