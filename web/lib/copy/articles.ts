import { quantumLexicon } from "@/lib/copy/voice";

const { amplitude, collapse, interference, measurement, phase, superposition } =
  quantumLexicon;

export const articleOutcomeStrip = [
  {
    label: superposition.label,
    description: "Compare feasible plans before you collapse to one.",
  },
  {
    label: phase.label,
    description: "Feasibility first, then rank against the operational objective.",
  },
  {
    label: measurement.label,
    description: "Ranked plan, short why, and the metric behind the call.",
  },
] as const;

export const blogIndexCopy = {
  eyebrow: "Blog",
  title: "Field notes from a quantum-aware planning stack.",
  description:
    "Practical optimization, hybrid execution, and the business case for better plans.",
} as const;

export const blogClosingCta = {
  title: "Try it on a real planning problem",
  description:
    "Send a sample schedule, route, or staffing job. Inspect the ranked plan before you integrate.",
  href: "/try",
  label: "Open /try",
} as const;

export const articles = {
  quantumOptimization: {
    eyebrow: "Quantum-forward planning",
    title: "Why operations teams need a quantum lens on planning",
    intro:
      "Qtangl is not asking operations teams to become physicists. It is using quantum language to describe a real planning truth: many feasible plans can coexist before one plan is chosen.",
    coverImage: "/qtangl-technology-solver-grid.svg",
    coverAlt:
      "Black and white technology illustration showing a hybrid stack with the classical bands dominating a smaller quantum research band.",
    sections: [
      {
        title: "Why operations needs a quantum lens",
        body: [
          "Scheduling, routing, and staffing problems get hard when decisions stop being independent. A crew change can move an inspection; a delivery window can reshape the whole route; a staffing rule can ripple across the entire shift grid.",
          `That is why ${superposition.label.toLowerCase()} is a useful story for planning. Before the system chooses a plan, there are many feasible candidates worth comparing instead of one obvious answer.`,
        ],
      },
      {
        title: `What ${superposition.label.toLowerCase()} means in product language`,
        body: [
          "For Qtangl, superposition is not mystical. It is simply the ranked set of feasible plans that exist before the system collapses to one operational recommendation.",
          `The brand can use ${superposition.label.toLowerCase()} and ${amplitude.label.toLowerCase()} to explain the chart. The interface still shows the business outcome first.`,
        ],
      },
      {
        title: "QAOA is one tool inside a hybrid pipeline",
        body: [
          "QUBO and QAOA matter because they offer one way to express and explore hard planning problems. They do not replace the rest of the stack.",
          "Qtangl still needs classical preprocessing to shape the problem, bounded quantum-assisted search for research candidates, and classical post-processing to return a usable plan.",
        ],
      },
      {
        title: "The honest stack today",
        body: [
          "Today, the backend is classical-dominant. A classical baseline runs on every job. QAOA is only attempted on tiny research-sized scheduling candidates.",
          "If QAOA fails or does not beat the classical result, Qtangl returns the classical plan. That honesty is part of the product story, not a footnote.",
        ],
      },
    ],
  },
  routing: {
    eyebrow: "Routing observables",
    title: "Routing breaks when real-world constraints are treated like noise",
    intro:
      "The fastest route on paper often fails in production because delivery windows, capacity, service times, and changing conditions shape what is actually feasible.",
    coverImage: "/qtangl-usecase-routing.svg",
    coverAlt:
      "Black and white routing illustration showing route paths with amplitude concentrated on one viable delivery sequence.",
    sections: [
      {
        title: "The shortest path is rarely the best plan",
        body: [
          "Logistics teams do not optimize for distance alone. They balance customer commitments, vehicle capacity, driver availability, and changing route conditions that can invalidate a naive plan almost immediately.",
        ],
      },
      {
        title: `When constraints ${interference.label.toLowerCase()}`,
        body: [
          "Once time windows, stop order rules, and handoff requirements appear, the search space grows quickly. That is why routing remains an optimization problem instead of a simple mapping problem.",
          "The product needs to keep those observables in view rather than hiding them behind a black-box score.",
        ],
      },
      {
        title: `How Qtangl ${collapse.label.toLowerCase()}s to an executable route`,
        body: [
          "Qtangl submits the route problem, evaluates feasible plans through the solver workflow, and returns the best operational route package for the team to execute.",
          "The chart can feel quantum-forward. The returned route still needs to be readable by dispatch in seconds.",
        ],
      },
    ],
  },
  scheduling: {
    eyebrow: "Scheduling interference",
    title: "Scheduling is still an interference problem hiding in plain sight",
    intro:
      "Scheduling stays difficult because the real world does not respect clean textbook assumptions. Dependencies, labor limits, inspections, and changing priorities all interact at once.",
    coverImage: "/qtangl-usecase-scheduling.svg",
    coverAlt:
      "Black and white scheduling illustration showing crews and entangled dependency chains across a constrained timeline.",
    sections: [
      {
        title: "Schedules are entangled dependency graphs",
        body: [
          "Trade sequencing, inspection windows, crew availability, and equipment access all create constraints that can push a project off course. When a single dependency slips, managers often rebuild the plan manually.",
        ],
      },
      {
        title: `Why scheduling ${interference.label.toLowerCase()} matters`,
        body: [
          "Skill fit, overtime rules, availability, and service-level targets mean staffing decisions are connected. A viable solution has to account for all of them at once instead of optimizing one metric in isolation.",
        ],
      },
      {
        title: "Why an API-first solver matters",
        body: [
          "Qtangl packages these planning decisions as an optimization workflow that existing systems can call. That turns scheduling from a manual exercise into a repeatable service that can be rerun as conditions change.",
          "The brand story can talk about entanglement and collapse, while the API still returns a plan the field team can act on.",
        ],
      },
    ],
  },
} as const;
