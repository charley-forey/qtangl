import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude, collapse, interference, measurement, phase } = quantumLexicon;

export const methodBadgeCopy = {
  classical: {
    label: "method: classical",
    description:
      "A classical baseline runs on every job. This result came from the classical path.",
  },
  hybrid: {
    label: "method: hybrid",
    description:
      "Bounded quantum research step may be present. Classical result wins when it performs better.",
  },
} as const;

export const planVisualizationCopy = {
  eyebrow: "Why this plan works",
} as const;

export const amplitudeBarsCopy = {
  eyebrow: amplitude.label,
  title: "Where the ranking concentrates",
  description:
    "Amplitude concentrates on the plan that clears hard constraints and wins on objective.",
} as const;

export const collapseMeterCopy = {
  eyebrow: collapse.label,
  title: "Candidates evaluated to one executable plan",
} as const;

export const interferenceHeatmapCopy = {
  eyebrow: interference.label,
  title: "Constraint pressure across the planning state",
  description: "Brighter cells = more constraint pressure. Legible, not hidden.",
} as const;

export const hybridStackDiagramCopy = {
  eyebrow: `${phase.label} diagram`,
  title: "How the hybrid workflow is weighted today",
  description:
    "Classical-first today. Quantum-assisted search is a bounded band inside the operational workflow.",
  bands: [
    {
      label: "Classical preprocessing",
      width: 48,
      algorithm: "OR-Tools CP-SAT",
      description: "Normalize inputs, build constraints, and shape the optimization model.",
      operations: [
        "Schema validation and type normalization",
        "Constraint graph construction",
        "CSP/IP model encoding with slack variables",
      ],
    },
    {
      label: "Quantum-assisted search (research)",
      width: 12,
      algorithm: "QAOA p=1",
      description: "Bounded exploration on tiny research-sized candidates only.",
      operations: [
        "Repair-window QUBO encoding",
        "QAOA reps=1, maxiter=12, shots=256",
        "Classical wins when QAOA loses on objective",
      ],
    },
    {
      label: "Classical post-processing",
      width: 40,
      algorithm: "Re-rank + serialize",
      description: "Rank the winner, assemble the response, and return an executable plan.",
      operations: [
        "Pareto dominance filter",
        "Amplitude scoring and collapse",
        "JSON response with method label",
      ],
    },
  ],
} as const;

export const pipelineDiagramCopy = {
  eyebrow: "Solver pipeline",
  title: "Five stages from request to executable plan.",
  description:
    "Parse, encode, search, rank, respond — each stage names the algorithm your team can audit.",
} as const;

export const candidateFunnelCopy = {
  eyebrow: collapse.label,
  title: "Why hundreds of candidates become one plan.",
  description: "Select a stage to see the rejection reason.",
} as const;

export const methodComparisonCopy = {
  eyebrow: interference.label,
  title: "Classical baseline vs hybrid-assisted search.",
  description:
    "Same feasibility guarantee. Hybrid adds bounded exploration — classical wins when QAOA cannot beat it.",
} as const;

export const jsonContractCopy = {
  eyebrow: "API contract",
  title: "What you send. What you get back.",
  description:
    "Same shape as /sandbox and /docs/api — tasks, constraints in; plan, summary, metrics, method out.",
} as const;

export const latencyEnvelopeCopy = {
  eyebrow: measurement.label,
  title: "Latency and safe operating envelope.",
  description:
    "Response time grows with problem size. Hybrid adds a bounded band on research candidates only.",
} as const;

export const lexiconGlossaryCopy = {
  eyebrow: "Lexicon",
  title: "Quantum terms map to engineering language.",
  description:
    "Surface vocabulary for product and ops. Underneath: constraint graphs, solvers, and ranked JSON.",
} as const;

export const decoherencePanelCopy = {
  eyebrow: "Decoherence",
  title: "When constraints break in production.",
  description:
    "The API does not hide failure — infeasibility, partial plans, and method disagreement are explicit.",
} as const;

export const phaseRibbonItems = [
  { id: "pipeline", label: "Pipeline" },
  { id: "phases", label: "Phases" },
  { id: "hybrid-stack", label: "Hybrid stack" },
  { id: "interference", label: "Interference" },
  { id: "comparison", label: "Methods" },
  { id: "contract", label: "Contract" },
  { id: "latency", label: "Latency" },
  { id: "lexicon", label: "Lexicon" },
  { id: "decoherence", label: "Failures" },
  { id: "preview", label: "Preview" },
] as const;

export const homeAmplitudeBars = [
  {
    label: "Plan A",
    value: 82,
    caption: "Lowest projected overtime with zero hard-constraint violations.",
  },
  {
    label: "Plan B",
    value: 57,
    caption: "Feasible, but leaves more delay risk in the blocked window.",
  },
  {
    label: "Plan C",
    value: 34,
    caption: "Higher cost once crews and handoffs are re-sequenced.",
  },
] as const;

export const technologyInterferenceMap = {
  xLabels: ["Crew", "Window", "Dependency", "Cost"],
  yLabels: ["Schedule", "Routing", "Allocation"],
  values: [
    [0.82, 0.76, 0.92, 0.44],
    [0.34, 0.88, 0.46, 0.73],
    [0.91, 0.58, 0.62, 0.69],
  ],
} as const;

export const schedulingInterferenceMap = {
  xLabels: ["Trade", "Inspection", "Labor", "Overtime"],
  yLabels: ["Before rank", "After rank"],
  values: [
    [0.91, 0.84, 0.76, 0.72],
    [0.32, 0.28, 0.44, 0.36],
  ],
} as const;
