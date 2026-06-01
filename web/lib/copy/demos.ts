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
  title: "Q-Day readiness — live product demo.",
  description:
    "Start with the Q-Day scanner for post-quantum inventory. Hybrid optimization workflows live under Labs (expansion).",
  catalogHeading: "Q-Day readiness (product)",
  labsHeading: "Labs — hybrid optimization (expansion)",
  optimizationHeading: "Labs — hybrid optimization (expansion)",
  sandboxHeading: "Labs — for developers",
} as const;

export const labsHubCopy = {
  metadata: {
    title: "Labs — Hybrid Optimization",
    description:
      "Expansion demos: hospital re-staffing, airline crew recovery, EV fleet routing, and the planning API sandbox. Separate from the Q-Day readiness platform.",
  },
  hero: {
    eyebrow: "Labs / expansion",
    title: "Hybrid optimization workflows",
    description:
      "Scheduling, routing, and staffing under real constraints — a forward-looking expansion motion after post-quantum readiness. Not part of the Assess → Monitor → Convert product.",
  },
  readinessBanner: {
    text: "Looking for post-quantum readiness?",
    href: "/platform",
    cta: "Explore Q-Day platform →",
  },
  demos: {
    eyebrow: "Live workflow demos",
    title: "Industry optimization scenarios",
    description:
      "Same ranked-plan output, operationally honest — quarantined from the Q-Day readiness GTM until you choose to explore expansion.",
  },
  developer: {
    eyebrow: "For developers",
    title: "Planning API sandbox",
    description: "Send a real POST /optimize call and see ranked JSON your app receives.",
    href: "/sandbox",
    cta: "Open sandbox →",
  },
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
    slug: "pqc",
    sector: "Security / Cryptography",
    title: "Q-Day readiness scanner",
    oneLiner:
      "Inventory quantum-vulnerable crypto, Mosca HNDL risk, hybrid ML-KEM handshake proof, and CBOM migration reports.",
    runtime: "8:00",
    status: "live",
    href: "/demo/pqc",
    variant: "workflow",
  },
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
  {
    slug: "construction",
    sector: "Construction",
    title: "Crew resequencing",
    oneLiner:
      "Resequence trades and inspections when one crew window moves — without rebuilding the job.",
    status: "coming-soon",
    variant: "workflow",
  },
] as const;

export const optimizationDemoCatalog = demoCatalog.filter((demo) => demo.slug !== "pqc");
