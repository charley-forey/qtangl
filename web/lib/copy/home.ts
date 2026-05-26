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
} as const;

export const accessPanel = {
  eyebrow: "Access",
  title: "Tell us what planning problem you need to fix.",
  description:
    "Tell us which schedule, route, or staffing workflow is costing you time. Qtangl is currently focused on pilot teams with a clear planning bottleneck and a real integration path.",
  formHint:
    "Best fit for operations leaders, product teams, and technical partners preparing a pilot or API evaluation.",
} as const;
