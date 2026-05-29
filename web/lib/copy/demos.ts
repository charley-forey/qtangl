export type DemoStatus = "live" | "coming-soon";

export type DemoCatalogEntry = {
  slug: string;
  sector: string;
  title: string;
  oneLiner: string;
  runtime?: string;
  status: DemoStatus;
  href?: string;
  variant?: "workflow" | "sandbox";
  badge?: string;
  endpoint?: string;
};

export const demosPageCopy = {
  eyebrow: "Demos",
  title: "See Qtangl on real planning problems.",
  description:
    "Full workflows for buyers — nurse call-outs, crew delays, and tight delivery windows. Same ranked-plan output, operationally honest.",
  catalogHeading: "Industry workflows",
  sandboxHeading: "For developers",
} as const;

export const sandboxCatalogEntry: DemoCatalogEntry = {
  slug: "sandbox",
  sector: "Developers",
  title: "API sandbox",
  oneLiner:
    "Send a real POST /optimize call, see ranked JSON and a visual plan — same response shape your app receives.",
  status: "live",
  href: "/sandbox",
  variant: "sandbox",
  badge: "Interactive",
  endpoint: "POST /optimize",
};

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
    variant: "workflow",
  },
  {
    slug: "airline",
    sector: "Aviation",
    title: "Airline crew recovery",
    oneLiner:
      "MX hold at KORD triggers tail routing repair, multi-leg crew rebid, hybrid alternates, and FAR 117 audit.",
    runtime: "3:45",
    status: "live",
    href: "/demo/airline",
    variant: "workflow",
  },
  {
    slug: "construction",
    sector: "Construction",
    title: "Crew resequencing",
    oneLiner:
      "Resequence trades and inspections when one crew window moves — without rebuilding the job.",
    status: "coming-soon",
    variant: "workflow",
  },
  {
    slug: "ev-fleet",
    sector: "Logistics / Last-mile",
    title: "EV depot charging + routing",
    oneLiner:
      "VRP routes plus TOU-aware charger queue and hybrid peak staggering — $/day and peak kW on the scoreboard.",
    runtime: "3:30",
    status: "live",
    href: "/demo/ev-fleet",
    variant: "workflow",
  },
] as const;
