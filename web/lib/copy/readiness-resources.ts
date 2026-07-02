export type FaqItem = {
  question: string;
  answer: string;
  category: "timing" | "build" | "competition" | "trust" | "scope" | "price" | "hndl";
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
      icon: "assess",
    },
    {
      title: "Executive briefing",
      description: "Board-ready Mosca framing, deadlines, and Qtangl deliverables — gated download.",
      href: "/q-day/briefing",
      icon: "briefing",
    },
    {
      title: "ROI calculator",
      description: "Compare status-quo manual inventory vs Qtangl Monitor annual cost.",
      href: "/resources/roi",
      icon: "roi",
    },
    {
      title: "Vendor comparison",
      description: "PQC readiness landscape — feature matrix, positioning map, and Qtangl vs each competitor.",
      href: "/compare",
      icon: "compare",
    },
    {
      title: "FAQ",
      description: "Honest answers on timing, accuracy, competition, and procurement.",
      href: "/resources/faq",
      icon: "faq",
    },
    {
      title: "Readiness Index",
      description: "K-anonymized industry benchmarks — compare your posture to anonymized cohorts.",
      href: "/resources/readiness-index",
      icon: "benchmark",
    },
    {
      title: "Customer journey",
      description: "Maturity model from first inventory to proof of fix.",
      href: "/journey",
      icon: "journey",
    },
    {
      title: "Q-Day hub",
      description: "HNDL, Mosca, deadlines, CBOM, and framework guides.",
      href: "/q-day",
      icon: "hub",
    },
    {
      title: "Quantum crypto learning guide",
      description: "Four-week video + reading curriculum with NIST bibliography — downloadable markdown.",
      href: "/learn/quantum-crypto",
      icon: "learn",
    },
    {
      title: "Learn: quantum crypto foundations",
      description: "Five-layer curriculum with embedded video companions and PQC library links.",
      href: "/learn/quantum-crypto",
      icon: "learn",
    },
    {
      title: "HNDL primer",
      description: "How ciphertext is copied today — collection vectors, Mosca calculator, and exposure estimator.",
      href: "/q-day/hndl",
      icon: "hndl",
    },
    {
      title: "How harvesting works",
      description: "Practitioner blog on breach exfiltration, backups, and TLS handshake capture.",
      href: "/blog/how-encrypted-data-is-harvested",
      icon: "article",
    },
    {
      title: "HNDL infographic",
      description: "One-page visual: collection vectors, Mosca inequality, and quarterly action plan.",
      href: "/downloads/hndl-infographic.png",
      icon: "infographic",
    },
    {
      title: "Board briefing",
      description: "Executive Mosca framing, deadlines, and Qtangl deliverables — gated download.",
      href: "/q-day/briefing",
      icon: "briefing",
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
    secondary: { label: "Run Q-Day scan", href: "/assess" },
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
      "Strong options for enterprise programs. If you need a fast, verifiable baseline this quarter at mid-market price — with continuous drift — that's Qtangl. See the full vendor comparison at /compare. We partner with consultants for migration labor.",
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
  {
    category: "hndl",
    question: "How is encrypted data harvested without breaking crypto?",
    answer:
      "Adversaries copy ciphertext via breach exfiltration, backups and archives, cloud misconfiguration, and bulk network collection. See the HNDL hub at /q-day/hndl for collection vectors and an interactive exposure estimator.",
  },
  {
    category: "hndl",
    question: "Does TLS 1.3 protect us from HNDL?",
    answer:
      "Forward secrecy limits passive decryption, but stored TLS handshakes with ECDH remain quantum-vulnerable. Long-retention backups and breach exfiltration are still primary HNDL paths.",
  },
  {
    category: "hndl",
    question: "Are our backups an HNDL risk?",
    answer:
      "Yes, when backups contain ciphertext wrapped in quantum-vulnerable public-key algorithms and must stay confidential for years. Backup exfiltration is a common ransomware path.",
  },
  {
    category: "hndl",
    question: "What data shelf-life should we use for Mosca?",
    answer:
      "Use your retention policy for the longest-lived data class: healthcare often 30–50 years, banking 7–25 years, government 15–50 years. The HNDL exposure estimator at /q-day/hndl pre-fills by vertical.",
  },
  {
    category: "hndl",
    question: "What does Qtangl do about HNDL?",
    answer:
      "Qtangl scores Mosca HNDL exposure per asset, maps to compliance frameworks, exports CycloneDX CBOM, and provides signed verify links. Inventory aid, not formal audit.",
  },
  {
    category: "hndl",
    question: "Can migration undo already-harvested ciphertext?",
    answer:
      "No. Migration protects new data and future sessions. Ciphertext copied before migration completes may still be decryptable after Q-Day if Mosca inequality held when it was captured.",
  },
] as const;

export const faqCategories: Record<FaqItem["category"], string> = {
  timing: "Timing & urgency",
  build: "Build vs buy",
  competition: "Competition",
  trust: "Trust & security",
  scope: "Scope & accuracy",
  price: "Price & procurement",
  hndl: "Harvest now, decrypt later",
};
