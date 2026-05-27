import { quantumLexicon } from "@/lib/copy/voice";

const {
  amplitude,
  collapse,
  interference,
  measurement,
  observables,
  superposition,
} = quantumLexicon;

export const homeHero = {
  eyebrow: "Quantum Planning API",
  title: "Every possibility ranked. One future your team runs.",
  subhead:
    "Send your constraints. Explore every feasible path in superposition — then collapse to the plan worth building next.",
  primaryCta: { label: "Find Quantum", href: "/demo" },
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
  workflowTitle: "From every option open to the path forward.",
  domainEyebrow: observables.label,
  domainTitle: "Scheduling, routing, and staffing under real constraints.",
  apiEyebrow: measurement.label,
  apiTitle: "Demo first. API when you're ready.",
  apiDescription:
    "Send JSON. Get the same ranked plan, summary, and metrics your ops team already tracks.",
} as const;

export const homeProductPreview = {
  eyebrow: amplitude.label,
  title: "See the ranked plan before you wire the API.",
  description:
    "Readable plan, one-line why, and the measurement that proves the win — demo data today, live API tomorrow.",
} as const;
