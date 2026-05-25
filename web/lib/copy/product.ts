export const siteMetadata = {
  name: "Qtangl",
  title: "Qtangl | Quantum-Native Optimization Platform",
  description:
    "Qtangl helps teams solve scheduling, routing, and resource allocation problems through a hybrid optimization API.",
  url: "https://qtangl.com",
  tagline:
    "Scheduling, routing, and allocation optimization for operations teams.",
  oneLiner:
    "Submit operational constraints. Get ranked schedules, routes, and allocation plans.",
  contactEmail: "founders@qtangl.com",
} as const;

export const aboutContent = {
  eyebrow: "About Qtangl",
  title: "Optimization infrastructure for operational systems.",
  intro:
    "Qtangl builds software for teams that need better planning decisions under hard constraints. The product combines a precise interface, structured modeling, and hybrid optimization methods without forcing users to think in research terms.",
  principles: [
    {
      title: "Clear inputs",
      description:
        "Users should be able to describe jobs, resources, windows, and dependencies without translating the business problem into academic language.",
    },
    {
      title: "Operational outcomes",
      description:
        "Solver workflows matter only when they return plans operations teams can review, compare, and execute.",
    },
    {
      title: "Scalable system design",
      description:
        "The site, API, and future product surfaces should grow into dashboards, docs, and tooling without fragmenting the user experience.",
    },
  ],
} as const;

export const technologyPage = {
  eyebrow: "Technology",
  title: "Model planning constraints, run hybrid optimization, and return clear results.",
  intro:
    "Qtangl accepts structured scheduling, routing, and allocation problems, prepares the optimization model, evaluates feasible plans, and returns ranked results that teams can act on.",
  sections: [
    {
      title: "Capture the real-world constraints",
      description:
        "Jobs, resources, windows, dependencies, and objectives are represented as structured inputs rather than scattered business rules.",
    },
    {
      title: "Run the solver workflow",
      description:
        "Qtangl prepares the optimization model, evaluates feasible candidates, and selects the execution path best suited to the problem.",
    },
    {
      title: "Return a plan teams can use",
      description:
        "The result is a ranked schedule, route, or allocation plan with metadata that can be reviewed, compared, and reused in downstream systems.",
    },
  ],
  diagramLabels: ["Client app", "Qtangl API", "Solver workflow", "Ranked output"],
} as const;

export const footerBlurb =
  "Qtangl helps teams model scheduling, routing, and allocation problems as structured optimization workflows.";
