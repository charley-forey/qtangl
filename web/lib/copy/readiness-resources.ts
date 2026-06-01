export type FaqItem = {
  question: string;
  answer: string;
  category: "timing" | "build" | "competition" | "trust" | "scope" | "price";
};

export const resourcesPageCopy = {
  metadata: {
    title: "Resources",
    description:
      "ROI calculator, FAQ, and buyer resources for post-quantum readiness programs.",
  },
  hero: {
    eyebrow: "Resources",
    title: "Tools for your Q-Day program",
    description:
      "Estimate value, answer common objections, and map your maturity stage — then run a live scan.",
  },
  cards: [
    {
      title: "Free mini-assessment",
      description: "Instant readiness score and top five findings — work email required.",
      href: "/assess/mini",
    },
    {
      title: "Executive briefing",
      description: "Board-ready Mosca framing, deadlines, and Qtangl deliverables — gated download.",
      href: "/q-day/briefing",
    },
    {
      title: "ROI calculator",
      description: "Compare status-quo manual inventory vs Qtangl Monitor annual cost.",
      href: "/resources/roi",
    },
    {
      title: "FAQ",
      description: "Honest answers on timing, accuracy, competition, and procurement.",
      href: "/resources/faq",
    },
    {
      title: "Customer journey",
      description: "Maturity model from first inventory to proof of fix.",
      href: "/journey",
    },
    {
      title: "Q-Day hub",
      description: "HNDL, Mosca, deadlines, CBOM, and framework guides.",
      href: "/q-day",
    },
  ],
} as const;

export const roiPageCopy = {
  metadata: {
    title: "ROI Calculator",
    description:
      "Estimate annual cost of manual crypto inventory vs Qtangl Monitor — directional, with your inputs.",
  },
  hero: {
    eyebrow: "ROI calculator",
    title: "Status quo vs Qtangl Monitor",
    description:
      "Directional estimate only — use your team's loaded hourly cost and refresh frequency. Not breach-cost fear-math.",
  },
  honesty:
    "Present as an estimate with your own inputs. Qtangl Monitor mid-tier is modeled at $100K/yr; Assessment land motion at $35K one-time.",
  cta: {
    primary: { label: "Request pilot access", href: "/access?interest=Q-Day%20Monitor%20(annual)" },
    secondary: { label: "Run Q-Day scan", href: "/demo/pqc" },
  },
} as const;

export const faqPageCopy = {
  metadata: {
    title: "FAQ",
    description:
      "Common questions about Qtangl post-quantum readiness — timing, accuracy, competition, and procurement.",
  },
  hero: {
    eyebrow: "FAQ",
    title: "Honest answers for security buyers",
    description:
      "We lead with evidence, not fear. Inventory aid, not formal audit — and that honesty is why auditors trust the verify link.",
  },
} as const;

export const readinessFaq: readonly FaqItem[] = [
  {
    category: "timing",
    question: "Quantum is years away — why act now?",
    answer:
      "Harvest-now-decrypt-later means data encrypted today can be stored and decrypted after Q-Day. Mosca inequality (X + Y > Z) quantifies when that exposure requires action now — especially for banking and healthcare data with decades of shelf-life.",
  },
  {
    category: "timing",
    question: "We'll deal with it when standards settle.",
    answer:
      "FIPS 203/204/205 finalized in 2024. NSM-10, CMMC, and PCI-DSS 4.0 set migration clocks now. A baseline inventory is low-cost insurance while you plan the multi-year program.",
  },
  {
    category: "build",
    question: "We can script our own TLS scans.",
    answer:
      "Scripts find endpoints. Qtangl adds Mosca HNDL scoring, framework mapping, drift diffs, signed PDFs, and independent verify links — the system of record auditors expect between audit cycles.",
  },
  {
    category: "build",
    question: "Isn't this just open-source liboqs?",
    answer:
      "OQS provides primitives. Qtangl provides the assembled program: orchestration, CBOM export, compliance crosswalk, drift monitoring, and signed evidence. We build on OQS for handshake proof — we don't replace it.",
  },
  {
    category: "competition",
    question: "We're evaluating SandboxAQ / Big 4 consultants.",
    answer:
      "Strong options for enterprise programs. If you need a fast, verifiable baseline this quarter at mid-market price — with continuous drift — that's Qtangl. We partner with consultants for migration labor.",
  },
  {
    category: "trust",
    question: "Are you secure enough to hold our crypto inventory?",
    answer:
      "We sell to security teams and hold ourselves to the same standard. PQC scans are TLS/crypto inventory only — no application data. See our trust center for SOC 2 scope and self-scan posture.",
  },
  {
    category: "trust",
    question: "What if Qtangl disappears?",
    answer:
      "Your CBOM exports in open CycloneDX format. Inventory data is portable — no proprietary lock-in on the artifact itself.",
  },
  {
    category: "scope",
    question: "How accurate is the scan?",
    answer:
      "Transparent scope: inventory aid, not formal audit. Coverage confidence is shown on every report. You review findings, set remediation status, and re-scan to verify fixes.",
  },
  {
    category: "scope",
    question: "Will it find internal certs, not just external TLS?",
    answer:
      "External scanning plus PEM/K8s bundle upload and cloud inventory import (ACM, Key Vault) for internal-facing crypto.",
  },
  {
    category: "price",
    question: "Monitor seems expensive vs a one-time assessment.",
    answer:
      "Compare to quarterly manual inventory plus audit prep — often $150K+/yr in loaded labor and consulting amortization. Monitor is continuous drift coverage with signed evidence each cycle.",
  },
  {
    category: "price",
    question: "No budget this year.",
    answer:
      "Start with a one-time Assessment to build the internal case, or run the free demo scan to quantify exposure before procurement.",
  },
] as const;

export const faqCategories: Record<FaqItem["category"], string> = {
  timing: "Timing & urgency",
  build: "Build vs buy",
  competition: "Competition",
  trust: "Trust & security",
  scope: "Scope & accuracy",
  price: "Price & procurement",
};
