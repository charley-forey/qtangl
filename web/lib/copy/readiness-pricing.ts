export type PricingTier = {
  name: string;
  stage: string;
  price: string;
  description: string;
  highlights: readonly string[];
  cta: { label: string; href: string };
  featured?: boolean;
  liveToday?: readonly string[];
};

export const pricingPageCopy = {
  metadata: {
    title: "Pricing",
    description:
      "Q-Day Assessment, Monitor, Convert, and Enterprise packages for post-quantum readiness programs.",
  },
  hero: {
    eyebrow: "Pricing",
    title: "Packages for every stage of Q-Day readiness",
    description:
      "Assessment lands the baseline. Monitor builds recurring value. Convert delivers the migration program.",
  },
  tiers: [
    {
      name: "Q-Day Assessment",
      stage: "Assess",
      price: "$25K–$50K",
      description: "One-time scan, report, and executive workshop.",
      highlights: [
        "Live domain scan + Mosca HNDL",
        "CycloneDX CBOM export",
        "Signed executive PDF + verify link",
        "Board-ready workshop",
      ],
      cta: { label: "Free mini-assessment", href: "/assess/mini" },
      liveToday: ["Live TLS scan", "CBOM export", "Signed PDF + /verify"],
    },
    {
      name: "Q-Day Monitor",
      stage: "Monitor",
      price: "$75K–$150K/yr",
      description: "Scheduled scans, diff alerts, and remediation board.",
      highlights: [
        "Everything in Assessment",
        "Scheduled re-scans + diff alerts",
        "Remediation board + owner tracking",
        "Standards deadline mapping",
      ],
      cta: { label: "Request pilot", href: "/access" },
      featured: true,
      liveToday: ["Schedules + worker", "Webhook v2 + DLQ", "Dashboard alert thresholds"],
    },
    {
      name: "Q-Day Convert",
      stage: "Convert",
      price: "+$50K–$100K/yr",
      description: "Migration program on top of Monitor.",
      highlights: [
        "Everything in Monitor",
        "Prioritized remediation playbooks",
        "Workshop cadence + partner orchestration",
        "Re-scan verification + auditor packs",
      ],
      cta: { label: "Talk to sales", href: "/access" },
      liveToday: ["Remediation board", "Verify-fix API", "Jira push + status pull"],
    },
    {
      name: "Q-Day Enterprise",
      stage: "Enterprise",
      price: "$150K–$250K/yr",
      description: "Multi-domain, CMMC/HIPAA packs, dedicated support.",
      highlights: [
        "Multi-domain portfolio",
        "CMMC / HIPAA compliance packs",
        "Dedicated customer success",
        "Custom SLA + MSSP options",
      ],
      cta: { label: "Request enterprise", href: "/access" },
      liveToday: ["Portfolio command center", "Audit log API", "Partner child tenants (beta)"],
    },
  ] satisfies PricingTier[],
  footnote:
    "Optimize Pilot ($50K–$200K) and API Developer tiers ($500–$5K/mo) available as separate expansion motions.",
  roiLink: { label: "Estimate ROI with our calculator →", href: "/resources/roi" },
  optimizeLink: { label: "Explore optimization pricing →", href: "/platform/optimize" },
} as const;
