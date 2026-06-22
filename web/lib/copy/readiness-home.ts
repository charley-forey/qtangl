import { readinessLexicon } from "@/lib/copy/readiness";

const { evidence, exposure, hndl } = readinessLexicon;

export const readinessHero = {
  eyebrow: "Cryptographic posture management",
  title: "Assess. Monitor. Convert.",
  subhead:
    "Discover quantum-vulnerable cryptography across your estate, build a CycloneDX CBOM inventory, and prove migration progress with signed evidence auditors verify independently.",
  primaryCta: { label: "Run Q-Day scan", href: "/assess" },
  secondaryCta: { label: "Verify a report", href: "/verify?token=sample-token" },
} as const;

export const readinessHeadlineDemo = {
  eyebrow: "Headline demo",
  title: "Q-Day inventory in 8 minutes",
  description:
    "Domain scan → CycloneDX CBOM + executive PDF → verify link your auditors can check independently.",
  stats: [
    { label: "Q-vulnerable endpoints", value: "47" },
    { label: "Readiness score", value: "62" },
    { label: "Coverage confidence", value: "High" },
  ],
  primaryCta: { label: "Open Q-Day scanner", href: "/assess" },
} as const;

export const readinessHomeNarrative = {
  workflowEyebrow: "Assess → Monitor → Convert",
  workflowTitle: "One platform from baseline to proof of fix.",
  domainEyebrow: exposure.label,
  domainTitle: "Readiness scenarios for regulated teams.",
  apiEyebrow: evidence.label,
  apiTitle: "Scan first. API when you're ready.",
  apiDescription:
    "POST a target domain. Get inventory, Mosca HNDL risk, CBOM exports, and a signed PDF your GRC team can verify.",
  qDayLink: { label: "Q-Day education hub →", href: "/q-day" },
} as const;

export type MarketingCtaPanel = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  docsLink: { label: string; href: string };
};

export const readinessCtaPanel: MarketingCtaPanel = {
  eyebrow: "Q-Day readiness",
  title: "Ready for your first Q-Day assessment?",
  description:
    "Run a live scan, review Mosca HNDL exposure, and export signed evidence — or request a guided pilot for your domain.",
  primaryCta: { label: "Run Q-Day scan", href: "/assess" },
  secondaryCta: { label: "Request pilot access", href: "/access" },
  docsLink: { label: "See a signed report", href: "/verify?token=sample-token" },
};

export const readinessJourneyPoints = [
  {
    eyebrow: "Assess",
    title: "Baseline in one session",
    description: "Live scan, Mosca HNDL, CycloneDX CBOM, and signed PDF.",
  },
  {
    eyebrow: "Monitor",
    title: "Catch drift early",
    description: "Scheduled re-scans, diff alerts, and a remediation board.",
  },
  {
    eyebrow: "Convert",
    title: "Prove the fix",
    description: "Prioritized playbooks, re-scan verification, and auditor packs.",
  },
] as const;

export const readinessUseCases = [
  {
    eyebrow: "Banking",
    title: "TLS inventory",
    outcome: "NSM-10 and PCI-DSS mapping for external-facing crypto.",
    measurement: `${hndl.label} exposure · CBOM export · verify link`,
    demoHref: "/assess?scenario=bank-tls-inventory&autorun=1",
  },
  {
    eyebrow: "Gov contractor",
    title: "CMMC crypto controls",
    outcome: "CNSA 2.0 deadline tiers mapped to your TLS footprint.",
    measurement: "Control gaps · remediation backlog · signed report",
    demoHref: "/assess?scenario=gov-contractor-cmmc&autorun=1",
  },
  {
    eyebrow: "Healthcare",
    title: "HNDL exposure",
    outcome: "HIPAA-sensitive data paths with NIST IR 8547 alignment.",
    measurement: "Mosca timeline · priority queue · audit pack",
    demoHref: "/assess?scenario=healthcare-insurer-hndl&autorun=1",
  },
] as const;
