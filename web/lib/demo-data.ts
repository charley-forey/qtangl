export type DemoMetric = {
  label: string;
  value: string;
  note?: string;
};

export type ScheduleBlock = {
  id: string;
  label: string;
  resource: string;
  start: number;
  duration: number;
  note?: string;
};

export type RouteStop = {
  order: number;
  name: string;
  window: string;
  vehicle: string;
  note?: string;
};

export type StaffingAssignment = {
  person: string;
  shift: string;
  role: string;
  status?: string;
};

type VisualizationBase = {
  title: string;
  summary: string;
  explanation: string[];
  metrics: DemoMetric[];
};

export type ScheduleVisualization = VisualizationBase & {
  kind: "schedule";
  horizonLabel: string;
  blocks: ScheduleBlock[];
};

export type RouteVisualization = VisualizationBase & {
  kind: "routing";
  stops: RouteStop[];
};

export type StaffingVisualization = VisualizationBase & {
  kind: "allocation";
  shifts: string[];
  assignments: StaffingAssignment[];
};

export type PlanVisualization =
  | ScheduleVisualization
  | RouteVisualization
  | StaffingVisualization;

export type TryField = {
  label: string;
  value: string;
  help: string;
};

export type TryScenario = {
  id: "schedule" | "routing" | "allocation";
  label: string;
  title: string;
  description: string;
  fields: TryField[];
  apiRequest: Record<string, unknown>;
  apiResponse: Record<string, unknown>;
  plan: PlanVisualization;
};

