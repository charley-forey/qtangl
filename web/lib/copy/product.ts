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
    "JSON planning state in. Ranked plan, summary, and measurements out — CP-SAT baseline every job, bounded QAOA on research candidates only.",
  pipeline: {
    eyebrow: "Solver pipeline",
    title: "Five stages from request to executable plan.",
    description:
      "Parse, encode, search, rank, respond — each stage names the algorithm your integration team can audit.",
  },
  sections: [
    {
      eyebrow: "Phase 1",
      title: "Capture constraints",
      description:
        "Jobs, resources, windows, dependencies, and objectives — structured, not scattered.",
      underTheHood:
        "Validate JSON, normalize fields, build the constraint graph before any solver call.",
    },
    {
      eyebrow: "Phase 2",
      title: "Run the solver workflow",
      description:
        "Build the model, evaluate candidates, pick the execution path that fits the problem.",
      underTheHood:
        "CP-SAT baseline on every job; QAOA only on bounded research-sized repair windows.",
    },
    {
      eyebrow: "Phase 3",
      title: "Return ranked output",
      description:
        "Executable plan plus metadata to review, compare, and push downstream.",
      underTheHood:
        "Pareto filter, amplitude scoring, collapse to one plan with honest method label.",
    },
  ],
  comparison: {
    eyebrow: `${interference.label} check`,
    title: "Classical baseline vs hybrid-assisted search.",
    description:
      "Same feasibility guarantee. Hybrid adds bounded exploration — classical wins when QAOA cannot beat it.",
  },
  jsonContract: {
    eyebrow: "API contract",
    title: "What you send. What you get back.",
    description:
      "Same shape as /sandbox and /docs/api — tasks, constraints in; plan, summary, metrics, method out.",
  },
  latency: {
    eyebrow: measurement.label,
    title: "Latency and safe operating envelope.",
    description:
      "Response time grows with problem size. Hybrid adds a bounded band on research candidates only.",
  },
  glossary: {
    eyebrow: "Lexicon",
    title: "Quantum terms map to engineering language.",
    description:
      "Surface vocabulary for product and ops. Underneath: constraint graphs, solvers, and ranked JSON.",
  },
  decoherence: {
    eyebrow: "Decoherence",
    title: "When constraints break in production.",
    description:
      "The API does not hide failure — infeasibility, partial plans, and method disagreement are explicit.",
  },
  funnel: {
    eyebrow: "Collapse",
    title: "Why hundreds of candidates become one plan.",
    description: "Click a stage to see the rejection reason.",
  },
  chapters: {
    howItRuns: { eyebrow: "Pipeline", title: "How it runs" },
    solverTruth: { eyebrow: "Method", title: "Solver truth" },
    integrate: { eyebrow: "API", title: "Integrate" },
    runIt: { eyebrow: "Output", title: "Run it" },
  },
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
