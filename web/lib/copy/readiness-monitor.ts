export const monitorPageCopy = {
  metadata: {
    title: "Crypto Drift Monitoring — Command Center for PQC Readiness",
    description:
      "Scheduled PQC re-scans, crypto drift command center, diff alerts, QBR-ready executive digests, and standards tracking — illustrative previews with honest scope.",
  },
  hero: {
    eyebrow: "Monitor",
    title: "Catch crypto drift before auditors do",
    description:
      "Your command center for continuous PQC readiness — scheduled re-scans, drift diffs, SIEM alerts, and QBR-ready exports. Board meetings deserve trends, not point-in-time snapshots.",
    actions: [
      { href: "/access#monitor", label: "Request Monitor pilot" },
      { href: "/command-center", label: "Open dashboard", variant: "secondary" as const },
    ],
  },
  trustSignals: [
    { label: "PQ-signed reports", href: "/trust" },
    { label: "Verify evidence", href: "/verify" },
    { label: "Drift API", href: "/docs/reference/drift-api" },
    { label: "Procurement pack", href: "/trust/procurement-pack" },
    { label: "Methodology", href: "/assess/methodology" },
  ],
  anchorNav: [
    { href: "#command-center", label: "Command center" },
    { href: "#drift-timeline", label: "Drift timeline" },
    { href: "#alerts", label: "Alerts" },
    { href: "#personas", label: "Personas" },
    { href: "#pilot", label: "Pilot" },
  ],
  sectionNav: [
    { id: "command-center", label: "Command center" },
    { id: "drift-theater", label: "Drift theater" },
    { id: "personas", label: "Personas" },
    { id: "enterprise-proof", label: "Enterprise proof" },
    { id: "pilot", label: "Pilot" },
  ],
  proofItems: [
    {
      icon: "drift" as const,
      title: "Continuous drift diff",
      description: "Scan-to-scan deltas for TLS, certs, host fleet, code, and CBOM — not a one-time snapshot.",
    },
    {
      icon: "evidence" as const,
      title: "Signed QBR exports",
      description: "Executive digest and board PDF with verify links auditors can check independently.",
    },
    {
      icon: "velocity" as const,
      title: "SIEM-ready webhooks",
      description: "qtangl-webhook-v2 payloads map to Slack, Teams, Splunk, and your GRC pipeline.",
    },
    {
      icon: "scope" as const,
      title: "Honest inventory aid",
      description: "Quantifies quantum-vulnerable exposure and drift — not certification or formal attestation.",
    },
  ],
  chapters: {
    commandCenter: {
      eyebrow: "Command center",
      title: "Your crypto readiness SOC — illustrative preview",
      description:
        "Toggle industry scenarios to explore drift trends, multi-source deltas, and business-unit heatmaps. Connect your API key on the dashboard for live tenant data.",
    },
    driftTheater: {
      eyebrow: "Drift theater",
      title: "Scrub weeks, model schedules, route alerts",
      description:
        "Walk through scheduled re-scans, estimate quota usage, and preview webhook payloads before you enable Monitor on your estate.",
    },
    enterprise: {
      eyebrow: "Enterprise proof",
      title: "Built for board decks and MSSP rollups",
      description:
        "Persona views, peer benchmarks, framework deadlines, and remediation velocity — the proof procurement and leadership teams expect.",
    },
  },
  howItWorks: [
    {
      step: 1,
      title: "Establish baseline",
      detail: "Run Assess on your domain portfolio — signed PDF and CBOM evidence your auditors can verify.",
    },
    {
      step: 2,
      title: "Schedule re-scans",
      detail: "Weekly or monthly cadence per target. Worker + scheduler required on deploy.",
    },
    {
      step: 3,
      title: "Detect drift",
      detail: "Scan-to-scan diffs surface new Q-vulnerable assets, cert expiry, and cipher downgrades.",
    },
    {
      step: 4,
      title: "Export for QBR",
      detail: "Executive digest, readiness trends, and board PDF exports — metrics leadership expects.",
    },
  ],
  compareAssess: {
    eyebrow: "Assess vs Monitor",
    title: "One-time baseline vs continuous drift",
    assess: {
      title: "Assess",
      points: ["Single-session inventory", "Signed baseline evidence", "Framework mapping"],
      href: "/assess",
      cta: "Run baseline",
    },
    monitor: {
      title: "Monitor",
      points: ["Scheduled re-scans", "Drift diff + alerts", "Trend + QBR exports"],
      href: "/command-center?tab=monitor",
      cta: "Open dashboard",
    },
    compareHref: "/compare",
    compareLabel: "Compare continuous drift vs point-in-time competitors →",
  },
  integrations: {
    eyebrow: "Integrations",
    title: "Alerts where your team already works",
    items: [
      { name: "Slack", href: "/docs/integrations/siem-webhook-v2" },
      { name: "Microsoft Teams", href: "/docs/integrations/siem-webhook-v2" },
      { name: "Splunk / SIEM", href: "/docs/integrations/siem-webhook-v2" },
      { name: "GitHub Actions", href: "/docs/integrations/ci-cd" },
      { name: "Jira", href: "/docs/guides/monitor-workflow" },
      { name: "ServiceNow", href: "/docs/integrations/siem-webhook-v2" },
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
        docHref: "/docs/guides/monitor-setup",
      },
      {
        title: "Diff alerts",
        description: "New RSA-2048, deprecated curves, or cipher suite downgrades flagged immediately.",
        image: "/marketing/monitor-diff-alerts.webp",
        imageAlt:
          "Black and white before-and-after TLS config bars highlighting a downgrade delta.",
        docHref: "/docs/guides/drift-monitoring",
      },
      {
        title: "Remediation board",
        description: "Prioritized backlog with owner, deadline, and re-scan verification status.",
        image: "/marketing/monitor-remediation-board.webp",
        imageAlt:
          "Black and white kanban board with owner dots and deadline markers.",
        docHref: "/docs/guides/monitor-workflow",
      },
      {
        title: "Standards tracking",
        description: "NSM-10, CNSA 2.0, and NIST IR 8547 deadline tiers mapped to your inventory.",
        image: "/marketing/monitor-standards-tracking.webp",
        imageAlt:
          "Black and white checklist grid mapped to tiered compliance deadline rungs.",
        docHref: "/docs/guides/drift-monitoring",
      },
    ],
  },
  framework: {
    heading: "Track readiness against mandate deadlines",
    intro:
      "Monitor maps drift findings to NSM-10, CNSA 2.0, NIST IR 8547, and other frameworks — so remediation priorities align with the deadlines your auditors cite.",
  },
  api: {
    eyebrow: "Drift API",
    title: "Programmatic drift for your SOC pipeline",
    description:
      "Poll unified drift summaries, scope deltas, and webhook v2 payloads — same data that powers the dashboard command center.",
    docsHref: "/docs/reference/drift-api",
  },
  dashboard: {
    eyebrow: "Dashboard",
    title: "One view of readiness over time",
    description:
      "Readiness score trends, open findings, and remediation velocity — the metrics your QBR needs.",
    href: "/command-center",
    cta: "View dashboard →",
  },
  cta: {
    title: "Upgrade from Assess to Monitor",
    description: "Every assessment should pitch Monitor before delivery. Request a pilot for your domain portfolio.",
    primary: { label: "Request pilot access", href: "/access#monitor" },
    secondary: { label: "See pricing", href: "/pricing" },
  },
  liveToday: [
    "Scheduled re-scans + drift diff",
    "Slack + qtangl-webhook-v2 alerts",
    "Executive digest + readiness trends",
  ],
} as const;
