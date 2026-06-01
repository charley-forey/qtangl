export const pqcPreviewRequest = {
  target: "api.example.com",
  scan_type: "tls_inventory",
  options: {
    include_cbom: true,
    mosca_data_lifetime_years: 10,
  },
};

export const pqcPreviewResponse = {
  status: "completed",
  readiness_score: 62,
  findings: {
    quantum_vulnerable: 47,
    transitional: 12,
    quantum_safe: 8,
  },
  mosca: {
    hndl_risk: "elevated",
    data_lifetime_years: 10,
    quantum_timeline_years: 8,
  },
  exports: {
    cbom: "cyclonedx-json",
    report_url: "/r/sample-token",
    verify_url: "/verify?token=sample-token",
  },
  method: "pqc_scanner",
};

export const apiPreviewRequest = {
  type: "schedule",
  tasks: [
    { id: "foundation", duration: 3, crew: "Crew A" },
    { id: "framing", duration: 4, crew: "Crew B" },
    { id: "inspection", duration: 1, crew: "Inspector" },
  ],
  constraints: [
    "foundation must finish before framing",
    "inspection must occur after framing",
    "Crew B unavailable on day 2",
  ],
};

export const apiPreviewResponse = {
  status: "success",
  summary:
    "All 3 tasks fit without crew conflicts. Inspection stays after framing and the unavailable window for Crew B is respected.",
  solution: [
    { task: "foundation", start: "2026-05-27T07:00:00Z" },
    { task: "framing", start: "2026-05-30T07:00:00Z" },
    { task: "inspection", start: "2026-06-03T09:00:00Z" },
  ],
  metrics: {
    totalDurationDays: 8,
    constraintViolations: 0,
    savingsEstimate: "Approx. 6 idle crew hours avoided",
  },
  method: "hybrid",
  details: {
    solver: "classical",
    backend: "simulator",
  },
};

export const docsQuickstartRequest = {
  type: "schedule",
  tasks: [
    { id: "A", duration: 3 },
    { id: "B", duration: 2 },
  ],
  constraints: ["A must happen before B"],
};

export const docsQuickstartResponse = {
  status: "success",
  summary:
    "Task A finishes before Task B and the plan completes in 5 time units with no constraint violations.",
  solution: [
    { task: "A", startDay: 1, endDay: 4 },
    { task: "B", startDay: 4, endDay: 6 },
  ],
  metrics: {
    totalDurationDays: 5,
    constraintViolations: 0,
    savingsEstimate: "Approx. 2 hours of manual replanning avoided",
  },
  method: "classical",
  details: {
    solver: "cp-sat",
    backend: "local",
  },
};

export const apiReferenceRequest = {
  type: "schedule | routing | allocation",
  data: {},
  constraints: [],
};

export const apiReferenceResponse = {
  status: "success",
  summary: "All tasks scheduled with no conflicts and one ranked plan returned.",
  solution: {},
  metrics: {
    totalCost: 12,
    constraintViolations: 0,
    savingsEstimate: "Approx. 6 idle crew hours avoided",
  },
  method: "hybrid",
  details: {
    solver: "qaoa",
    backend: "simulator",
  },
};

export const apiErrors = [
  "Add the required tasks or resources so Qtangl can evaluate the job.",
  "This pilot currently supports schedule, routing, and allocation workflows only.",
  "No feasible plan was found with the current constraints. Adjust the inputs and try again.",
  "The job took too long to finish. Submit a smaller problem or retry the request.",
] as const;
