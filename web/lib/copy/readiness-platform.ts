export const platformPageCopy = {
  metadata: {
    title: "Platform",
    description:
      "Assess quantum-vulnerable cryptography, monitor crypto drift, and convert your stack with signed evidence.",
  },
  hero: {
    eyebrow: "Cryptographic posture management",
    title: "Assess. Monitor. Convert.",
    description:
      "Cryptographic visibility from first inventory to ongoing drift monitoring — CycloneDX CBOM, Mosca HNDL scoring, and remediation proof your auditors can verify.",
    actions: [
      { href: "/assess", label: "Run Q-Day scan" },
      { href: "/assess", label: "Explore Assess", variant: "secondary" as const },
    ],
  },
  journey: {
    eyebrow: "Journey",
    title: "Three tiers. One system of record.",
    description:
      "Each tier builds on the last — baseline inventory, continuous monitoring, and program delivery with signed evidence.",
  },
  tiers: [
    {
      eyebrow: "Assess",
      title: "Q-Day Assessment",
      description:
        "One-time domain scan, Mosca HNDL risk, CycloneDX CBOM, executive PDF, and verify link.",
      href: "/assess",
      cta: "Explore Assess →",
    },
    {
      eyebrow: "Monitor",
      title: "Q-Day Monitor",
      description:
        "Scheduled re-scans, crypto diff alerts, remediation board, and standards tracking.",
      href: "/monitor",
      cta: "Explore Monitor →",
    },
    {
      eyebrow: "Convert",
      title: "Q-Day Convert",
      description:
        "Prioritized playbooks, workshop cadence, partner orchestration, and re-scan verification.",
      href: "/convert",
      cta: "Explore Convert →",
    },
  ],
  proof: {
    eyebrow: "Evidence",
    title: "Signed reports. Independent verification.",
    description:
      "Every assessment exports a signed PDF and verify link. Auditors check signatures without trusting Qtangl alone.",
    actions: [
      { href: "/verify", label: "Verify a report" },
      { href: "/trust", label: "Trust center", variant: "secondary" as const },
    ],
  },
  optimize: {
    eyebrow: "Also from Qtangl",
    title: "Hybrid optimization for operations teams",
    description:
      "Hospital re-staffing, airline crew recovery, and EV fleet routing — a separate expansion motion after readiness.",
    href: "/platform/optimize",
    cta: "Explore optimization demos →",
  },
  maturity: {
    eyebrow: "Maturity model",
    title: "Where are you on the journey?",
    description: "Stages 0–6 from unaware to optimizing — always propose the next stage plus one.",
    href: "/journey",
    cta: "Explore customer journey →",
  },
  whyQtangl: {
    eyebrow: "Why Qtangl",
    title: "Built for security teams, not quantum researchers",
    description:
      "Consulting firms sell decks. Scanner vendors sell point-in-time PDFs. Qtangl sells continuous evidence.",
    compareHref: "/compare",
    compareLabel: "See how we compare to other PQC vendors →",
  },
} as const;
