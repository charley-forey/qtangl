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
      image: "/marketing/platform-tier-assess.webp",
      imageAlt:
        "Black and white illustration of a radar grid scanning TLS endpoints on a domain map.",
    },
    {
      eyebrow: "Monitor",
      title: "Q-Day Monitor",
      description:
        "Scheduled re-scans, crypto diff alerts, remediation board, and standards tracking.",
      href: "/monitor",
      cta: "Explore Monitor →",
      image: "/marketing/platform-tier-monitor.webp",
      imageAlt:
        "Black and white illustration of a calendar timeline with recurring scan marks and diff alert flags.",
    },
    {
      eyebrow: "Convert",
      title: "Q-Day Convert",
      description:
        "Prioritized playbooks, workshop cadence, partner orchestration, and re-scan verification.",
      href: "/convert",
      cta: "Explore Convert →",
      image: "/marketing/platform-tier-convert.webp",
      imageAlt:
        "Black and white illustration of a three-step ladder from inventory to backlog to verify seal.",
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
  cta: {
    eyebrow: "Get started",
    title: "See your crypto posture in one scan",
    description:
      "Point Qtangl at a domain. Get Mosca HNDL scoring, a CycloneDX CBOM, and a signed PDF your GRC team can verify — then grow into Monitor when you're ready for continuous drift tracking.",
    primaryCta: { label: "Run Q-Day scan", href: "/assess" },
    secondaryCta: { label: "Request pilot access", href: "/access" },
    docsLink: { label: "Compare Qtangl to other PQC vendors →", href: "/compare" },
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
