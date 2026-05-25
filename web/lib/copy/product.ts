export const siteMetadata = {
  name: "Qtangl",
  title: "Qtangl | Quantum-Native Optimization Interface",
  description:
    "Qtangl is a quantum-native interface for scheduling, routing, and resource allocation systems.",
  url: "https://qtangl.com",
  tagline:
    "Optimization systems for constrained operations at the boundary of classical and quantum computation.",
  oneLiner:
    "Submit constraint-aware problems through an interface built for scheduling, routing, and allocation workflows.",
  contactEmail: "founders@qtangl.com",
} as const;

export const aboutContent = {
  eyebrow: "About Qtangl",
  title: "Optimization infrastructure at the edge of computation and operations.",
  intro:
    "Qtangl is designed as a quantum-first product surface for organizations that operate inside hard constraints. The system language is minimal. The modeling depth is not.",
  principles: [
    {
      title: "Precision before noise",
      description:
        "Every interface element should reduce ambiguity, not add visual friction.",
    },
    {
      title: "Operational outcomes",
      description:
        "Solver workflows matter only when they return plans that teams can execute.",
    },
    {
      title: "Progressive disclosure",
      description:
        "The experience begins conceptually, then reveals technical depth only where it improves understanding.",
    },
  ],
} as const;

export const technologyPage = {
  eyebrow: "Technology",
  title: "A hybrid interface for submitting, solving, and interpreting optimization problems.",
  intro:
    "Qtangl models scheduling, routing, and allocation as structured optimization jobs. Classical orchestration and quantum-assisted search operate as one system layer.",
  sections: [
    {
      title: "Model the constraint field",
      description:
        "Jobs, resources, windows, dependencies, and objectives are represented as structured inputs rather than hidden business logic.",
    },
    {
      title: "Execute the hybrid stack",
      description:
        "Qtangl prepares the optimization model, evaluates candidate states, and invokes the appropriate execution path.",
    },
    {
      title: "Return an interpretable plan",
      description:
        "The result is a ranked schedule, route, or allocation state with metadata that can be reviewed and reused in downstream systems.",
    },
  ],
  diagramLabels: ["Client systems", "Qtangl API", "Hybrid solver", "Ranked result"],
} as const;

export const footerBlurb =
  "Qtangl — Optimization systems for constrained operations.";
