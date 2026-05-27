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
  eyebrow: "Quantum-aware planning API",
  title: "Send your constraints. Get a plan your team can run.",
  subhead:
    "Many feasible plans exist at once. Qtangl ranks them, then collapses to one your team can execute.",
  primaryCta: { label: "Open hospital demo", href: "/demo/hospital" },
  secondaryCta: { label: "View docs", href: "/docs" },
  signal:
    "Ranked plan · plain summary · overtime, miles, coverage — classical baseline on every job.",
  valueProps: [
    `${superposition.label} — see alternates`,
    `${interference.label} — see constraint pressure`,
    `${collapse.label} — run the winner`,
  ],
  visualLabels: [superposition.label, interference.label, collapse.label],
} as const;

export const homeHeadlineDemo = {
  eyebrow: "Headline demo",
  title: "Hospital re-staffing in 4:11",
  description:
    "Nurse call-out → live CP-SAT solve → hybrid audit trace → scoreboard your ops team can defend.",
  primaryCta: { label: "Open hospital demo", href: "/demo/hospital" },
  secondaryCta: { label: "Read methodology", href: "/demo/hospital/methodology" },
} as const;

export const homepageNarrative = {
  workflowEyebrow: `${superposition.label} → ${collapse.label}`,
  workflowTitle: "Rank every feasible plan. Run the one that wins.",
  domainEyebrow: observables.label,
  domainTitle: "Scheduling, routing, and staffing under real constraints.",
  interfaceEyebrow: measurement.label,
  interfaceTitle: "Demo first. API when you're ready.",
  interfaceDescription:
    "Send JSON. Get the same ranked plan, summary, and metrics your ops team already tracks.",
} as const;

export const homeProductPreview = {
  eyebrow: amplitude.label,
  title: "See the ranked plan before you wire the API.",
  description:
    "Readable plan, one-line why, and the measurement that proves the win — demo data today, live API tomorrow.",
} as const;
