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
        image: "/marketing/convert-playbooks.webp",
        imageAlt:
          "Black and white ranked list with exposure bars and algorithm icons.",
      },
      {
        title: "Workshop cadence",
        description: "Executive, engineering, and GRC sessions — delivered as a services add-on, not in-product automation.",
        image: "/marketing/convert-workshops.webp",
        imageAlt:
          "Black and white conference table with stakeholder silhouettes and shared dashboard.",
      },
      {
        title: "Partner introductions",
        description: "HSM, PKI, and SI partner referrals coordinated by Qtangl CS; partner portal on the roadmap.",
        image: "/marketing/convert-partners.webp",
        imageAlt:
          "Black and white hub-and-spoke diagram connecting an organization to partner nodes.",
      },
      {
        title: "Re-scan verification",
        description: "Post-remediation scans with signed proof that weak crypto is gone.",
        image: "/marketing/convert-rescan-verify.webp",
        imageAlt:
          "Black and white two-scan comparison with checkmark on resolved finding.",
      },
    ],
  },
  evidence: {
    eyebrow: "Evidence",
    title: "Auditor packs your GRC team can defend",
    description:
      "Signed before/after reports, CBOM diffs, and verify links — not slide decks.",
    image: "/qtangl-hndl-before-after-migration.svg",
    imageAlt:
      "Before and after PQC migration path: inventory, hybrid TLS pilot, and signed verify proof.",
    actions: [
      { href: "/verify", label: "Verify a report" },
      { href: "/trust", label: "Trust center", variant: "secondary" as const },
    ],
  },
  cta: {
    title: "Ready to convert?",
    description: "Convert builds on Monitor. Start with an assessment if you haven't baselined yet.",
    primary: { label: "Request pilot access", href: "/access" },
    secondary: { label: "Run assessment first", href: "/assess" },
  },
} as const;
