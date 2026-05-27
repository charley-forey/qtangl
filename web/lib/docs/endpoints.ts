import {
  apiPreviewRequest,
  apiPreviewResponse,
  docsQuickstartRequest,
  docsQuickstartResponse,
} from "@/lib/copy/api-examples";

import type { DocsEndpoint } from "@/lib/docs/types";

const optimizeRequestFields = [
  {
    name: "type",
    type: "string",
    required: true,
    description: "Problem family: schedule, scheduling (alias), routing, or allocation.",
    example: "schedule",
  },
  {
    name: "tasks[]",
    type: "ScheduleTaskInput[]",
    required: false,
    description: "Work items for scheduling problems.",
    example: '{ "id": "A", "duration": 3, "crew": "Crew A" }',
  },
  {
    name: "constraints[]",
    type: "string[]",
    required: false,
    description: "Hard rules the plan must satisfy (dependencies, blocked windows).",
    example: '"A must happen before B"',
  },
  {
    name: "stops[]",
    type: "RoutingStopInput[]",
    required: false,
    description: "Stops for routing problems.",
    example: '{ "id": "hospital", "serviceWindow": "08:30-10:00" }',
  },
  {
    name: "vehicles[]",
    type: "VehicleInput[]",
    required: false,
    description: "Fleet units and capacity for routing.",
  },
  {
    name: "shifts[]",
    type: "ShiftInput[]",
    required: false,
    description: "Shifts to cover for allocation problems.",
  },
  {
    name: "staff[]",
    type: "StaffInput[]",
    required: false,
    description: "People, skills, and hour limits for allocation.",
  },
  {
    name: "data",
    type: "object",
    required: false,
    description: "Extension bag for forward-compatible fields.",
    example: "{}",
  },
] as const;

const optimizeResponseFields = [
  {
    name: "status",
    type: '"success"',
    required: true,
    description: "Job completed with a feasible plan.",
  },
  {
    name: "summary",
    type: "string",
    required: true,
    description: "Plain-English explanation for operators.",
  },
  {
    name: "solution",
    type: "array | object",
    required: true,
    description: "Executable plan: task timeline, route assignments, or staffing grid.",
  },
  {
    name: "metrics",
    type: "object",
    required: true,
    description: "constraintViolations, savingsEstimate, and problem-specific KPIs.",
  },
  {
    name: "method",
    type: '"classical" | "hybrid"',
    required: true,
    description: "Honest solver path label.",
  },
  {
    name: "details",
    type: "object",
    required: true,
    description: "solver, backend, and diagnostics for engineering review.",
  },
  {
    name: "visualization",
    type: "object | null",
    required: false,
    description: "Optional UI-friendly timeline or grid payload.",
  },
] as const;

