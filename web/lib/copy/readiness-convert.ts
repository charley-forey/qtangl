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
      "Move from inventory to migration program — prioritized playbooks and re-scan verification in the product; workshops and partner orchestration via Qtangl services (roadmap for self-serve partner portal).",
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
        description: "Executive, engineering, and GRC sessions — delivered as a services add-on, not in-product automation.",
      },
      {
        title: "Partner introductions",
        description: "HSM, PKI, and SI partner referrals coordinated by Qtangl CS; partner portal on the roadmap.",
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
