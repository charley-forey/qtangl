import type { MarketingCtaPanel } from "@/lib/copy/readiness-home";

export const convertValueProofItems = [
  {
    title: "Verify-fix loop",
    description:
      "Attach re-scan proof to each remediation item. Export live workflowStatus in PDF and board packs.",
    icon: "evidence" as const,
  },
  {
    title: "Auditor-ready packs",
    description:
      "Signed before/after reports, CBOM diffs, and public verify links — not slide decks.",
    icon: "drift" as const,
  },
  {
    title: "Deadline-ranked backlog",
    description:
      "Playbooks prioritized by Mosca exposure and mandate pressure — NSM-10, CNSA 2.0, NIST IR 8547.",
    icon: "velocity" as const,
  },
  {
    title: "Honest scope",
    description:
      "Inventory aid and migration program tracking — not formal attestation or certification.",
    icon: "scope" as const,
  },
] as const;

export const convertFaqItems = [
  {
    question: "What is included in Convert vs Monitor?",
    answer:
      "Monitor delivers scheduled re-scans, drift alerts, and a remediation board. Convert adds prioritized playbooks, verify-fix loops, program velocity reporting, and auditor packs — plus optional services-led workshops and partner introductions.",
  },
  {
    question: "Is Convert self-serve or services-led?",
    answer:
      "The remediation board, verify-fix API, and Jira integration are in the product today. Workshop cadence and partner orchestration are delivered with Convert engagements — partner portal self-serve is on the roadmap.",
  },
  {
    question: "Does verify-fix prove complete estate coverage?",
    answer:
      "No. Verification confirms report integrity, signing, and that specific remediated findings cleared on re-scan. It does not attest to full estate coverage or formal compliance.",
  },
  {
    question: "Do I need Monitor before Convert?",
    answer:
      "Convert builds on Monitor. Most teams baseline with Assess, enable Monitor for drift detection, then upgrade to Convert when migration sprints begin.",
  },
  {
    question: "How does Jira integration work?",
    answer:
      "When configured, remediation items push to Jira with playbook context. Status syncs back to the board when your team updates tickets.",
  },
  {
    question: "What evidence do auditors receive?",
    answer:
      "Signed PDF reports, CycloneDX CBOM exports, scan diff summaries, and public verify links. GRC teams share verify URLs — auditors check signatures independently.",
  },
  {
    question: "How are playbooks prioritized?",
    answer:
      "By algorithm exposure, Mosca HNDL score, asset criticality, and framework deadline pressure. Wave 1 targets edge TLS fast wins; later waves cover JWKS, HSM, and deep app crypto.",
  },
  {
    question: "What does Convert cost?",
    answer:
      "Convert is typically +$50K–$100K/yr on top of Monitor. See /pricing for package details or /access for a scoped pilot quote.",
  },
] as const;

export const convertHowItWorks = [
  { step: 1, title: "Prioritize", detail: "Rank backlog by exposure, Mosca score, and mandate deadlines." },
  { step: 2, title: "Assign", detail: "Owners, target dates, and migration waves on the program board." },
  { step: 3, title: "Re-scan", detail: "Verify-fix attaches post-remediation scan proof to each item." },
  { step: 4, title: "Export proof", detail: "Auditor packs with signed before/after evidence and verify links." },
] as const;

export const convertPersonaCopy = [
  {
    id: "ciso" as const,
    title: "CISO / VP Security",
    trigger: "Board asks: how much RSA/ECDSA before 2030?",
    outcomes: [
      "Program velocity and completion metrics for QBRs",
      "Peer benchmark context (opt-in on dashboard)",
      "Board-ready signed evidence exports",
    ],
    cta: { label: "Request executive briefing", href: "/access" },
    anchor: "#convert-program",
  },
  {
    id: "grc" as const,
    title: "GRC / Compliance lead",
    trigger: "CMMC, PCI-DSS 4.0, or HIPAA audit cycle",
    outcomes: [
      "Framework-mapped auditor packs",
      "Before/after scan diffs with verify URLs",
      "Honest scope — inventory aid, not attestation",
    ],
    cta: { label: "Verify a sample report", href: "/verify?token=sample-token" },
    anchor: "#convert-evidence",
  },
  {
    id: "engineering" as const,
    title: "VP Engineering",
    trigger: "Assigned to execute PQC migration",
    outcomes: [
      "Kanban board with migration waves",
      "Verify-fix API and Jira when configured",
      "Playbook steps per finding type",
    ],
    cta: { label: "Open tenant dashboard", href: "/dashboard" },
    anchor: "#convert-program",
  },
] as const;

export const convertServicesMatrix = {
  eyebrow: "Product vs services",
  title: "What's in the dashboard vs what's delivered with Convert engagements",
  columns: ["In product today", "Services / roadmap"],
  rows: [
    { feature: "Prioritized playbooks", product: true, services: false },
    { feature: "Verify-fix + re-scan proof", product: true, services: false },
    { feature: "Jira push + status sync", product: true, services: false },
    { feature: "Executive workshop cadence", product: false, services: true },
    { feature: "Partner introductions (HSM, PKI, SI)", product: false, services: true },
    { feature: "Self-serve partner portal", product: false, services: "roadmap" as const },
  ],
} as const;

export const convertProcurementLinks = [
  { label: "Trust center", href: "/trust", description: "Signing keys, transparency log, data handling" },
  { label: "Security disclosure", href: "https://github.com/qtangl/qtangl/blob/main/.github/SECURITY.md", description: "Responsible disclosure policy" },
  { label: "Method honesty", href: "/assess/methodology", description: "What we measure and what we do not claim" },
] as const;