export const tryScenarios: TryScenario[] = [
  {
    id: "schedule",
    label: "Construction schedule",
    title: "Rebuild a slipped construction schedule in seconds.",
    description:
      "A project manager needs to resequence work after a crew delay and still fit an inspection window.",
    fields: [
      {
        label: "Tasks",
        value: "Foundation, framing, inspection, hand-off",
        help: "List the work that needs to happen.",
      },
      {
        label: "Crews",
        value: "Crew A, Crew B, Inspector",
        help: "Name the teams or resources attached to each task.",
      },
      {
        label: "Hard rules",
        value: "Foundation before framing; inspection after framing",
        help: "State the dependencies that cannot break.",
      },
      {
        label: "Availability",
        value: "Crew B unavailable on day 2",
        help: "Add windows, outages, or blocked periods.",
      },
    ],
    apiRequest: {
      type: "schedule",
      tasks: [
        { id: "foundation", duration: 3, crew: "Crew A" },
        { id: "framing", duration: 4, crew: "Crew B" },
        { id: "inspection", duration: 1, crew: "Inspector" },
        { id: "handoff", duration: 1, crew: "Crew A" },
      ],
      constraints: [
        "foundation must finish before framing",
        "inspection must happen after framing",
        "handoff must happen after inspection",
        "Crew B unavailable on day 2",
      ],
    },
    apiResponse: {
      status: "success",
      summary:
        "All tasks fit with no crew conflicts. The inspection stays after framing and the hand-off still lands this week.",
      solution: [
        { task: "foundation", startDay: 1, endDay: 4 },
        { task: "framing", startDay: 4, endDay: 8 },
        { task: "inspection", startDay: 8, endDay: 9 },
        { task: "handoff", startDay: 9, endDay: 10 },
      ],
      metrics: {
        totalDurationDays: 9,
        constraintViolations: 0,
        savingsEstimate: "Approx. 6 idle crew hours avoided",
      },
      method: "hybrid",
      details: {
        solver: "cp-sat",
        backend: "simulator",
      },
    },
    plan: {
      kind: "schedule",
      title: "Ranked plan",
      summary:
        "The framing crew is pushed after the blocked day, and the inspection still lands in sequence.",
      explanation: [
        "The blocked Crew B window is respected before framing starts.",
        "Every dependency remains satisfied from foundation to hand-off.",
        "The plan avoids a manual reshuffle across the whole week.",
      ],
      metrics: [
        { label: "Plan duration", value: "9 days" },
        { label: "Constraint violations", value: "0" },
        { label: "Idle crew time saved", value: "6 hrs", note: "Estimate vs manual resequencing" },
      ],
      horizonLabel: "Project days",
      blocks: [
        { id: "foundation", label: "Foundation", resource: "Crew A", start: 0, duration: 3 },
        { id: "framing", label: "Framing", resource: "Crew B", start: 3, duration: 4, note: "Crew B blocked on day 2" },
        { id: "inspection", label: "Inspection", resource: "Inspector", start: 7, duration: 1 },
        { id: "handoff", label: "Hand-off", resource: "Crew A", start: 8, duration: 1 },
      ],
    },
  },
  {
    id: "routing",
    label: "Delivery routing",
    title: "Re-rank the delivery route when windows and capacity change.",
    description:
      "A dispatcher needs a simple route plan after a driver change and tight customer windows.",
    fields: [
      {
        label: "Stops",
        value: "Depot, Hospital, Office Park, Retail Hub",
        help: "List each stop in the order it could be visited.",
      },
      {
        label: "Vehicles",
        value: "Van 03, Van 07",
        help: "Include capacity or shift constraints if they matter.",
      },
      {
        label: "Windows",
        value: "Hospital before 10:00, Retail Hub after 11:30",
        help: "Add service windows that affect the route.",
      },
    ],
    apiRequest: {
      type: "routing",
      stops: [
        { id: "depot", serviceWindow: "08:00-08:15" },
        { id: "hospital", serviceWindow: "08:30-10:00" },
        { id: "office-park", serviceWindow: "09:00-11:00" },
        { id: "retail-hub", serviceWindow: "11:30-13:00" },
      ],
      vehicles: [{ id: "van-03", capacity: 12 }],
      constraints: ["hospital before office-park", "retail-hub after 11:30"],
    },
    apiResponse: {
      status: "success",
      summary:
        "The route keeps the hospital delivery inside the early window and delays the retail stop until the later slot opens.",
      solution: {
        assignments: [
          { vehicle: "Van 03", stopOrder: ["Depot", "Hospital", "Office Park", "Retail Hub"] },
        ],
      },
      metrics: {
        savingsEstimate: "Approx. 14 miles avoided versus the naive route",
        onTimeDeliveries: "4/4",
        capacityUtilization: "82%",
      },
      method: "classical",
      details: {
        solver: "heuristic",
        backend: "local",
      },
    },
    plan: {
      kind: "routing",
      title: "Route plan",
      summary:
        "The early hospital delivery stays first, then the office stop, then the later retail window.",
      explanation: [
        "Stop order is re-ranked around the customer windows.",
        "One vehicle handles the route without breaching capacity.",
        "The plan favors on-time completion over shortest-path guesswork.",
      ],
      metrics: [
        { label: "Estimated miles saved", value: "14 mi" },
        { label: "On-time windows", value: "4 / 4" },
        { label: "Capacity used", value: "82%" },
      ],
      stops: [
        { order: 1, name: "Depot", window: "08:00-08:15", vehicle: "Van 03" },
        { order: 2, name: "Hospital", window: "08:30-10:00", vehicle: "Van 03" },
        { order: 3, name: "Office Park", window: "09:00-11:00", vehicle: "Van 03" },
        { order: 4, name: "Retail Hub", window: "11:30-13:00", vehicle: "Van 03", note: "Held until the late window opened" },
      ],
    },
  },
  {
    id: "allocation",
    label: "Shift staffing",
    title: "Rank staffing options before overtime gets locked in.",
    description:
      "A workforce scheduler needs to cover a shift grid with the right skills and fewer overtime hours.",
    fields: [
      {
        label: "Shifts",
        value: "Morning, Swing, Night",
        help: "List the shifts that need coverage.",
      },
      {
        label: "People",
        value: "Alicia, Noah, Priya, Devin",
        help: "Include skills, certifications, and max hours.",
      },
      {
        label: "Coverage rules",
        value: "Two certified operators per day; no back-to-back night + morning",
        help: "State the requirements that must remain true.",
      },
    ],
    apiRequest: {
      type: "allocation",
      shifts: [
        { id: "morning", requiredSkill: "operator" },
        { id: "swing", requiredSkill: "operator" },
        { id: "night", requiredSkill: "lead" },
      ],
      staff: [
        { name: "Alicia", skills: ["operator", "lead"] },
        { name: "Noah", skills: ["operator"] },
        { name: "Priya", skills: ["operator"] },
        { name: "Devin", skills: ["lead"] },
      ],
      constraints: ["No back-to-back night and morning shifts", "Minimize overtime"],
    },
    apiResponse: {
      status: "success",
      summary:
        "Each shift is covered with the required skills and the schedule avoids back-to-back fatigue risk.",
      solution: {
        assignments: [
          { person: "Alicia", shift: "Morning", role: "Lead" },
          { person: "Noah", shift: "Swing", role: "Operator" },
          { person: "Priya", shift: "Morning", role: "Operator" },
          { person: "Devin", shift: "Night", role: "Lead" },
        ],
      },
      metrics: {
        savingsEstimate: "Approx. 4 overtime hours avoided",
        coverageScore: "100%",
        constraintViolations: 0,
      },
      method: "classical",
      details: {
        solver: "assignment",
        backend: "local",
      },
    },
    plan: {
      kind: "allocation",
      title: "Staffing plan",
      summary:
        "Coverage stays intact across all three shifts and the lead requirement is preserved without extra overtime.",
      explanation: [
        "Certified staff are placed where they satisfy the required skill mix.",
        "No one is assigned a back-to-back risky shift pattern.",
        "The ranked option keeps overtime lower than the naive schedule.",
      ],
      metrics: [
        { label: "Coverage score", value: "100%" },
        { label: "Overtime avoided", value: "4 hrs" },
        { label: "Constraint violations", value: "0" },
      ],
      shifts: ["Morning", "Swing", "Night"],
      assignments: [
        { person: "Alicia", shift: "Morning", role: "Lead" },
        { person: "Priya", shift: "Morning", role: "Operator" },
        { person: "Noah", shift: "Swing", role: "Operator" },
        { person: "Devin", shift: "Night", role: "Lead" },
      ],
    },
  },
];

