export const hospitalMethodologyCopy = {
  eyebrow: "Methodology",
  title: "How the hospital demo is grounded",
  description:
    "Every number in the demo comes from either the synthetic PBJ-shaped fixture set, the benchmark harness, or the cached QPU trace written into the repository.",
  sources: [
    "CMS Payroll-Based Journal public staffing distributions for the roster shape and hour mix.",
    "AACN ICU staffing guidance for critical-care coverage assumptions.",
    "AORN perioperative staffing guidance for scrub and circulating nurse requirements.",
    "The Joint Commission HR competency expectations for certification-driven coverage constraints.",
  ],
  solver: {
    title: "Solver settings",
    items: [
      "Classical path: OR-Tools CP-SAT on the live backend.",
      "Hybrid path: repair-window QUBO with a cached QPU trace and an Aer-backed fallback.",
      "QAOA defaults: reps=1, maxiter=12, shots=256, seed=1234.",
      "Penalty policy: hard lambda = 10x the max objective coefficient; soft weights tuned in the repository fixture file.",
    ],
  },
  evidence: {
    title: "Evidence files",
    items: [
      "benchmarks/hospital_results.csv",
      "demos/hospital_restaffing/data/qpu_trace.json",
      "demos/hospital_restaffing/data/calibration.md",
    ],
  },
} as const;

export const airlineMethodologyCopy = {
  eyebrow: "Methodology",
  title: "How the airline OCC demo is grounded",
  description:
    "Every number comes from the synthetic regional-carrier fixture set, the benchmark harness, or the cached QPU trace in the repository.",
  sources: [
    "FAA FAR 117 flight and duty limitations for rest, FDP, and cumulative duty.",
    "DOT controllable-cancellation cost bands for manual recovery baselines.",
    "OAG/BTS on-time performance distributions for slack-based arrival probability.",
  ],
  solver: {
    title: "Solver settings",
    items: [
      "Routing: greedy tail swap over affected legs, then open-crew identification.",
      "Classical: OR-Tools CP-SAT multi-leg crew assignment with reserve fallback.",
      "Hybrid: repair-window QUBO over crew×leg binaries with cached QPU trace replay.",
      "QAOA defaults: reps=1, maxiter=8, shots=256, seed=1234; gated above 20 binary variables.",
    ],
  },
  evidence: {
    title: "Evidence files",
    items: [
      "benchmarks/airline_results.csv",
      "demos/airline_recovery/data/qpu_trace.json",
      "demos/airline_recovery/data/calibration.md",
    ],
  },
} as const;
