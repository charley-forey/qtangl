import { readinessLexicon } from "@/lib/copy/readiness";

const { evidence, exposure, hndl } = readinessLexicon;

export const readinessHero = {
  eyebrow: "Cryptographic posture management",
  title: "Assess. Monitor. Convert.",
  subhead:
    "Find quantum-vulnerable cryptography in your authorized scope, prioritize migration work, and show what changed with signed evidence reviewers can verify independently.",
  primaryCta: { label: "Run Q-Day scan", href: "/assess" },
  secondaryCta: { label: "Verify a report", href: "/verify" },
} as const;

export const readinessHeadlineDemo = {
  eyebrow: "Sample assessment",
  title: "From crypto inventory to a clear next step",
  description:
    "Explore illustrative findings, a CycloneDX CBOM, and signed reports. These sample figures do not describe your estate. Qtangl is an inventory aid, not a formal audit.",
  stats: [
    { label: "Example vulnerable endpoints", value: "47" },
    { label: "Example readiness score", value: "62 / 100" },
    { label: "Data source", value: "Sample" },
  ],
  image: "/marketing/docs-assess-workflow.webp",
  imageAlt:
    "Black and white workflow diagram from domain scan through CBOM export to signed verify link.",
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
    icon: "assess" as const,
    image: "/marketing/platform-tier-assess.webp",
    imageAlt: "Black and white illustration of a radar grid scanning TLS endpoints.",
  },
  {
    eyebrow: "Monitor",
    title: "Catch drift early",
    description: "Scheduled re-scans, diff alerts, and a remediation board.",
    icon: "monitor" as const,
    image: "/marketing/platform-tier-monitor.webp",
    imageAlt: "Black and white illustration of scheduled scans with diff alert flags.",
  },
  {
    eyebrow: "Convert",
    title: "Prove the fix",
    description: "Prioritized playbooks, re-scan verification, and auditor packs.",
    icon: "convert" as const,
    image: "/marketing/platform-tier-convert.webp",
    imageAlt: "Black and white illustration of migration steps ending in a verify seal.",
  },
] as const;

export const readinessUseCases = [
  {
    eyebrow: "Banking",
    title: "TLS inventory",
    outcome: "NSM-10 and PCI-DSS mapping for external-facing crypto.",
    measurement: `${hndl.label} exposure · CBOM export · verify link`,
    demoHref: "/assess?scenario=bank-tls-inventory&autorun=1",
    image: "/marketing/assess-live-scan.webp",
    imageAlt: "Black and white diagram of TLS handshake inventory across network endpoints.",
  },
  {
    eyebrow: "Gov contractor",
    title: "CMMC crypto controls",
    outcome: "CNSA 2.0 deadline tiers mapped to your TLS footprint.",
    measurement: "Control gaps · remediation backlog · signed report",
    demoHref: "/assess?scenario=gov-contractor-cmmc&autorun=1",
    image: "/marketing/assess-signed-pdf.webp",
    imageAlt: "Black and white illustration of a signed report with seal and verify link.",
  },
  {
    eyebrow: "Healthcare",
    title: "HNDL exposure",
    outcome: "HIPAA-sensitive data paths with NIST IR 8547 alignment.",
    measurement: "Mosca timeline · priority queue · audit pack",
    demoHref: "/assess?scenario=healthcare-insurer-hndl&autorun=1",
    image: "/marketing/assess-hndl-timeline.webp",
    imageAlt: "Black and white timeline showing harvest-now-decrypt-later exposure horizon.",
  },
] as const;
