import { quantumLexicon } from "@/lib/copy/voice";
import { readinessBlogPostsForIndex } from "@/lib/copy/readiness-content-registry";

const {
  coherence,
  collapse,
  interference,
  measurement,
  phase,
  superposition,
} = quantumLexicon;

export const quantumWorkflowPoints = [
  {
    eyebrow: superposition.label,
    title: "See feasible plans before you commit",
    description:
      "Schedules, routes, and shifts — every valid option, ranked.",
  },
  {
    eyebrow: interference.label,
    title: "See where constraints collide",
    description:
      "Windows, capacity, and dependencies fight the same timeline.",
  },
  {
    eyebrow: collapse.label,
    title: "Run the plan that wins",
    description:
      "Hard rules respected. Best objective wins. Auditable why.",
  },
] as const;

export const workflowSteps = [
  {
    eyebrow: "Phase 1",
    title: "Send the planning state",
    description:
      "Tasks, crews, windows, vehicles, shifts, and hard rules you already track.",
  },
  {
    eyebrow: "Phase 2",
    title: "Search and rank",
    description:
      "Qtangl checks hard constraints and ranks the strongest feasible options.",
  },
  {
    eyebrow: "Phase 3",
    title: "Collapse to one plan",
    description:
      "Ranked plan, short summary, and the metrics that matter to your team.",
  },
] as const;

export const platformHighlights = [
  {
    eyebrow: phase.label,
    title: "API-first",
    description:
      "Drop optimization into dispatch, field ops, or planning systems you already run.",
  },
  {
    eyebrow: coherence.label,
    title: "Constraint-aware",
    description:
      "Deadlines, dependencies, and capacity stay inside the problem — not bolted on after.",
  },
  {
    eyebrow: measurement.label,
    title: "Operational output",
    description:
      "Schedules and routes your team can run — not research artifacts.",
  },
] as const;

export const useCases = [
  {
    eyebrow: "Aviation",
    title: "Airline crew recovery",
    image: "/qtangl-usecase-scheduling.svg",
    imageAlt:
      "Black and white operations illustration showing flight legs, crew assignments, and an interference pattern across a disrupted schedule.",
    description:
      "Rebuild legal crew assignments when a disruption cascades — without grounding the operation.",
    interference:
      "Tail routing, FAR 117 legality, and crew availability collide across every delayed leg.",
    outcome:
      "Feasible recovery plan with legal crew assignments and zero hard-rule violations.",
    measurement: "Fewer cancellations · faster recovery · auditable FAR 117 compliance",
    demoHref: "/demo/airline",
    demoStatus: "live",
  },
  {
    eyebrow: "Logistics",
    title: "Logistics routing",
    image: "/qtangl-usecase-routing.svg",
    imageAlt:
      "Black and white routing illustration showing dispatching, route maps, and a dense interference pattern across delivery windows.",
    description:
      "Re-route when a driver drops or windows tighten — without guessing stop order.",
    interference:
      "Customer windows, vehicle capacity, and stop timing fight every reorder decision.",
    outcome:
      "Optimized stop order, assignments, and cost estimate your dispatchers can run.",
    measurement: "Fewer miles · better on-time delivery · higher fleet utilization",
    demoHref: "/demo/ev-fleet",
    demoStatus: "live",
  },
  {
    eyebrow: "Operations",
    title: "Workforce allocation",
    image: "/qtangl-usecase-allocation.svg",
    imageAlt:
      "Black and white allocation illustration showing staffing grids, operational planning overlays, and coherence across shift assignments.",
    description:
      "Cover shifts with the right skills when demand spikes or someone calls out.",
    interference:
      "Skill fit, fatigue rules, and coverage targets collide on every assignment.",
    outcome:
      "Ranked staffing plans that hit skills, coverage, and utilization limits.",
    measurement: "Better coverage · less overtime · faster staffing decisions",
    demoHref: "/demo/hospital",
    demoStatus: "live",
  },
] as const;

