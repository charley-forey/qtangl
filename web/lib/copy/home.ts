export const homeHero = {
  eyebrow: "Quantum-native optimization platform",
  title: "Optimization infrastructure for scheduling, routing, and allocation.",
  bridge:
    "Model complex operational constraints, run hybrid optimization, and return ranked plans through a single API.",
  description:
    "Qtangl helps operations teams and platform builders turn difficult planning problems into executable schedules, routes, and resource decisions.",
  primaryCta: { label: "Request Access", href: "/access" },
  secondaryCta: { label: "View Technology", href: "/technology" },
  signal:
    "Submit scheduling, routing, and allocation problems. Receive ranked plans with clear feasibility, method, and cost metadata.",
  valueProps: [
    "Built for operations teams dealing with hard constraints and shifting conditions.",
    "Structured inputs, ranked outputs, and clean integration with existing systems.",
    "A quantum-native brand with a product surface designed to stay practical and readable.",
  ],
} as const;

export const homepageNarrative = {
  problemEyebrow: "The problem",
  problemTitle: "Planning systems break when dependencies, capacity, and timing collide.",
  problemDescription:
    "Manual planning and generic workflow software struggle once constraints stack together. Qtangl is designed for teams that need better decisions when sequencing, availability, windows, and cost all matter at once.",
  architectureEyebrow: "How it works",
  architectureTitle: "Define the problem. Evaluate feasible plans. Return the best next action.",
  domainEyebrow: "Where it fits",
  domainTitle: "Used where timing, capacity, and sequencing directly affect business outcomes.",
  interfaceEyebrow: "API surface",
  interfaceTitle: "Submit a problem. Get a ranked operational plan.",
} as const;

export const accessPanel = {
  eyebrow: "Access",
  title: "Request access to the Qtangl pilot.",
  description:
    "Tell us which scheduling, routing, or allocation workflow you need to improve. Qtangl is currently focused on early pilot teams with clear operational bottlenecks and integration needs.",
  formHint:
    "Best fit for operations leaders, product teams, and technical partners preparing a pilot or API evaluation.",
} as const;