export const docsEndpoints: Record<string, DocsEndpoint> = {
  optimize: {
    id: "optimize",
    method: "POST",
    path: "/optimize",
    status: "ga",
    title: "POST /optimize",
    summary:
      "Submit a schedule, route, or staffing problem and receive a ranked plan with summary, metrics, and method details.",
    auth: true,
    rateLimit: "120 requests per minute per API key (default)",
    requestFields: [...optimizeRequestFields],
    responseFields: [...optimizeResponseFields],
    errors: [401, 422, 429, 500, 501],
    examples: [
      {
        label: "Quickstart schedule",
        request: docsQuickstartRequest,
        response: docsQuickstartResponse,
      },
      {
        label: "Construction schedule",
        request: apiPreviewRequest,
        response: apiPreviewResponse,
      },
    ],
    notes: [
      "Live solver path: schedule only. Routing and allocation return 501 until parsers and solvers ship.",
      "Classical CP-SAT baseline runs on every schedule job. Hybrid QAOA is bounded and optional.",
    ],
  },
  health: {
    id: "health",
    method: "GET",
    path: "/health",
    status: "ga",
    title: "GET /health",
    summary: "Liveness probe for uptime monitors and deployment readiness checks.",
    auth: false,
    responseFields: [
      {
        name: "status",
        type: '"ok"',
        required: true,
        description: "Service is accepting traffic.",
      },
    ],
    examples: [
      {
        label: "Health check",
        response: { status: "ok" },
      },
    ],
  },
  "hospital-roster": {
    id: "hospital-roster",
    method: "GET",
    path: "/hospital/roster",
    status: "pilot",
    title: "GET /hospital/roster",
    summary: "Load the bundled hospital roster fixture for the re-staffing demo.",
    auth: true,
    responseFields: [
      {
        name: "roster",
        type: "NurseRecord[]",
        required: true,
        description: "Nurses with skills, certifications, and availability metadata.",
      },
    ],
    examples: [
      {
        label: "Fixture roster",
        response: { status: "success", summary: "Hospital roster fixture loaded.", roster: [] },
      },
    ],
  },
  "hospital-scenarios": {
    id: "hospital-scenarios",
    method: "GET",
    path: "/hospital/scenarios",
    status: "pilot",
    title: "GET /hospital/scenarios",
    summary: "List available call-out scenarios for the hospital demo.",
    auth: true,
    responseFields: [
      {
        name: "scenarios",
        type: "Scenario[]",
        required: true,
        description: "Scenario id, title, and call-out metadata.",
      },
    ],
    examples: [
      {
        label: "Scenario catalog",
        response: { status: "success", scenarios: [] },
      },
    ],
  },
  "hospital-callout": {
    id: "hospital-callout",
    method: "GET",
    path: "/hospital/callout",
    status: "pilot",
    title: "GET /hospital/callout",
    summary: "Fetch a scenario call-out event by scenarioId query parameter.",
    auth: true,
    queryParams: [
      {
        name: "scenarioId",
        type: "string",
        required: false,
        default: "callout-cath-acls",
        description: "Scenario identifier from /hospital/scenarios.",
      },
    ],
    responseFields: [
      {
        name: "callOut",
        type: "CallOutEvent",
        required: true,
        description: "Nurse call-out details for the selected scenario.",
      },
    ],
    examples: [
      {
        label: "Default scenario",
        response: { status: "success", callOut: {}, scenario: {} },
      },
    ],
  },
  "hospital-qpu-trace": {
    id: "hospital-qpu-trace",
    method: "GET",
    path: "/hospital/qpu-trace",
    status: "pilot",
    title: "GET /hospital/qpu-trace",
    summary: "Return cached QPU trace metadata for hybrid audit storytelling in the demo.",
    auth: true,
    responseFields: [
      {
        name: "trace",
        type: "QpuTrace",
        required: true,
        description: "Simulator or hardware trace replay for the scoreboard.",
      },
    ],
    examples: [
      {
        label: "Trace replay",
        response: { status: "success", trace: {} },
      },
    ],
  },
  "hospital-upload-roster": {
    id: "hospital-upload-roster",
    method: "POST",
    path: "/hospital/upload-roster",
    status: "pilot",
    title: "POST /hospital/upload-roster",
    summary: "Upload a CSV roster and receive a 24-hour session id for solves.",
    auth: true,
    requestFields: [
      {
        name: "file",
        type: "multipart/form-data (CSV)",
        required: true,
        description: "Roster CSV matching the template columns in the hospital guide.",
      },
    ],
    responseFields: [
      {
        name: "sessionId",
        type: "string",
        required: true,
        description: "Pass as rosterSessionId on /hospital/callout/solve.",
      },
    ],
    examples: [
      {
        label: "Upload response",
        response: {
          status: "success",
          sessionId: "sess_…",
          summary: "Validated 42 nurses and stored the roster in a 24-hour session.",
        },
      },
    ],
  },
  "hospital-callout-solve": {
    id: "hospital-callout-solve",
    method: "POST",
    path: "/hospital/callout/solve",
    status: "pilot",
    title: "POST /hospital/callout/solve",
    summary:
      "Run the hospital re-staffing pipeline: classical baseline, hybrid audit, scoreboard, and timeline.",
    auth: true,
    requestFields: [
      {
        name: "scenarioId",
        type: "string",
        required: false,
        default: "callout-cath-acls",
        description: "Scenario to simulate.",
      },
      {
        name: "useFixture",
        type: "boolean",
        required: false,
        default: "true",
        description: "Use bundled fixture data when true.",
      },
      {
        name: "rosterSessionId",
        type: "string",
        required: false,
        description: "Session from upload-roster; overrides fixture roster when set.",
      },
      {
        name: "seed",
        type: "integer",
        required: false,
        default: "1234",
        description: "Reproducibility seed for research comparisons.",
      },
    ],
    responseFields: [
      {
        name: "scoreboard",
        type: "Scoreboard",
        required: true,
        description: "Buyer-facing KPIs and method comparison.",
      },
      {
        name: "classicalCandidate",
        type: "CandidatePlan",
        required: true,
        description: "CP-SAT baseline plan.",
      },
      {
        name: "hybridCandidates",
        type: "CandidatePlan[]",
        required: true,
        description: "Bounded QAOA alternates when eligible.",
      },
      {
        name: "auditPacks",
        type: "AuditPack[]",
        required: true,
        description: "Traceable decision artifacts.",
      },
    ],
    examples: [
      {
        label: "Solve payload",
        request: {
          scenarioId: "callout-cath-acls",
          useFixture: true,
          seed: 1234,
        },
        response: {
          status: "success",
          scoreboard: {},
          classicalCandidate: {},
          hybridCandidates: [],
        },
      },
    ],
  },
};

export function getEndpoint(id: string): DocsEndpoint | undefined {
  return docsEndpoints[id];
}
