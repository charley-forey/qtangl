import { quantumLexicon } from "@/lib/copy/voice";

const { coherence, interference, measurement, phase } = quantumLexicon;

export const siteMetadata = {
  name: "Qtangl",
  title: "Qtangl | Quantum-Aware Planning API",
  description:
    "Turn operational constraints into ranked plans while making the hybrid, quantum-aware system behind them understandable.",
  url: "https://qtangl.com",
  tagline: "Send your constraints. Get a plan your team can run.",
  oneLiner:
    "Turn operational constraints into ranked plans with a quantum-forward lens and operationally honest outputs.",
  contactEmail: "founders@qtangl.com",
} as const;

export const aboutContent = {
  eyebrow: "About Qtangl",
  title: "Optimization infrastructure with a quantum-forward point of view.",
  intro:
    "Qtangl builds planning software for teams that lose time and money when schedules, routes, or staffing plans break under real-world constraints. The product keeps the interface readable, the outputs actionable, and the solver stack honest enough for engineers while still giving the brand a quantum-forward language.",
  missionEyebrow: "Mission",
  missionTitle: "Build coherent planning systems that hold up under interference.",
  principles: [
    {
      title: `${coherence.label}`,
      description:
        "Users should be able to describe jobs, resources, windows, and dependencies without translating the business problem into academic language.",
    },
    {
      title: `${phase.label} discipline`,
      description:
        "Solver workflows matter only when they return plans operations teams can review, compare, and execute.",
    },
    {
      title: measurement.label,
      description:
        "The site, API, and future product surfaces should grow into dashboards, docs, and tooling without fragmenting the user experience.",
    },
  ],
  cards: [
    {
      eyebrow: coherence.label,
      description:
        "The brand stays monochrome and restrained so the feeling of coherence comes from structure, contrast, and measured motion instead of decorative color.",
    },
    {
      eyebrow: `${phase.label} discipline`,
      description:
        "Qtangl starts as a company site and developer platform, then grows into APIs, dashboards, and deeper optimization tooling without losing the planning narrative.",
    },
    {
      eyebrow: measurement.label,
      description:
        "The product should always show the plan, the reason it won, and the business signal behind the decision.",
    },
  ],
} as const;

export const docsIndex = {
  eyebrow: measurement.label,
  title: "Documentation for the Qtangl planning API",
  description:
    "Start with the fields you need to send, review the measurements and method details Qtangl returns, and then wire the same workflow into your own system.",
  whatItIs: {
    title: "What Qtangl is",
    description:
      "Qtangl is a planning API for scheduling, routing, and staffing workflows. It turns the rules operations teams already track into a job that returns a ranked plan, a short explanation, and decision-ready measurements.",
  },
  whenToUseIt: {
    title: "When to use it",
    items: [
      "Use Qtangl when schedules break because dependencies and capacity interfere with each other.",
      "Use it when route planning needs to respect windows, capacity, and cost without hiding the tradeoffs.",
      "Use it when staffing or resource assignment depends on multiple hard constraints that must stay coherent.",
    ],
    kicker:
      "The vocabulary can be quantum-forward. The integration path still stays operational and precise.",
  },
} as const;

export const technologyPage = {
  eyebrow: `${phase.label} diagram`,
  title: "Model real planning constraints, evaluate feasible options, and return a plan teams can run.",
  intro:
    "Qtangl accepts structured scheduling, routing, and allocation problems, prepares an optimization model, evaluates feasible plans, and returns ranked results with enough detail for engineering teams and enough clarity for operations teams.",
  sections: [
    {
      eyebrow: "Phase 1",
      title: "Capture the real-world constraints",
      description:
        "Jobs, resources, windows, dependencies, and objectives are represented as structured inputs rather than scattered business rules.",
    },
    {
      eyebrow: "Phase 2",
      title: "Run the solver workflow",
      description:
        "Qtangl prepares the optimization model, evaluates feasible candidates, and selects the execution path best suited to the problem.",
    },
    {
      eyebrow: "Phase 3",
      title: "Return a plan teams can use",
      description:
        "The result is a ranked schedule, route, or allocation plan with metadata that can be reviewed, compared, and reused in downstream systems.",
    },
  ],
  preview: {
    eyebrow: "Execution preview",
    title: "How the product should feel in use.",
    description:
      "Qtangl is designed to translate a difficult planning problem into a ranked output that engineering, operations, and product teams can all read quickly.",
  },
  workflow: {
    eyebrow: "Solver workflow",
    title: "Hybrid execution stays readable from input model to final output.",
  },
  phaseDiagram: {
    eyebrow: `${phase.label} diagram`,
    title: "A classical-first stack with a bounded quantum research band.",
    description:
      "Classical preprocessing runs on every job, quantum-assisted search is reserved for bounded research candidates, and classical post-processing returns the final operational plan.",
  },
  honesty: {
    eyebrow: `${interference.label} check`,
    title: "Method honesty",
    description:
      "QAOA runs only on bounded research-sized candidates; the classical baseline runs on every job. If QAOA fails or does not beat the classical result, Qtangl responds with the classical plan.",
  },
  diagramLabels: ["Client app", "Qtangl API", "Solver workflow", "Ranked output"],
} as const;

export const footerBlurb =
  "Qtangl helps teams turn scheduling, routing, and staffing constraints into plans they can review, compare, and run while understanding the hybrid system behind the decision.";
