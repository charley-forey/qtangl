import { readinessLexicon } from "@/lib/copy/readiness";

const { evidence, exposure, convert } = readinessLexicon;

export const aboutReadinessContent = {
  eyebrow: "About Qtangl",
  title: "Cryptographic posture management for the Q-Day migration.",
  intro:
    "Qtangl is a cryptographic posture management (CPM) platform for regulated teams and federal-adjacent operators — discover quantum-vulnerable cryptography, monitor drift until Q-Day, and prove remediation with signed reports auditors check independently.",
  missionEyebrow: "Mission",
  missionTitle: "Assess. Monitor. Convert.",
  principles: [
    {
      title: evidence.label,
      description:
        "Signed PDFs and verify links on every assessment — auditors don't have to trust us alone.",
    },
    {
      title: exposure.label,
      description:
        "Live TLS scans, Mosca HNDL scoring, and CycloneDX CBOM exports — not spreadsheet snapshots.",
    },
    {
      title: convert.label,
      description:
        "Prioritized remediation playbooks, re-scan verification, and program delivery for migration teams.",
    },
  ],
  cards: [
    {
      eyebrow: "Readiness platform",
      description:
        "Assess → Monitor → Convert — one system of record from first inventory to proof of fix.",
    },
    {
      eyebrow: "Honest scope",
      description:
        "Inventory aid, not formal audit. Quantum-vulnerable ≠ broken today — we quantify exposure honestly.",
    },
    {
      eyebrow: "Expansion path",
      description:
        "Hybrid optimization for hospital, airline, and fleet workflows — after defense is proven.",
      href: "/platform/optimize",
    },
  ],
  optimizeLink: {
    label: "Explore hybrid optimization →",
    href: "/platform/optimize",
  },
} as const;
