export const quantumLexicon = {
  superposition: {
    label: "Superposition",
    meaning: "many feasible plans coexist before we choose",
  },
  amplitude: {
    label: "Amplitude",
    meaning: "weight of a candidate plan in the ranking",
  },
  interference: {
    label: "Interference",
    meaning: "constraints reinforcing or canceling each other",
  },
  entanglement: {
    label: "Entanglement",
    meaning: "decisions that cannot be made independently",
  },
  collapse: {
    label: "Collapse",
    meaning: "selecting the executable plan from candidates",
  },
  measurement: {
    label: "Measurement",
    meaning: "the metric your team already tracks",
  },
  coherence: {
    label: "Coherence",
    meaning: "an executable plan that respects all hard constraints",
  },
  phase: {
    label: "Phase",
    meaning: "the stage of the hybrid workflow",
  },
  decoherence: {
    label: "Decoherence",
    meaning: "what happens when hard constraints break the plan in production",
  },
  observables: {
    label: "Observables",
    meaning: "the operational signals teams inspect before acting",
  },
} as const;

export const copyGuardrails = {
  brand:
    "Headlines stay outcome-first. Eyebrows, captions, and visuals carry quantum vocabulary.",
  honesty:
    "Whenever copy describes execution, surface the hybrid truth: classical baseline on every job, QAOA only on tiny research candidates, classical fallback when QAOA cannot beat it.",
} as const;
