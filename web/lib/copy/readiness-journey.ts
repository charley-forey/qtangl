export type MaturityStage = {
  stage: number;
  name: string;
  characteristics: string;
  tier: string;
  href: string;
  cta: string;
};

export const maturityStages: readonly MaturityStage[] = [
  {
    stage: 0,
    name: "Unaware",
    characteristics: "No crypto inventory; ad hoc cert management",
    tier: "Content / free mini-assess",
    href: "/q-day",
    cta: "Start learning →",
  },
  {
    stage: 1,
    name: "Inventory",
    characteristics: "First scan complete; findings in spreadsheet",
    tier: "Assess",
    href: "/assess",
    cta: "Explore Assess →",
  },
  {
    stage: 2,
    name: "Prioritized",
    characteristics: "Backlog ranked by Mosca/deadline; owners assigned",
    tier: "Assess + workshop",
    href: "/assess",
    cta: "Run Q-Day scan →",
  },
  {
    stage: 3,
    name: "Monitored",
    characteristics: "Re-scans scheduled; drift detected",
    tier: "Monitor",
    href: "/monitor",
    cta: "Explore Monitor →",
  },
  {
    stage: 4,
    name: "Converting",
    characteristics: "Active migration sprints; re-scan proof per item",
    tier: "Convert",
    href: "/convert",
    cta: "Explore Convert →",
  },
  {
    stage: 5,
    name: "Agile",
    characteristics: "Hybrid PQ live; downgrade detection; readiness score ≥80",
    tier: "Enterprise",
    href: "/pricing",
    cta: "See Enterprise →",
  },
  {
    stage: 6,
    name: "Verified",
    characteristics: "Portfolio-wide evidence; transparency log; auditor-ready packs",
    tier: "Enterprise",
    href: "/trust",
    cta: "Trust center →",
  },
] as const;

export const journeyPageCopy = {
  metadata: {
    title: "Customer Journey",
    description:
      "From quantum crypto uncertainty to verified post-quantum readiness — Assess, Monitor, Convert with signed evidence.",
  },
  hero: {
    eyebrow: "Customer journey",
    title: "From first scan to proof of fix",
    description:
      "The vulnerability list is the hook. Monitor + evidence is the product. Convert is the high-value sticky tier.",
  },
  insight: {
    eyebrow: "Core insight",
    title: "Never sell Stage 6 to a Stage 0 buyer",
    description:
      "Always propose the next maturity stage plus one. Assessment hooks; Monitor and signed evidence retain.",
  },
  personas: [
    {
      title: "CISO / VP Security",
      trigger: "Board asks: how much RSA/ECDSA before 2030?",
      entry: "/assess → Assessment → Monitor",
    },
    {
      title: "Compliance / GRC lead",
      trigger: "CMMC, PCI-DSS 4.0, or HIPAA audit",
      entry: "Scenario packs → signed compliance pack",
    },
    {
      title: "VP Engineering",
      trigger: "Assigned to execute PQC migration",
      entry: "CBOM → remediation board → re-scan verification",
    },
  ],
  touchpoints: [
    { channel: "Website", assess: "/assess", monitor: "/monitor", convert: "/convert" },
    { channel: "Self-serve", assess: "/assess", monitor: "/access", convert: "/access" },
    { channel: "Dashboard", assess: "Scan history", monitor: "Drift + schedules", convert: "Remediation board" },
  ],
} as const;
