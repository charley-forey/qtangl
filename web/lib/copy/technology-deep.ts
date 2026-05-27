import { hospitalMethodologyCopy } from "@/lib/copy/methodology";

export const solverParameters = {
  classical: "OR-Tools CP-SAT on the live backend.",
  hybrid: "Repair-window QUBO with cached QPU trace and Aer-backed fallback.",
  qaoa: "reps=1, maxiter=12, shots=256, seed=1234",
  penalty:
    "Hard lambda = 10× max objective coefficient; soft weights from repository fixtures.",
} as const;

export const phaseUnderTheHood = [
  {
    phase: "Phase 1",
    operation: "Validate JSON, normalize tasks/resources/windows, attach objective weights.",
    algorithm: "Schema validation + constraint graph build",
  },
  {
    phase: "Phase 2",
    operation: "Encode CSP/IP model, run CP-SAT baseline, bounded QAOA on research candidates.",
    algorithm: `CP-SAT + QAOA (${solverParameters.qaoa})`,
  },
  {
    phase: "Phase 3",
    operation: "Pareto-rank survivors, collapse to one plan, serialize response.",
    algorithm: "Dominance filter + amplitude scoring + JSON assembly",
  },
] as const;

export const pipelineStages = [
  {
    id: "parse",
    eyebrow: "Ingress",
    title: "Parse + validate",
    operation: "Reject malformed payloads before solver work starts.",
    algorithm: "JSON schema + type guards",
  },
  {
    id: "encode",
    eyebrow: "Encode",
    title: "Build planning model",
    operation: "Tasks, resources, windows, and dependencies become a constraint graph.",
    algorithm: "CSP/IP encoding + slack variables",
  },
  {
    id: "solve",
    eyebrow: "Search",
    title: "Baseline + bounded QAOA",
    operation: "CP-SAT on every job; QAOA only on research-sized repair windows.",
    algorithm: solverParameters.classical,
  },
  {
    id: "rank",
    eyebrow: "Rank",
    title: "Filter + score",
    operation: "Drop infeasible and dominated candidates; score survivors by objective.",
    algorithm: "Pareto dominance + amplitude weighting",
  },
  {
    id: "respond",
    eyebrow: "Collapse",
    title: "Return one plan",
    operation: "Executable plan, summary, measurements, and honest method label.",
    algorithm: "Response serializer",
  },
] as const;

export const candidateFunnelStages = [
  {
    label: "Sampled",
    count: 512,
    reason: "Initial candidate pool from encoding and neighborhood expansion.",
  },
  {
    label: "Infeasible",
    count: 312,
    reason: "Hard constraints violated — crew overlap, window breach, or broken precedence.",
  },
  {
    label: "Dominated",
    count: 198,
    reason: "Another candidate is strictly better on objective without adding violations.",
  },
  {
    label: "Below threshold",
    count: 2,
    reason: "Feasible but amplitude below the ranking cutoff for operational output.",
  },
  {
    label: "Executable plan",
    count: 1,
    reason: "Highest-amplitude survivor after classical-first comparison.",
  },
] as const;

export const methodComparisonRows = [
  {
    dimension: "Feasibility",
    classical: "CP-SAT proves feasibility or returns infeasibility report.",
    hybrid: "Same classical guarantee; QAOA cannot override hard constraints.",
  },
  {
    dimension: "Objective",
    classical: "Optimal within CP-SAT time budget for encoded model size.",
    hybrid: "Classical wins when QAOA cannot beat baseline on objective.",
  },
  {
    dimension: "Runtime",
    classical: "Deterministic profile; scales with task count and constraint density.",
    hybrid: "Adds bounded QAOA band (~12% of workflow) on tiny candidates only.",
  },
  {
    dimension: "Determinism",
    classical: "Reproducible with fixed seed and same inputs.",
    hybrid: "QAOA shots introduce variance; classical path selected on tie or loss.",
  },
  {
    dimension: "When it wins",
    classical: "Default for production; every job gets this baseline.",
    hybrid: "Research repair windows where exploration surfaces non-obvious alternates.",
  },
] as const;

export const latencyChartData = {
  classical: [
    { size: 10, ms: 120 },
    { size: 25, ms: 280 },
    { size: 50, ms: 520 },
    { size: 75, ms: 890 },
    { size: 100, ms: 1400 },
  ],
  hybrid: [
    { size: 10, ms: 180 },
    { size: 25, ms: 420 },
    { size: 50, ms: 780 },
    { size: 75, ms: 1320 },
    { size: 100, ms: 2100 },
  ],
  envelope: { minSize: 10, maxSize: 75, maxMs: 1200 },
  notes: [
    "Problem size = task count for scheduling; stop count for routing.",
    "Hybrid curve includes bounded QAOA on research-sized candidates only.",
    "Production jobs above the envelope should shard or pre-filter constraints.",
  ],
} as const;

export const interferenceCellDetails: Record<
  string,
  { pair: string; pressure: string; resolution: string }
