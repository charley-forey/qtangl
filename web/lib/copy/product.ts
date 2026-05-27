import { quantumLexicon } from "@/lib/copy/voice";

const { coherence, interference, measurement, phase } = quantumLexicon;

export const siteMetadata = {
  name: "Qtangl",
  title: "Qtangl | Quantum Planning API",
  description:
    "Explore every feasible schedule, route, and staffing plan — rank them all, then collapse to the future your team runs.",
  url: "https://qtangl.com",
  tagline: "Every possibility ranked. One future your team runs.",
  oneLiner:
    "Quantum Planning API: hold every option in superposition, rank the field, collapse to an executable plan.",
  contactEmail: "founders@qtangl.com",
} as const;

export const aboutContent = {
  eyebrow: "About Qtangl",
  title: "Planning infrastructure with a quantum lens.",
  intro:
    "Qtangl turns scheduling, routing, and staffing constraints into ranked plans operations teams can run — with outputs honest enough for engineers and clear enough for the floor.",
  missionEyebrow: "Mission",
  missionTitle: "Coherent plans that survive interference.",
  principles: [
    {
      title: coherence.label,
      description:
        "Describe jobs, resources, windows, and dependencies in the language your team already uses.",
    },
    {
      title: `${phase.label} discipline`,
      description:
        "Solver work only counts when it returns plans teams can review, compare, and execute.",
    },
    {
      title: measurement.label,
      description:
        "Every surface shows the plan, why it won, and the business signal behind the decision.",
    },
  ],
  cards: [
    {
      eyebrow: coherence.label,
      description:
        "Monochrome by design — structure and motion carry coherence, not decorative color.",
    },
    {
      eyebrow: `${phase.label} discipline`,
      description:
        "Site and API today; dashboards and deeper tooling next — same planning narrative throughout.",
    },
    {
      eyebrow: measurement.label,
      description: "Plan · reason · metric — always together, always auditable.",
    },
  ],
} as const;

export const docsIndex = {
  eyebrow: measurement.label,
  title: "Qtangl planning API",
  description:
    "Send the fields you track. Read ranked plans, summaries, and measurements. Wire the same flow into your stack.",
  whatItIs: {
    title: "What it is",
    description:
      "One API for scheduling, routing, and staffing. Hard rules in, ranked plan and plain-English why out.",
  },
  whenToUseIt: {
    title: "When to use it",
    items: [
      "Dependencies and capacity interfere on the same schedule.",
      "Routes must respect windows, fleet limits, and cost without hiding tradeoffs.",
      "Staffing needs skills, coverage, and utilization to stay coherent at once.",
    ],
    kicker: "Quantum vocabulary on the surface. Operational integration underneath.",
  },
} as const;

export const technologyPage = {
  eyebrow: `${phase.label} diagram`,
  title: "Model constraints. Rank options. Return a plan your team runs.",
  intro:
    "Structured inputs in. Ranked schedule, route, or allocation out — with enough detail for engineering and enough clarity for operations.",
  sections: [
    {
      eyebrow: "Phase 1",
      title: "Capture constraints",
      description:
        "Jobs, resources, windows, dependencies, and objectives — structured, not scattered.",
    },
    {
      eyebrow: "Phase 2",
      title: "Run the solver workflow",
      description:
        "Build the model, evaluate candidates, pick the execution path that fits the problem.",
    },
    {
      eyebrow: "Phase 3",
      title: "Return ranked output",
      description:
        "Executable plan plus metadata to review, compare, and push downstream.",
    },
  ],
  preview: {
    eyebrow: "Execution preview",
    title: "Hard problem in. Ranked plan out.",
    description:
      "Engineering, operations, and product read the same collapse — plan, summary, measurement.",
  },
  workflow: {
    eyebrow: "Solver workflow",
    title: "Hybrid execution from model to output.",
  },
  phaseDiagram: {
    eyebrow: `${phase.label} diagram`,
    title: "Classical-first stack. Bounded quantum research band.",
    description:
      "Classical preprocessing on every job. Quantum-assisted search on tiny research candidates. Classical post-processing returns the operational plan.",
  },
  honesty: {
    eyebrow: `${interference.label} check`,
    title: "Method honesty",
    description:
      "QAOA only on bounded research-sized candidates. Classical baseline every job. If QAOA loses, you get the classical plan.",
  },
  diagramLabels: ["Client app", "Qtangl API", "Solver workflow", "Ranked output"],
} as const;

export const footerBlurb =
  "Rank feasible plans. Collapse to one your team can run. Classical-first, quantum-aware, operationally honest.";
