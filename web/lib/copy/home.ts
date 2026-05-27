import { quantumLexicon } from "@/lib/copy/voice";

const {
  amplitude,
  collapse,
  interference,
  observables,
  superposition,
} = quantumLexicon;

export const homeHero = {
  eyebrow: "Quantum-aware planning API",
  title: "Send your constraints. Get a plan your team can run.",
  subhead: "Rank every feasible plan. Run the one that wins.",
  primaryCta: { label: "Open demos", href: "/demo" },
  secondaryCta: { label: "Request access", href: "/access" },
  visualLabels: [superposition.label, interference.label, collapse.label],
} as const;

export const homeHeadlineDemo = {
  eyebrow: "Headline demo",
  title: "Hospital re-staffing in 4:11",
  description:
    "Nurse call-out → live CP-SAT solve → hybrid audit trace → scoreboard your ops team can defend.",
  stats: [
    { label: "Hard violations", value: "0" },
    { label: "Overtime saved", value: "6 hrs" },
    { label: "Runtime", value: "4:11" },
  ],
  primaryCta: { label: "Open hospital demo", href: "/demo/hospital" },
} as const;

export const homepageNarrative = {
  workflowEyebrow: `${superposition.label} → ${collapse.label}`,
  workflowTitle: "Rank every feasible plan. Run the one that wins.",
  domainEyebrow: observables.label,
  domainTitle: "Scheduling, routing, and staffing under real constraints.",
} as const;

export const homeProductPreview = {
  eyebrow: amplitude.label,
  title: "See the ranked plan before you wire the API.",
  description:
    "Readable plan, one-line why, and the measurement that proves the win — demo data today, live API tomorrow.",
} as const;
