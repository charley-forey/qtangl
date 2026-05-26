export const problemPoints = [
  "Scheduling is still manual and fragmented across teams, tools, and spreadsheets.",
  "Routing decisions become inefficient when constraints shift in real time.",
  "Most optimization software is difficult to integrate into existing operations systems.",
  "Generic AI tools can summarize data, but they do not reliably solve constraint-heavy combinatorial problems.",
] as const;

export const solutionPoints = [
  "Start with the fields your team already tracks: tasks, crews, windows, vehicles, shifts, and hard business rules.",
  "Qtangl turns that context into one planning job instead of making teams coordinate spreadsheets and tribal knowledge.",
  "The platform evaluates feasible options and returns the best plan with a plain-English summary of why it works.",
  "Developers can integrate one API, while operations teams can review visuals and metrics before acting.",
] as const;

export const workflowSteps = [
  {
    title: "Describe the situation",
    description:
      "Send the tasks, crews, locations, windows, and business rules you already track.",
  },
  {
    title: "Evaluate feasible plans",
    description:
      "Qtangl prepares the problem, checks the hard constraints, and ranks the best valid options.",
  },
  {
    title: "Review and act",
    description:
      "Receive a ranked plan, a short summary, and the metrics your team already cares about.",
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
    image: "/qtangl-usecase-scheduling.svg",
    imageAlt:
      "Black and white scheduling illustration showing crews, planning boards, and task sequencing.",
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
    image: "/qtangl-usecase-routing.svg",
    imageAlt:
      "Black and white routing illustration showing dispatching, route maps, and network overlays.",
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
    image: "/qtangl-usecase-allocation.svg",
    imageAlt:
      "Black and white allocation illustration showing staffing grids and operational planning overlays.",
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

export const docsCards = [
  {
    title: "Data formats",
    description:
      "See the exact fields to send for schedules, routes, and staffing inputs before you touch the API.",
    href: "/docs/data-formats",
  },
  {
    title: "Quickstart",
    description:
      "Submit your first optimization request and understand the summary, metrics, and solution shape in minutes.",
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
      "Review authentication, rate limits, and the `/optimize` workflow for pilot integration.",
    href: "/docs/api",
  },
] as const;

export const blogPosts = [
  {
    slug: "quantum-optimization",
    href: "/blog/quantum-optimization",
    category: "Quantum optimization basics",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt:
      "Black and white abstract technology illustration showing solver workflow panels and network geometry.",
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
    coverImage: "/qtangl-usecase-scheduling.svg",
    coverAlt:
      "Black and white scheduling illustration showing crews, planning boards, and task sequencing.",
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
    coverImage: "/qtangl-usecase-routing.svg",
    coverAlt:
      "Black and white routing illustration showing dispatching, route maps, and network overlays.",
    title: "Routing optimization breaks when real-world constraints are ignored",
    excerpt:
      "The best route on paper often fails in production once windows, capacity, and changeovers appear.",
    description:
      "Explore a practical framework for building route plans that teams can actually execute.",
  },
] as const;