export const pqcDocsCards = [
  {
    title: "PQC demo guide",
    description: "Live scan workflow, scenarios, CBOM export, and verify links.",
    href: "/docs/guides/pqc-demo",
  },
  {
    title: "PQC API reference",
    description: "Scan, inventory, report, and standards endpoints.",
    href: "/docs/reference/pqc/scan",
  },
  {
    title: "Standards mapping",
    description: "NSM-10, CNSA 2.0, NIST IR 8547, and framework crosswalk.",
    href: "/docs/reference/pqc/standards",
  },
  {
    title: "Q-Day hub",
    description: "HNDL, Mosca inequality, deadlines, and CBOM education.",
    href: "/q-day",
  },
] as const;

export const docsCards = [
  {
    title: "Data formats",
    description: "PQC scan payloads, CycloneDX CBOM exports, ingest shapes, and webhook fields.",
    href: "/docs/data-formats",
  },
  {
    title: "Quickstart",
    description: "First request in minutes — summary, measurements, and solution shape.",
    href: "/docs/quickstart",
  },
  {
    title: "Core concepts",
    description: "Assess, Monitor, Convert, HNDL, CBOM, signed evidence, and method honesty.",
    href: "/docs/concepts",
  },
  {
    title: "API guide",
    description: "Auth, rate limits, and `/optimize` with classical-first method honesty.",
    href: "/docs/api",
  },
] as const;