export const convertRelatedPosts = [
  {
    href: "/blog/convert-verify-workflow",
    title: "Closing the loop: verify-fix in Convert",
    excerpt: "Attach re-scan proof to remediation items and export live workflowStatus.",
  },
  {
    href: "/blog/remediation-backlog-deadline-prioritization",
    title: "Remediation backlog deadline prioritization",
    excerpt: "Rank playbooks by mandate pressure and Mosca exposure — not spreadsheet guesswork.",
  },
] as const;

export const convertCtaPanel: MarketingCtaPanel = {
  eyebrow: "Convert tier",
  title: "Ready to prove the fix?",
  description:
    "Convert builds on Monitor. Start with an assessment if you haven't baselined yet — or request a pilot for your migration program.",
  primaryCta: { label: "Request pilot access", href: "/access" },
  secondaryCta: { label: "Run assessment first", href: "/assess" },
  docsLink: { label: "Convert guide →", href: "/docs/guides/convert" },
};

export const convertApiPreview = {
  eyebrow: "Developer API",
  title: "Verify-fix and what-if from your CI pipeline",
  description:
    "Simulate projected readiness after remediation, queue verify-fix jobs, and export signed evidence programmatically.",
  request: {
    method: "POST",
    path: "/tenant/remediation/what-if",
    body: {
      scanId: "scan_2026_04_08_bank",
      remediationIds: ["rem_001", "rem_002"],
    },
  },
  response: {
    status: "success",
    projection: {
      currentScore: 61.8,
      projectedScore: 74.2,
      delta: 12.4,
      itemsSelected: 2,
    },
  },
  docsHref: "/docs/guides/convert",
};

export const convertHonestyPanel = {
  productToday: [
    "Remediation board with owners + target dates",
    "Verify-fix API across scans",
    "Jira push + status sync when configured",
  ],
  servicesRoadmap: [
    "Executive + engineering workshop cadence",
    "HSM, PKI, and SI partner introductions",
    "Self-serve partner portal (roadmap)",
  ],
} as const;

export const convertSectionNav = [
  { id: "convert-program", label: "Program" },
  { id: "convert-evidence", label: "Evidence" },
  { id: "convert-why-now", label: "Why now" },
  { id: "convert-personas", label: "Personas" },
  { id: "convert-enterprise", label: "Enterprise" },
  { id: "convert-faq", label: "FAQ" },
] as const;

export const convertPageCopy = {
  metadata: {
    title: "PQC Migration Program",
    description:
      "Prioritized remediation playbooks, re-scan verification, and auditor packs — with optional services-led workshops and partner introductions.",
  },
  hero: {
    eyebrow: "Convert",
    title: "Prove the fix with signed evidence",
    description:
      "Migration program on top of Monitor — prioritized playbooks, verify-fix loops, and auditor packs in the product. Workshops and partner orchestration via Qtangl services.",
    actions: [
      { href: "/access", label: "Talk to sales" },
      { href: "/pricing", label: "See pricing", variant: "secondary" as const },
    ],
    kpis: [
      { label: "Readiness score", value: 61.8 },
      { label: "Backlog items", value: 4 },
      { label: "Projected delta", value: "+12.4" },
    ],
    screenshot: "/marketing/monitor-remediation-board.webp",
    screenshotAlt: "Remediation board with owners, waves, and verify-fix status columns.",
    liveBadge: "Live in dashboard today",
  },
  features: {
    eyebrow: "Program delivery",
    title: "Convert tier capabilities",
    items: [
      {
        title: "Prioritized playbooks",
        description: "Algorithm-specific remediation paths ranked by exposure and deadline pressure.",
        image: "/marketing/convert-playbooks.webp",
        imageAlt: "Ranked list with exposure bars and algorithm icons.",
        stat: "Wave-ranked backlog",
      },
      {
        title: "Workshop cadence",
        description: "Executive, engineering, and GRC sessions — delivered as a services add-on.",
        image: "/marketing/convert-workshops.webp",
        imageAlt: "Conference table with stakeholder silhouettes and shared dashboard.",
        stat: "Services add-on",
      },
      {
        title: "Partner introductions",
        description: "HSM, PKI, and SI partner referrals coordinated by Qtangl CS.",
        image: "/marketing/convert-partners.webp",
        imageAlt: "Hub-and-spoke diagram connecting organization to partner nodes.",
        stat: "CS-coordinated",
      },
      {
        title: "Re-scan verification",
        description: "Post-remediation scans with signed proof that weak crypto is gone.",
        image: "/marketing/convert-rescan-verify.webp",
        imageAlt: "Two-scan comparison with checkmark on resolved finding.",
        stat: "Verify-fix loop",
      },
    ],
  },
  evidence: {
    eyebrow: "Evidence",
    title: "Auditor packs your GRC team can defend",
    description:
      "Signed before/after reports, CBOM diffs, and verify links — not slide decks. Verification confirms report integrity and signing — not complete estate coverage.",
    actions: [
      { href: "/verify", label: "Verify a report" },
      { href: "/trust", label: "Trust center", variant: "secondary" as const },
    ],
  },
  hndl: {
    eyebrow: "Why Convert now",
    title: "Playbooks ranked by Mosca exposure + mandate deadline",
    description:
      "Harvest-now-decrypt-later is a planning problem — not a broken-crypto alarm. Convert connects HNDL urgency to prioritized migration waves without Q-Day prediction.",
  },
  personas: {
    eyebrow: "Who it's for",
    title: "Built for security, GRC, and engineering leaders",
  },
  enterprise: {
    eyebrow: "Enterprise",
    title: "Procurement-ready evidence and honest scope",
    procurementTitle: "What your InfoSec team asks",
  },
  cta: convertCtaPanel,
} as const;
