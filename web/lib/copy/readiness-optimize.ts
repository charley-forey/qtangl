export const optimizeHubCopy = {
  metadata: {
    title: "Hybrid Optimization",
    description:
      "Hospital re-staffing, airline crew recovery, and EV fleet routing — Qtangl's classical-first planning API.",
  },
  hero: {
    eyebrow: "Hybrid optimization",
    title: "Every possibility ranked. One future your team runs.",
    description:
      "Scheduling, routing, and staffing under real constraints — CP-SAT baseline on every job, bounded hybrid research band.",
    actions: [
      { href: "/demo/hospital", label: "Hospital demo" },
      { href: "/technology", label: "Technology", variant: "secondary" as const },
    ],
  },
  readinessBanner: {
    text: "Looking for post-quantum readiness?",
    href: "/platform",
    cta: "Explore platform →",
  },
  demos: {
    eyebrow: "Live demos",
    title: "Industry workflows",
    description: "Same ranked-plan output, operationally honest — separate from the Q-Day readiness platform.",
  },
  developer: {
    eyebrow: "For developers",
    title: "API sandbox",
    description: "Send a real POST /optimize call and see ranked JSON your app receives.",
    href: "/sandbox",
    cta: "Open sandbox →",
  },
} as const;
