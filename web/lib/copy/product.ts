export const siteMetadata = {
  name: "Qtangl",
  title: "Qtangl | Planning API for Schedules, Routes, and Staffing",
  description:
    "Get ranked schedules, routes, and staffing plans from the constraints your team already tracks.",
  url: "https://qtangl.com",
  tagline: "Send your constraints. Get a plan your team can run.",
  oneLiner:
    "Turn operational constraints into ranked plans your team can review and run.",
  contactEmail: "founders@qtangl.com",
} as const;

export const aboutContent = {
  eyebrow: "About Qtangl",
  title: "Optimization infrastructure for operational systems.",
  intro:
    "Qtangl builds planning software for teams that lose time and money when schedules, routes, or staffing plans break under real-world constraints. The product keeps the interface readable, the outputs actionable, and the solver stack behind the scenes.",
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
  title: "Model real planning constraints, evaluate feasible options, and return a plan teams can run.",
  intro:
    "Qtangl accepts structured scheduling, routing, and allocation problems, prepares an optimization model, evaluates feasible plans, and returns ranked results with enough detail for engineering teams and enough clarity for operations teams.",
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
  "Qtangl helps teams turn scheduling, routing, and staffing constraints into plans they can review, compare, and run.";
