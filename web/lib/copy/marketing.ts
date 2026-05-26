import { quantumLexicon } from "@/lib/copy/voice";

const {
  amplitude,
  coherence,
  entanglement,
  interference,
  measurement,
  observables,
  phase,
  superposition,
} = quantumLexicon;

export const problemPoints = [
  {
    eyebrow: entanglement.label,
    description:
      "Scheduling is still manual and fragmented across teams, tools, and spreadsheets when decisions cannot be made independently.",
  },
  {
    eyebrow: interference.label,
    description:
      "Routing decisions become inefficient when windows, capacity, and changing conditions push against each other in real time.",
  },
  {
    eyebrow: phase.label,
    description:
      "Most optimization software is difficult to integrate into existing operations systems because the workflow breaks across handoffs.",
  },
  {
    eyebrow: superposition.label,
    description:
      "Generic AI tools can summarize data, but they do not reliably compare the many feasible plans inside a constraint-heavy combinatorial problem.",
  },
] as const;

export const solutionPoints = [
  {
    eyebrow: observables.label,
    description:
      "Start with the fields your team already tracks: tasks, crews, windows, vehicles, shifts, and hard business rules.",
  },
  {
    eyebrow: entanglement.label,
    description:
      "Qtangl turns that context into one planning job instead of making teams coordinate spreadsheets and tribal knowledge across disconnected decisions.",
  },
  {
    eyebrow: amplitude.label,
    description:
      "The platform evaluates feasible options and returns the best plan with a plain-English summary of why it works.",
  },
  {
    eyebrow: measurement.label,
    description:
      "Developers can integrate one API, while operations teams can review visuals and metrics before acting.",
  },
] as const;

export const workflowSteps = [
  {
    eyebrow: "Phase 1",
    title: "Prepare the planning state",
    description:
      "Send the tasks, crews, locations, windows, and business rules you already track.",
  },
  {
    eyebrow: "Phase 2",
    title: "Search the feasible space",
    description:
      "Qtangl prepares the problem, checks the hard constraints, and ranks the best valid options.",
  },
  {
    eyebrow: "Phase 3",
    title: "Collapse to one plan",
    description:
      "Receive a ranked plan, a short summary, and the metrics your team already cares about.",
  },
] as const;

export const platformHighlights = [
  {
    eyebrow: phase.label,
    title: "API-first delivery",
    description:
      "Integrate optimization into the systems teams already use for field operations, dispatching, or planning.",
  },
  {
    eyebrow: coherence.label,
    title: "Constraint-aware outputs",
    description:
      "Priorities, deadlines, dependencies, and capacity limits remain part of the optimization problem.",
  },
  {
    eyebrow: measurement.label,
    title: "Operational clarity",
    description:
      "Outputs are returned as practical schedules and plans rather than research artifacts.",
  },
] as const;

export const useCases = [
  {
    eyebrow: "Construction",
    title: "Construction scheduling optimization",
    image: "/qtangl-usecase-scheduling.svg",
    imageAlt:
      "Black and white scheduling illustration showing crews, task sequencing, and an interference pattern across constrained work windows.",
    description:
      "Coordinate crews, equipment, and site dependencies without rebuilding the plan manually every time conditions change.",
    problem:
      "Project managers juggle trade sequencing, inspection windows, and resource conflicts across multiple jobs.",
    interference:
      "Trade sequencing, inspection windows, and crew availability all interfere with the same timeline.",
    outcome:
      "Qtangl returns a feasible schedule that respects precedence, crew availability, and time windows.",
    value:
      "Reduce idle crews, cut delay risk, and improve schedule confidence before work starts.",
  },
  {
    eyebrow: "Logistics",
    title: "Logistics routing optimization",
    image: "/qtangl-usecase-routing.svg",
    imageAlt:
      "Black and white routing illustration showing dispatching, route maps, and a dense interference pattern across delivery windows.",
    description:
      "Balance delivery windows, fleet capacity, and route efficiency with a single routing workflow.",
    problem:
      "Dispatch teams must react quickly to traffic, customer windows, and capacity constraints.",
    interference:
      "Customer windows, vehicle capacity, and route timing interfere with each stop order decision.",
    outcome:
      "Qtangl returns optimized route plans with stop order, assignment, and estimated cost.",
    value:
      "Lower miles traveled, improve on-time delivery, and increase fleet utilization.",
  },
  {
    eyebrow: "Operations",
    title: "Workforce allocation optimization",
    image: "/qtangl-usecase-allocation.svg",
    imageAlt:
      "Black and white allocation illustration showing staffing grids, operational planning overlays, and coherence across shift assignments.",
    description:
      "Match the right people and resources to the right jobs while respecting availability and skill constraints.",
    problem:
      "Schedulers often rely on tribal knowledge to assign labor across shifting demand and limited capacity.",
    interference:
      "Skill fit, fatigue rules, and coverage targets interfere with every staffing decision.",
    outcome:
      "Qtangl ranks staffing plans that fit required skills, coverage targets, and utilization limits.",
    value:
      "Improve coverage quality, reduce overtime, and make staffing decisions faster.",
  },
] as const;

export const docsCards = [
  {
    title: "Data formats",
    description:
      "See the exact fields that shape the planning state before you touch the API.",
    href: "/docs/data-formats",
  },
  {
    title: "Quickstart",
    description:
      "Submit your first optimization request and inspect the returned summary, measurements, and solution shape in minutes.",
    href: "/docs/quickstart",
  },
  {
    title: "Core concepts",
    description:
      "Learn how Qtangl models scheduling, routing, allocation, and hybrid execution without hiding the quantum vocabulary.",
    href: "/docs/concepts",
  },
  {
    title: "API guide",
    description:
      "Review authentication, rate limits, and the `/optimize` workflow with clear method honesty for pilot integration.",
    href: "/docs/api",
  },
] as const;

export const blogPosts = [
  {
    slug: "quantum-optimization",
    href: "/blog/quantum-optimization",
    category: "Quantum-forward thinking",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt:
      "Black and white abstract technology illustration showing solver workflow panels, network geometry, and a layered hybrid stack.",
    title: "Why operations teams need a quantum lens on planning",
    excerpt:
      "A brand-quantum introduction to superposition, QUBO, QAOA, and why hybrid workflows matter more than hype.",
    description:
      "Learn how Qtangl frames optimization problems and where quantum-assisted search fits inside an honest classical-first stack.",
  },
  {
    slug: "scheduling-use-cases",
    href: "/blog/scheduling-use-cases",
    category: "Interference in scheduling",
    coverImage: "/qtangl-usecase-scheduling.svg",
    coverAlt:
      "Black and white scheduling illustration showing crews, planning boards, and entangled task sequencing.",
    title: "Scheduling is still an interference problem hiding in plain sight",
    excerpt:
      "Scheduling stays hard when teams, dependencies, and resource limits all collide at once.",
    description:
      "See how constraint-aware scheduling workflows improve project timelines and staffing quality when dependencies stay visible.",
  },
  {
    slug: "routing-optimization",
    href: "/blog/routing-optimization",
    category: "Observables in routing",
    coverImage: "/qtangl-usecase-routing.svg",
    coverAlt:
      "Black and white routing illustration showing dispatching, route maps, and network overlays with amplitude concentrated on the best path.",
    title: "Routing breaks when real-world constraints are treated like noise",
    excerpt:
      "The best route on paper often fails in production once windows, capacity, and changeovers appear.",
    description:
      "Explore a practical framework for building route plans that teams can actually execute when the real observables stay in view.",
  },
] as const;
