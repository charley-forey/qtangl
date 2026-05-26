export const libraryHubCopy = {
  eyebrow: "Learn",
  title: "Explore the open-source quantum software ecosystem with an operator's eye.",
  description:
    "Qtangl's library maps the projects, frameworks, simulators, optimization tools, and learning resources that define the modern quantum software landscape. Start broad, narrow by category, and then dive into the resources most relevant to how you want to learn or build.",
  actions: [
    { href: "/learn/library", label: "Open the full library" },
    { href: "/learn/topics/quantum-optimization-compared", label: "Compare optimization tools", variant: "secondary" as const },
  ],
  categorySection: {
    eyebrow: "Explore by category",
    title: "See what kinds of tools are actually out there.",
    description:
      "The ecosystem is easier to understand when it is grouped by the job each project helps you do: build circuits, simulate behavior, compare optimization methods, learn the basics, or work closer to hardware.",
  },
  featuredSection: {
    eyebrow: "Start with the tentpoles",
    title: "Flagship resources worth understanding first.",
    description:
      "These are the projects newcomers search for most often and the ones most likely to anchor the rest of the ecosystem in your head.",
  },
  relevantSection: {
    eyebrow: "Qtangl lens",
    title: "Resources that matter most for a planning and optimization stack.",
    description:
      "If you care about how quantum ideas intersect with scheduling, routing, allocation, and hybrid solver workflows, start with this subset first.",
  },
  catalogSection: {
    eyebrow: "Full catalog",
    title: "Search 157 resources without losing context.",
    description:
      "The catalog stays readable even when you are scanning dozens of entries. Filter by category, language, or focus area, then open a resource page for a clearer explanation of what it is and why it matters.",
  },
} as const;

export const libraryTopicTeasers = [
  {
    slug: "quantum-software-map",
    title: "Quantum computing software in 2026: the open-source map",
    description:
      "A guided map of the ecosystem that helps people understand what the major categories are for and how they connect.",
  },
  {
    slug: "start-writing-quantum-code",
    title: "How to start writing quantum code: an honest path",
    description:
      "A newcomer path from playful tools and katas to serious frameworks like Qiskit, PennyLane, and Cirq.",
  },
  {
    slug: "quantum-optimization-compared",
    title: "Quantum optimization libraries compared: QAOA, QUBO, and annealing",
    description:
      "The most relevant pillar for Qtangl: where optimization libraries differ, what each one is good at, and how they fit into hybrid stacks.",
  },
  {
    slug: "quantum-simulators-guide",
    title: "Open-source quantum simulators: what each one is good at",
    description:
      "A practical guide for choosing between state-vector, stabilizer, and other simulation approaches.",
  },
  {
    slug: "quantum-chemistry-for-newcomers",
    title: "Quantum chemistry software for newcomers",
    description:
      "A field guide to the chemistry-focused projects most often referenced when discussing useful near-term workflows.",
  },
  {
    slug: "post-quantum-crypto-libraries",
    title: "Post-quantum cryptography libraries you can use today",
    description:
      "A practical overview of quantum-safe crypto libraries and how they differ from quantum-computing SDKs.",
  },
] as const;
