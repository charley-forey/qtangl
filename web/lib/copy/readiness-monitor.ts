export const monitorPageCopy = {
  metadata: {
    title: "Crypto Drift Monitoring",
    description:
      "Scheduled PQC re-scans, crypto diff alerts, remediation board, and standards tracking until Q-Day.",
  },
  hero: {
    eyebrow: "Monitor",
    title: "Catch crypto drift before auditors do",
    description:
      "Scheduled re-scans surface new weak algorithms, certificate changes, and TLS policy drift — with alerts your team can act on.",
    actions: [
      { href: "/access", label: "Request Monitor pilot" },
      { href: "/dashboard", label: "Open dashboard", variant: "secondary" as const },
    ],
  },
  features: {
    eyebrow: "Capabilities",
    title: "Scheduled readiness (requires worker)",
    opsNote:
      "Continuous monitoring means scheduled re-scans via Redis worker + QTANGL_ENABLE_SCHEDULER — configure on deploy; not automatic on every hosting tier.",
    items: [
      {
        title: "Scheduled re-scans",
        description: "Weekly or monthly scans across your domain portfolio.",
        image: "/marketing/monitor-scheduled-scans.webp",
        imageAlt:
          "Black and white calendar grid with scan pulses across a domain portfolio.",
      },
      {
        title: "Diff alerts",
        description: "New RSA-2048, deprecated curves, or cipher suite downgrades flagged immediately.",
        image: "/marketing/monitor-diff-alerts.webp",
        imageAlt:
          "Black and white before-and-after TLS config bars highlighting a downgrade delta.",
      },
      {
        title: "Remediation board",
        description: "Prioritized backlog with owner, deadline, and re-scan verification status.",
        image: "/marketing/monitor-remediation-board.webp",
        imageAlt:
          "Black and white kanban board with owner dots and deadline markers.",
      },
      {
        title: "Standards tracking",
        description: "NSM-10, CNSA 2.0, and NIST IR 8547 deadline tiers mapped to your inventory.",
        image: "/marketing/monitor-standards-tracking.webp",
        imageAlt:
          "Black and white checklist grid mapped to tiered compliance deadline rungs.",
      },
    ],
  },
  dashboard: {
    eyebrow: "Dashboard",
    title: "One view of readiness over time",
    description:
      "Readiness score trends, open findings, and remediation velocity — the metrics your QBR needs.",
    href: "/dashboard",
    cta: "View dashboard →",
  },
  cta: {
    title: "Upgrade from Assess to Monitor",
    description: "Every assessment should pitch Monitor before delivery. Request a pilot for your domain portfolio.",
    primary: { label: "Request pilot access", href: "/access" },
    secondary: { label: "See pricing", href: "/pricing" },
  },
} as const;
