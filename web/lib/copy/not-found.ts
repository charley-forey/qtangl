export const notFoundCopy = {
  marketing: {
    eyebrow: "Route not in inventory",
    title: "We can't verify this path",
    description:
      "This URL isn't in Qtangl's route inventory — it may have migrated, been renamed, or never existed. Search below or pick a destination by intent.",
    inventory: {
      eyebrow: "Uninventoried route",
      algorithm: "unknown",
      status: "not in CBOM",
      migrationLabel: "Suggest migration target",
    },
    search: {
      label: "Where were you trying to go?",
      placeholder: "Search routes — assess, mosca, docs api, q-day…",
      shortcutHint: "⌘K",
      noResults: "No matches. Try assess, q-day, docs, or platform.",
    },
    suggestions: {
      heading: "Suggested migration targets",
      legacyNote: "This path moved",
    },
    intents: {
      heading: "Browse by intent",
      groups: [
        {
          id: "scan",
          label: "Run a scan",
          links: [
            { href: "/assess", title: "Q-Day Assess", description: "Live inventory and signed evidence" },
            { href: "/assess/mini", title: "Mini-assessment", description: "Instant readiness score" },
            { href: "/verify", title: "Verify report", description: "Check a signed scan artifact" },
          ],
        },
        {
          id: "learn",
          label: "Learn",
          links: [
            { href: "/learn/quantum-crypto", title: "Quantum crypto curriculum", description: "4-week learning path" },
            { href: "/q-day", title: "Q-Day hub", description: "HNDL, Mosca, and migration guides" },
            { href: "/blog", title: "Blog", description: "Readiness articles and video companions" },
          ],
        },
        {
          id: "build",
          label: "Developers",
          links: [
            { href: "/docs", title: "Documentation", description: "Guides, API reference, quickstart" },
            { href: "/docs/api", title: "API reference", description: "PQC scanner and monitor endpoints" },
            { href: "/docs/quickstart", title: "Quickstart", description: "First scan in minutes" },
          ],
        },
        {
          id: "buy",
          label: "Evaluate",
          links: [
            { href: "/pricing", title: "Pricing", description: "Assess, Monitor, and Convert tiers" },
            { href: "/compare", title: "Compare vendors", description: "PQC readiness landscape" },
            { href: "/access", title: "Request access", description: "Talk to the Qtangl team" },
          ],
        },
      ],
    },
    mosca: {
      toggle: "While you're here — check Mosca exposure",
      linkLabel: "Full Mosca guide",
      linkHref: "/q-day/mosca-inequality",
    },
    actions: {
      primary: { href: "/assess", label: "Run Q-Day scan" },
      secondary: { href: "/q-day", label: "Q-Day hub" },
      tertiary: { href: "/docs", label: "Documentation" },
    },
  },
  dashboard: {
    eyebrow: "Workspace view not found",
    title: "This dashboard view doesn't exist",
    description:
      "The path isn't available in your workspace. Return to overview, open scans, or check system status.",
    actions: {
      primary: { href: "/dashboard", label: "Dashboard overview" },
      secondary: { href: "/assess", label: "Run new scan" },
      tertiary: { href: "/status", label: "System status" },
    },
    links: [
      { href: "/dashboard", title: "Overview", description: "Readiness KPIs and latest scan" },
      { href: "/assess", title: "Assess", description: "Run or revisit a scan" },
      { href: "/docs/guides/monitor-workflow", title: "Monitor guide", description: "Scheduled re-scans and drift" },
      { href: "/status", title: "Status", description: "Platform health and incidents" },
    ],
  },
} as const;
