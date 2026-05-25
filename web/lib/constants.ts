export { footerBlurb, siteMetadata } from "@/lib/copy/product";

export const problemPoints = [
  "Scheduling is still manual and fragmented across teams, tools, and spreadsheets.",
  "Routing decisions become inefficient when constraints shift in real time.",
  "Most optimization software is difficult to integrate into existing operations systems.",
  "Generic AI tools can summarize data, but they do not reliably solve constraint-heavy combinatorial problems.",
] as const;

export const solutionPoints = [
  "Submit scheduling, routing, or allocation problems through a single API.",
  "Qtangl converts operational constraints into optimization-ready models.",
  "Hybrid execution combines classical orchestration with quantum-assisted search where it helps.",
  "Teams receive optimized plans they can review, compare, and act on quickly.",
] as const;

export const workflowSteps = [
  {
    title: "Define the problem",
    description:
      "Send jobs, locations, resources, and business constraints as structured JSON.",
  },
  {
    title: "Run hybrid optimization",
    description:
      "Qtangl prepares the model, runs the solver stack, and evaluates feasible plans.",
  },
  {
    title: "Return an action-ready plan",
    description:
      "Receive ranked schedules, routes, or allocations with method and cost metadata.",
  },
] as const;

export const platformHighlights = [
  {
    title: "API-first delivery",
    description:
      "Integrate optimization into the systems teams already use for field operations, dispatching, or planning.",
  },
  {
    title: "Constraint-aware outputs",
    description:
      "Priorities, deadlines, dependencies, and capacity limits remain part of the optimization problem.",
  },
  {
    title: "Operational clarity",
    description:
      "Outputs are returned as practical schedules and plans rather than research artifacts.",
  },
] as const;

export const useCases = [
  {
    eyebrow: "Construction",
    title: "Construction scheduling optimization",
    description:
      "Coordinate crews, equipment, and site dependencies without rebuilding the plan manually every time conditions change.",
    problem:
      "Project managers juggle trade sequencing, inspection windows, and resource conflicts across multiple jobs.",
    outcome:
      "Qtangl returns a feasible schedule that respects precedence, crew availability, and time windows.",
    value:
      "Reduce idle crews, cut delay risk, and improve schedule confidence before work starts.",
  },
  {
    eyebrow: "Logistics",
    title: "Logistics routing optimization",
    description:
      "Balance delivery windows, fleet capacity, and route efficiency with a single routing workflow.",
    problem:
      "Dispatch teams must react quickly to traffic, customer windows, and capacity constraints.",
    outcome:
      "Qtangl returns optimized route plans with stop order, assignment, and estimated cost.",
    value:
      "Lower miles traveled, improve on-time delivery, and increase fleet utilization.",
  },
  {
    eyebrow: "Operations",
    title: "Workforce allocation optimization",
    description:
      "Match the right people and resources to the right jobs while respecting availability and skill constraints.",
    problem:
      "Schedulers often rely on tribal knowledge to assign labor across shifting demand and limited capacity.",
    outcome:
      "Qtangl ranks staffing plans that fit required skills, coverage targets, and utilization limits.",
    value:
      "Improve coverage quality, reduce overtime, and make staffing decisions faster.",
  },
] as const;

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
  solution: [
    { task: "foundation", start: "2026-05-27T07:00:00Z" },
    { task: "framing", start: "2026-05-30T07:00:00Z" },
    { task: "inspection", start: "2026-06-03T09:00:00Z" },
  ],
  cost: 12,
  method: "hybrid-qaoa",
  backend: "ibm_quantum_simulator",
};

export const docsQuickstartRequest = {
  type: "scheduling",
  tasks: [
    { id: "A", duration: 3 },
    { id: "B", duration: 2 },
  ],
  constraints: ["A must happen before B"],
};

export const docsQuickstartResponse = {
  solution: [
    { task: "A", start: "09:00" },
    { task: "B", start: "12:00" },
  ],
  method: "hybrid-qaoa",
  backend: "ibm_quantum_simulator",
};

export const apiReferenceRequest = {
  type: "schedule | routing | allocation",
  data: {},
  constraints: [],
};

export const apiReferenceResponse = {
  status: "success",
  solution: {},
  cost: 12,
  method: "qaoa",
  backend: "ibm_qasm_simulator",
};

export const apiErrors = [
  "Invalid input",
  "Unsupported problem type",
  "Solver failure",
  "Timeout",
] as const;

export const docsCards = [
  {
    title: "Quickstart",
    description:
      "Submit your first optimization request and understand the response shape in minutes.",
    href: "/docs/quickstart",
  },
  {
    title: "Core concepts",
    description:
      "Learn how Qtangl models scheduling, routing, allocation, and hybrid execution.",
    href: "/docs/concepts",
  },
  {
    title: "API guide",
    description:
      "Review authentication, rate limits, and the `/optimize` workflow for MVP integration.",
    href: "/docs/api",
  },
] as const;

export const blogPosts = [
  {
    slug: "quantum-optimization",
    href: "/blog/quantum-optimization",
    category: "Quantum optimization basics",
    title: "Why quantum optimization matters for operational planning",
    excerpt:
      "A plain-English introduction to QUBO, QAOA, and why hybrid workflows matter more than hype.",
    description:
      "Learn how Qtangl frames optimization problems and where quantum-assisted search fits in the stack.",
  },
  {
    slug: "scheduling-use-cases",
    href: "/blog/scheduling-use-cases",
    category: "Scheduling use cases",
    title: "Construction and workforce scheduling are still wide-open problems",
    excerpt:
      "Scheduling stays hard when teams, dependencies, and resource limits all collide at once.",
    description:
      "See how constraint-aware scheduling workflows can improve project timelines and staffing quality.",
  },
  {
    slug: "routing-optimization",
    href: "/blog/routing-optimization",
    category: "Routing optimization",
    title: "Routing optimization breaks when real-world constraints are ignored",
    excerpt:
      "The best route on paper often fails in production once windows, capacity, and changeovers appear.",
    description:
      "Explore a practical framework for building route plans that teams can actually execute.",
  },
] as const;
