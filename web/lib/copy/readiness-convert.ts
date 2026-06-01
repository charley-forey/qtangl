export const convertPageCopy = {
  metadata: {
    title: "PQC Migration Program",
    description:
      "Prioritized remediation playbooks, workshop cadence, partner orchestration, and re-scan verification for Q-Day conversion.",
  },
  hero: {
    eyebrow: "Convert",
    title: "Prove the fix with signed evidence",
    description:
      "Move from inventory to migration program — prioritized playbooks, stakeholder workshops, and re-scan verification auditors trust.",
    actions: [
      { href: "/access", label: "Talk to sales" },
      { href: "/pricing", label: "See pricing", variant: "secondary" as const },
    ],
  },
  features: {
    eyebrow: "Program delivery",
    title: "Convert tier capabilities",
    items: [
      {
        title: "Prioritized playbooks",
        description: "Algorithm-specific remediation paths ranked by exposure and deadline pressure.",
      },
      {
        title: "Workshop cadence",
        description: "Executive, engineering, and GRC sessions aligned to your migration timeline.",
      },
      {
        title: "Partner orchestration",
        description: "HSM, PKI, and SI partners coordinated through Qtangl as system of record.",
      },
      {
        title: "Re-scan verification",
        description: "Post-remediation scans with signed proof that weak crypto is gone.",
      },
    ],
  },
  evidence: {
    eyebrow: "Evidence",
    title: "Auditor packs your GRC team can defend",
    description:
      "Signed before/after reports, CBOM diffs, and verify links — not slide decks.",
    actions: [
      { href: "/verify", label: "Verify a report" },
      { href: "/trust", label: "Trust center", variant: "secondary" as const },
    ],
  },
  cta: {
    title: "Ready to convert?",
    description: "Convert builds on Monitor. Start with an assessment if you haven't baselined yet.",
    primary: { label: "Request pilot access", href: "/access" },
    secondary: { label: "Run assessment first", href: "/demo/pqc" },
  },
} as const;
