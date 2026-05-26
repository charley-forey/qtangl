export const homeHero = {
  eyebrow: "Planning API for schedules, routes, and staffing",
  title: "Send your constraints. Get a plan your team can run.",
  bridge:
    "Qtangl turns messy operational rules into ranked schedules, routes, and staffing plans without making teams rebuild everything by hand.",
  description:
    "Start with a guided demo or integrate through one API. Use the inputs you already track: tasks, crews, windows, vehicles, shifts, and hard business rules.",
  primaryCta: { label: "Try the demo", href: "/try" },
  secondaryCta: { label: "View docs", href: "/docs" },
  signal:
    "Get a ranked plan, a plain-English summary, and metrics like delay risk, miles saved, or overtime avoided.",
  valueProps: [
    "See a visual plan before you commit engineering time.",
    "Map the fields you already track into one repeatable workflow.",
    "Keep solver complexity under the hood and business value up front.",
  ],
  visualLabels: ["Input constraints", "Feasible plans", "Ranked output"],
} as const;

export const homepageNarrative = {
  problemEyebrow: "The problem",
  problemTitle: "Planning systems break when dependencies, capacity, and timing collide.",
  problemDescription:
    "Manual planning and generic workflow software struggle once constraints stack together. Qtangl is designed for teams that need better decisions when sequencing, availability, windows, and cost all matter at once.",
  architectureEyebrow: "How it works",
  architectureTitle: "Describe the situation. Evaluate feasible plans. Return the best next action.",
  domainEyebrow: "Where it fits",
  domainTitle: "Used where timing, capacity, and sequencing directly affect business outcomes.",
  interfaceEyebrow: "API surface",
  interfaceTitle: "Try the workflow visually first. Integrate with the API when you're ready.",
  interfaceDescription:
    "Start with the guided demo to see the workflow visually. When you are ready to integrate, developers can send JSON and receive the same ranked plan with summary, metrics, and solver details.",
} as const;

export const homeSections = {
  solution: {
    eyebrow: "What Qtangl does",
    title: "Turn operational constraints into ranked plans your team can run.",
    description:
      "Qtangl keeps the planning problem intact instead of flattening it into generic workflow software. Teams send the rules they already track, evaluate feasible options, and receive a plan they can run.",
  },
} as const;

export const homeProductPreview = {
  eyebrow: "Product proof",
  title: "A planning product people can understand before they ever read the API.",
  description:
    "The interface below shows the kind of ranked output Qtangl is designed to return: a readable plan, a short explanation, and the metric that makes the value obvious.",
  details: [
    "The right product surface starts with the business problem, not solver jargon. That means a user should immediately see the plan, the blocked window, and the measurable improvement.",
    "The same visualization layer can render demo data today and live API responses later without changing the mental model.",
  ],
} as const;
