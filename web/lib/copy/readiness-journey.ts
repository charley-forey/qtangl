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
    title: "PQC Readiness Journey",
    description:
      "See where your organization sits on the path to post-quantum readiness — from first crypto inventory to signed, auditor-ready proof — and what to do next at each stage.",
  },
  hero: {
    eyebrow: "Readiness roadmap",
    title: "Find out where you are — and what to do next",
    description:
      "Every organization moves through the same stages on the way to post-quantum readiness: knowing what cryptography you run, fixing what's actually at risk, and proving it. Pick a stage below to see what's typical there and the next concrete step.",
  },
  insight: {
    eyebrow: "How to use this model",
    title: "Don't skip stages",
    description:
      "Buying enterprise-grade verification tooling before you have a cryptographic inventory is like installing a vault door before you know which rooms need one. Start with Assess to see what you actually run, then add Monitor and Convert once you know where the risk is. The fastest path is usually the next stage up — not the top of the model.",
  },
  personas: [
    {
      title: "CISO / VP Security",
      situation:
        "Your board or leadership are asking how much of your traffic still relies on RSA or ECDSA before 2030.",
      nextStep: "Run a scan and bring a real inventory to that conversation.",
      href: "/assess",
      cta: "Start with Assess →",
    },
    {
      title: "Compliance / GRC lead",
      situation:
        "You're preparing for a CMMC, PCI-DSS 4.0, or HIPAA audit and need evidence, not a spreadsheet.",
      nextStep: "Generate a signed compliance pack auditors can verify independently.",
      href: "/trust",
      cta: "See compliance packs →",
    },
    {
      title: "VP Engineering",
      situation:
        "You've been handed the PQC migration and need to know what to fix first — and prove it stuck.",
      nextStep: "Turn your CBOM into a prioritized remediation board, then re-scan to confirm the fix held.",
      href: "/convert",
      cta: "Explore Convert →",
    },
  ],
  faqs: [
    {
      question: "How long does it take to move from Stage 0 to Stage 3?",
      answer:
        "Most teams complete their first inventory (Stage 1) within a day of running a scan. Prioritizing the backlog and scheduling re-scans (Stages 2-3) typically takes two to six weeks, depending on how distributed your infrastructure is.",
    },
    {
      question: "Do I need Monitor and Convert right away?",
      answer:
        "No — start with Assess. Monitor and Convert matter once you have a baseline and need to catch drift or prove remediation, which is usually a few weeks in, not day one.",
    },
    {
      question: "What if I don't know my crypto inventory at all?",
      answer:
        "That's Stage 0, and it's the normal starting point. Run a free mini-assessment or a full scan — you don't need existing documentation to begin.",
    },
    {
      question: "What actually counts as \"verified\" readiness?",
      answer:
        "Stage 6 means you have portfolio-wide evidence, a transparency log, and auditor-ready packs — not just that migrations happened, but that you can prove it to a third party.",
    },
  ],
} as const;