> = {
  "Schedule-Crew": {
    pair: "Schedule × Crew",
    pressure: "Crew capacity binds multiple tasks on the same timeline.",
    resolution: "Resequence or shift tasks to non-overlapping crew windows.",
  },
  "Schedule-Window": {
    pair: "Schedule × Window",
    pressure: "Hard windows compress feasible start times.",
    resolution: "Push violating tasks past blocked windows before rank.",
  },
  "Schedule-Dependency": {
    pair: "Schedule × Dependency",
    pressure: "Precedence chains propagate delay through the graph.",
    resolution: "Topological ordering with slack on non-critical paths.",
  },
  "Schedule-Cost": {
    pair: "Schedule × Cost",
    pressure: "Overtime and idle-time penalties compete with duration.",
    resolution: "Objective weights trade delay risk against labor cost.",
  },
  "Routing-Crew": {
    pair: "Routing × Crew",
    pressure: "Vehicle capacity and driver shifts limit stop order.",
    resolution: "Reassign stops or split routes across fleet units.",
  },
  "Routing-Window": {
    pair: "Routing × Window",
    pressure: "Delivery windows dominate stop sequencing.",
    resolution: "Time-window insertion before cost minimization.",
  },
  "Routing-Dependency": {
    pair: "Routing × Dependency",
    pressure: "Pickup-before-delivery pairs fix partial order.",
    resolution: "Precedence constraints encoded before route search.",
  },
  "Routing-Cost": {
    pair: "Routing × Cost",
    pressure: "Mileage and time-on-road drive the objective.",
    resolution: "Classical TSP/VRP heuristic with window penalties.",
  },
  "Allocation-Crew": {
    pair: "Allocation × Crew",
    pressure: "Skill mix and certification limit who can cover a shift.",
    resolution: "Filter roster by hard skill tags before ranking.",
  },
  "Allocation-Window": {
    pair: "Allocation × Window",
    pressure: "Coverage targets bind across shift boundaries.",
    resolution: "Slack variables on soft coverage with hard minimums.",
  },
  "Allocation-Dependency": {
    pair: "Allocation × Dependency",
    pressure: "Handoff and continuity rules link consecutive shifts.",
    resolution: "Chain constraints between assignment variables.",
  },
  "Allocation-Cost": {
    pair: "Allocation × Cost",
    pressure: "Overtime and utilization caps fight coverage goals.",
    resolution: "Weighted objective: coverage first, cost second.",
  },
} as const;

export const glossaryEntries = [
  {
    quantum: "Superposition",
    quantumMeaning: "many feasible plans coexist before we choose",
    engineering: "Feasible candidate set",
    engineeringMeaning: "All schedules/routes/staffing plans that pass hard constraints.",
  },
  {
    quantum: "Amplitude",
    quantumMeaning: "weight of a candidate plan in the ranking",
    engineering: "Ranking score",
    engineeringMeaning: "Normalized objective weight used to order survivors.",
  },
  {
    quantum: "Interference",
    quantumMeaning: "constraints reinforcing or canceling each other",
    engineering: "Constraint conflict",
    engineeringMeaning: "Two or more rules that cannot all be satisfied at peak pressure.",
  },
  {
    quantum: "Entanglement",
    quantumMeaning: "decisions that cannot be made independently",
    engineering: "Coupled assignments",
    engineeringMeaning: "Task-crew or shift-skill pairs that must be decided together.",
  },
  {
    quantum: "Collapse",
    quantumMeaning: "selecting the executable plan from candidates",
    engineering: "Plan selection",
    engineeringMeaning: "The single plan returned after ranking and method comparison.",
  },
  {
    quantum: "Measurement",
    quantumMeaning: "the metric your team already tracks",
    engineering: "Operational KPI",
    engineeringMeaning: "Duration, violations, savings — fields in the API response.",
  },
  {
    quantum: "Coherence",
    quantumMeaning: "an executable plan that respects all hard constraints",
    engineering: "Feasibility guarantee",
    engineeringMeaning: "Zero hard-constraint violations in the returned plan.",
  },
  {
    quantum: "Decoherence",
    quantumMeaning: "what happens when hard constraints break the plan in production",
    engineering: "Constraint drift",
    engineeringMeaning: "Live inputs change after solve; API returns infeasibility or re-solve signal.",
  },
] as const;

export const decoherenceModes = [
  {
    title: "Hard constraint becomes infeasible",
    symptom: "No assignment satisfies crew, window, and precedence together.",
    response: 'status: "infeasible", violations[] with constraint ids',
  },
  {
    title: "Objective ties",
    symptom: "Multiple survivors share the same objective within tolerance.",
    response: "classical plan selected; alternates listed in ranked[] if requested",
  },
  {
    title: "Solver budget exhausted",
    symptom: "CP-SAT hits time limit before optimality proof.",
    response: "best feasible plan so far + details.solver_status: TIME_LIMIT",
  },
  {
    title: "Method disagrees",
    symptom: "QAOA candidate loses to classical baseline on objective.",
    response: 'method: "classical"; hybrid path logged in details only',
  },
] as const;

export const jsonContractCallouts = {
  request: [
    { line: 2, label: "type", detail: "schedule | routing | allocation" },
    { line: 3, label: "tasks", detail: "Jobs with duration, crew, and optional windows" },
    { line: 8, label: "constraints", detail: "Hard rules in plain text or structured form" },
  ],
  response: [
    { line: 2, label: "status", detail: "success | infeasible | partial" },
    { line: 3, label: "summary", detail: "Plain-English why the plan works" },
    { line: 5, label: "solution", detail: "Executable assignments your team runs" },
    { line: 10, label: "metrics", detail: "Duration, violations, savings estimate" },
    { line: 15, label: "method", detail: "classical | hybrid — honest method label" },
    { line: 16, label: "details", detail: "Solver backend, seed, and audit trace" },
  ],
} as const;

export const methodologyCrossRef = hospitalMethodologyCopy.solver.items;