export const blogPosts = [
  {
    slug: "q-day-readiness",
    href: "/blog/q-day-readiness",
    category: "Q-Day readiness",
    coverImage: "/qtangl-pqc-scanner-cover.svg",
    coverAlt: "Cryptographic inventory dashboard with readiness score and TLS endpoints.",
    title: "Q-Day readiness in 10 minutes: what a live PQC scan actually shows",
    excerpt: "Inventory, Mosca HNDL, CBOM export, and signed verify — not another spreadsheet.",
    description:
      "Walk through the Q-Day scanner demo: baseline inventory, framework mapping, and evidence your auditors can check independently.",
    readiness: true,
    hndl: true,
  },
  {
    slug: "convert-verify-workflow",
    href: "/blog/convert-verify-workflow",
    category: "Convert",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt: "Remediation board with verify-fix workflow.",
    title: "Closing the loop: verify-fix in Convert",
    excerpt: "Attach re-scan proof to remediation items and export live workflowStatus.",
    description: "How security teams prove fixes with verification scans and signed exports.",
    readiness: true,
  },
  {
    slug: "pqc-deadlines-2029",
    href: "/blog/pqc-deadlines-2029",
    category: "Q-Day readiness",
    coverImage: "/qtangl-pqc-deadlines-cover.svg",
    coverAlt: "Post-quantum compliance deadline matrix for NSM-10, CNSA 2.0, and NIST IR 8547.",
    title: "PQC deadlines in 2029 and beyond: what CISOs should track",
    excerpt: "Google and Cloudflare accelerated to 2029 — map frameworks to your inventory tiers.",
    description:
      "Industry timeline shifts, federal deadlines, ECC-before-RSA nuance, and a 90-day action checklist.",
    readiness: true,
  },
  {
    slug: "pqc-inventory-in-10-minutes",
    href: "/blog/pqc-inventory-in-10-minutes",
    category: "Q-Day readiness",
    coverImage: "/qtangl-pqc-scanner-cover.svg",
    coverAlt: "PQC scanner dashboard with TLS endpoints and readiness score.",
    title: "PQC inventory in 10 minutes: what a live scan actually shows",
    excerpt: "Endpoints, algorithm tags, CBOM export, and signed verify — not another spreadsheet.",
    description:
      "Walk through the Qtangl PQC demo: baseline inventory, framework mapping, and evidence auditors can verify.",
    readiness: true,
  },
  ...readinessBlogPostsForIndex(),
  {
    slug: "when-classical-wins",
    href: "/blog/when-classical-wins",
    category: "Labs · Validation",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt: "Benchmark table illustration with classical and hybrid solver columns.",
    title: "When classical wins: honest benchmark results",
    excerpt: "BM-001–BM-006 committed results — including QAOA failures.",
    description:
      "Why we publish failures, how Track C2 success metric works, and what hybrid is actually for.",
    labs: true,
  },
  {
    slug: "airline-recovery",
    href: "/blog/airline-recovery",
    category: "Labs · Aviation operations",
    coverImage: "/use-case-workforce.png",
    coverAlt:
      "Operations control center illustration with flight boards and crew recovery overlays.",
    title: "OCC crew recovery: multi-leg rebid with auditable hybrid alternates",
    excerpt:
      "MX hold → tail routing → CP-SAT crew assignment → hybrid recovery plans.",
    description:
      "How the airline demo turns a disruption cascade into defensible recovery plans with FAR 117 proof.",
    labs: true,
  },
  {
    slug: "ev-fleet-charging",
    href: "/blog/ev-fleet-charging",
    category: "Labs · Logistics / EV",
    coverImage: "/use-case-workforce.png",
    coverAlt: "Electric delivery vans at a depot with charging bays and route overlays.",
    title: "EV depot charging is a QUBO-shaped problem",
    excerpt: "VRP routes + TOU charger queue + hybrid peak staggering.",
    description:
      "Why last-mile fleets leave hundreds per day on the table—and how to prove savings with an audit pack.",
    labs: true,
  },
  {
    slug: "hospital-restaffing",
    href: "/blog/hospital-restaffing",
    category: "Labs · Healthcare operations",
    coverImage: "/use-case-workforce.png",
    coverAlt:
      "Black and white healthcare workforce planning illustration showing staffing boards, coverage windows, and optimization overlays.",
    title: "Auditable nurse re-staffing: how hybrid optimization surfaces alternates that CP-SAT hides",
    excerpt:
      "Hospital call-out → classical solve → hybrid audit trace → buyer-facing scoreboard.",
    description:
      "See how the hospital demo turns a nurse call-out into a live solve and an ops-ready scoreboard.",
    labs: true,
  },
  {
    slug: "quantum-optimization",
    href: "/blog/quantum-optimization",
    category: "Labs · Quantum-forward thinking",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt:
      "Black and white abstract technology illustration showing solver workflow panels, network geometry, and a layered hybrid stack.",
    title: "Why operations teams need a quantum lens on planning",
    excerpt:
      "Superposition, QUBO, QAOA — and why hybrid beats hype.",
    description:
      "How Qtangl frames optimization and where quantum-assisted search fits in a classical-first stack.",
    labs: true,
  },
  {
    slug: "scheduling-use-cases",
    href: "/blog/scheduling-use-cases",
    category: "Labs · Interference in scheduling",
    coverImage: "/qtangl-usecase-scheduling.svg",
    coverAlt:
      "Black and white scheduling illustration showing crews, planning boards, and entangled task sequencing.",
    title: "Scheduling is still an interference problem hiding in plain sight",
    excerpt:
      "Teams, dependencies, and capacity limits collide at once.",
    description:
      "Constraint-aware scheduling when dependencies and crew windows stay visible.",
    labs: true,
  },
  {
    slug: "routing-optimization",
    href: "/blog/routing-optimization",
    category: "Labs · Observables in routing",
    coverImage: "/qtangl-usecase-routing.svg",
    coverAlt:
      "Black and white routing illustration showing dispatching, route maps, and network overlays with amplitude concentrated on the best path.",
    title: "Routing breaks when real-world constraints are treated like noise",
    excerpt:
      "The paper-perfect route fails once windows and capacity show up.",
    description:
      "Route plans teams can execute when the real observables stay in view.",
    labs: true,
  },
] as const;
