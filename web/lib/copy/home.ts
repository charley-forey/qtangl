import { quantumLexicon } from "@/lib/copy/voice";

const {
  amplitude,
  collapse,
  decoherence,
  interference,
  measurement,
  observables,
  phase,
  superposition,
} = quantumLexicon;

export const homeHero = {
  eyebrow: "Quantum-aware planning API",
  title: "Send your constraints. Get a plan your team can run.",
  bridge:
    "Qtangl gives operations teams a quantum-forward way to talk about the hard part of planning: many feasible schedules, routes, and staffing options exist at once before one plan is chosen.",
  description:
    "Start with a guided demo or integrate through one API. Use the inputs you already track: tasks, crews, windows, vehicles, shifts, and hard business rules.",
  primaryCta: { label: "Try the demo", href: "/try" },
  secondaryCta: { label: "View docs", href: "/docs" },
  signal:
    "Get a ranked plan, a plain-English summary, and measurements like delay risk, miles saved, or overtime avoided.",
  valueProps: [
    `${superposition.label} shows the feasible plans before your team commits.`,
    `${interference.label} makes the real constraint pressure visible.`,
    `${measurement.label} stays in business terms instead of solver jargon.`,
  ],
  visualLabels: [superposition.label, interference.label, collapse.label],
} as const;

export const homepageNarrative = {
  problemEyebrow: decoherence.label,
  problemTitle: "Planning systems break when dependencies, capacity, and timing collide.",
  problemDescription:
    "Manual planning and generic workflow software struggle once constraints stack together. Qtangl is designed for teams that need better decisions when sequencing, availability, windows, and cost all matter at once.",
  architectureEyebrow: `${phase.label}s`,
  architectureTitle: "Describe the situation. Evaluate feasible plans. Return the best next action.",
  domainEyebrow: observables.label,
  domainTitle: "Used where timing, capacity, and sequencing directly affect business outcomes.",
  interfaceEyebrow: measurement.label,
  interfaceTitle: "Try the workflow visually first. Integrate with the API when you're ready.",
  interfaceDescription:
    "Start with the guided demo to see the workflow visually. When you are ready to integrate, developers can send JSON and receive the same ranked plan with summary, metrics, and solver details.",
} as const;

export const homeSections = {
  solution: {
    eyebrow: collapse.label,
    title: "Turn operational constraints into ranked plans your team can run.",
    description:
      "Qtangl keeps the planning problem intact instead of flattening it into generic workflow software. Teams send the rules they already track, evaluate feasible options, and receive a plan they can run.",
  },
} as const;

export const homeProductPreview = {
  eyebrow: amplitude.label,
  title: "See the ranked plan before you ever wire the API.",
  description:
    "The interface below shows the kind of ranked output Qtangl is designed to return: a readable plan, a short explanation, and the metric that makes the value obvious.",
  details: [
    `The right product surface starts with the business problem, not solver jargon. ${amplitude.label} belongs in the chart, while the headline stays operational.`,
    `The same visualization layer can render demo data today and live API responses later without changing the mental model from ${superposition.label} to ${collapse.label}.`,
  ],
} as const;
