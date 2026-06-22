export type PricingTier = {
  name: string;
  stage: string;
  price: string;
  description: string;
  highlights: readonly string[];
  cta: { label: string; href: string };
  featured?: boolean;
  liveToday?: readonly string[];
  image?: string;
  imageAlt?: string;
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
    compareNote:
      "Evaluating alternatives? See transparent mid-market packaging in our vendor comparison.",
    compareHref: "/compare",
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
      image: "/marketing/pricing-assess.webp",
      imageAlt: "Black and white illustration of a baseline scan snapshot with report document.",
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
      liveToday: ["Schedules + worker", "Webhook v2 + DLQ", "Code scan CI (beta flag)", "Host sensor fleet (beta flag)"],
      image: "/marketing/pricing-monitor.webp",
      imageAlt: "Black and white trend line rising over repeated scan data points.",
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
      image: "/marketing/pricing-convert.webp",
      imageAlt: "Black and white backlog shrinking toward verified completion.",
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
      liveToday: [
        "Portfolio command center",
        "Full discovery depth (host + code + binary)",
        "CMDB coverage widget + mTLS sensor",
        "Audit log API",
      ],
      image: "/marketing/pricing-enterprise.webp",
      imageAlt: "Black and white multi-domain constellation with compliance shield overlay.",
    },
  ] satisfies PricingTier[],
  footnote:
    "Enterprise and MSSP packages include portfolio command center, discovery depth, and custom SLA options.",
  roiLink: { label: "Estimate ROI with our calculator →", href: "/resources/roi" },
  faqs: [
    {
      question: "Is Qtangl a formal audit or attestation?",
      answer:
        "No. Qtangl provides cryptographic inventory, drift monitoring, and signed evidence exports — an inventory aid your auditors can verify, not a compliance attestation.",
    },
    {
      question: "Which tier should we start with?",
      answer:
        "Most teams start with Q-Day Assessment (Assess) for a baseline inventory and signed report, then add Monitor for scheduled re-scans and drift alerts.",
    },
    {
      question: "Do you support CMMC, HIPAA, and banking scenarios?",
      answer:
        "Yes. Assessments map findings to NSM-10, CNSA 2.0, NIST IR 8547, CMMC, PCI-DSS 4.0, and sector playbooks at /solutions/*.",
    },
  ],
} as const;
