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
    title: "Continuous readiness",
    items: [
      {
        title: "Scheduled re-scans",
        description: "Weekly or monthly scans across your domain portfolio.",
      },
      {
        title: "Diff alerts",
        description: "New RSA-2048, deprecated curves, or cipher suite downgrades flagged immediately.",
      },
      {
        title: "Remediation board",
        description: "Prioritized backlog with owner, deadline, and re-scan verification status.",
      },
      {
        title: "Standards tracking",
        description: "NSM-10, CNSA 2.0, and NIST IR 8547 deadline tiers mapped to your inventory.",
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