export const dataFormatGuides = [
  {
    problemType: "schedule",
    title: "Scheduling inputs",
    intro:
      "Send the work that must happen, how long it takes, who performs it, and the rules that cannot break.",
    fields: [
      {
        name: "tasks[].id",
        meaning: "Short identifier for the work item.",
        example: "foundation",
      },
      {
        name: "tasks[].duration",
        meaning: "Estimated effort in whole planning units.",
        example: "3",
      },
      {
        name: "tasks[].crew",
        meaning: "Crew or resource assigned to the task.",
        example: "Crew B",
      },
      {
        name: "constraints[]",
        meaning: "Dependencies or blocked windows the final plan must satisfy.",
        example: "framing must happen after foundation",
      },
    ],
    csvColumns: ["task_id", "duration", "crew", "depends_on", "notes"],
  },
  {
    problemType: "routing",
    title: "Routing inputs",
    intro:
      "Send the stops to visit, vehicle capacity or shift limits, and any delivery windows that matter.",
    fields: [
      {
        name: "stops[].id",
        meaning: "Stop identifier or customer reference.",
        example: "hospital",
      },
      {
        name: "stops[].serviceWindow",
        meaning: "Time window the stop must respect.",
        example: "08:30-10:00",
      },
      {
        name: "vehicles[].capacity",
        meaning: "How much the route can carry.",
        example: "12",
      },
      {
        name: "constraints[]",
        meaning: "Operational rules like stop ordering or service timing.",
        example: "retail-hub after 11:30",
      },
    ],
    csvColumns: ["stop_id", "window_start", "window_end", "vehicle_id", "notes"],
  },
  {
    problemType: "allocation",
    title: "Allocation inputs",
    intro:
      "Send the shifts to cover, the people available, and the skill or fatigue rules you need to preserve.",
    fields: [
      {
        name: "shifts[].id",
        meaning: "Shift name or identifier.",
        example: "night",
      },
      {
        name: "staff[].skills",
        meaning: "Capabilities or certifications for each person.",
        example: "[\"operator\", \"lead\"]",
      },
      {
        name: "staff[].maxHours",
        meaning: "Work-hour ceiling to protect coverage quality.",
        example: "40",
      },
      {
        name: "constraints[]",
        meaning: "Rules like coverage minimums or no-back-to-back shifts.",
        example: "No back-to-back night and morning shifts",
      },
    ],
    csvColumns: ["person", "skill", "availability", "max_hours", "notes"],
  },
] as const;
