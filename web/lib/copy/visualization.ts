import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude, collapse, interference, phase } = quantumLexicon;

export const methodBadgeCopy = {
  classical: {
    label: "method: classical",
    description:
      "A classical baseline runs on every job. This result came from the classical path.",
  },
  hybrid: {
    label: "method: hybrid",
    description:
      "Hybrid indicates a bounded quantum research step may be present, but the system still falls back to the classical result when it performs better.",
  },
} as const;

export const planVisualizationCopy = {
  eyebrow: "Why this plan works",
} as const;

export const amplitudeBarsCopy = {
  eyebrow: amplitude.label,
  title: "Where the ranking concentrates",
  description:
    "The best candidate plan accumulates amplitude because it clears hard constraints and improves the measured objective.",
} as const;

export const collapseMeterCopy = {
  eyebrow: collapse.label,
  title: "Candidates evaluated to one executable plan",
} as const;

export const interferenceHeatmapCopy = {
  eyebrow: interference.label,
  title: "Constraint pressure across the planning state",
  description:
    "Higher intensity means more constraint pressure. The goal is not to remove complexity, but to make it legible.",
} as const;

export const hybridStackDiagramCopy = {
  eyebrow: `${phase.label} diagram`,
  title: "How the hybrid workflow is weighted today",
  description:
    "Qtangl is classical-first today. Quantum-assisted search is a bounded research band inside a broader operational workflow.",
  bands: [
    {
      label: "Classical preprocessing",
      width: 48,
      description: "Normalize inputs, build constraints, and shape the optimization model.",
    },
    {
      label: "Quantum-assisted search (research)",
      width: 12,
      description: "Bounded exploration on tiny research-sized candidates only.",
    },
    {
      label: "Classical post-processing",
      width: 40,
      description: "Rank the winner, assemble the response, and return an executable plan.",
    },
  ],
} as const;

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
