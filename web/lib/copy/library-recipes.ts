export type LibraryRecipe = {
  slug: string;
  title: string;
  description: string;
  resourceSlugs: string[];
  steps: string[];
};

export const libraryRecipes: LibraryRecipe[] = [
  {
    slug: "hybrid-qaoa-scheduling",
    title: "Hybrid QAOA scheduling stack",
    description:
      "A practical stack for modeling combinatorial scheduling with QAOA-oriented tooling, annealing fallbacks, and cloud execution.",
    resourceSlugs: [
      "entropicalabs-openqaoa",
      "dwavesystems-dwave-ocean-sdk",
      "aws-amazon-braket-sdk-python",
      "qiskit-qiskit-optimization",
    ],
    steps: [
      "Model the problem as a QUBO or constrained optimization instance.",
      "Prototype QAOA workflows with OpenQAOA and validate locally.",
      "Compare against D-Wave Ocean for annealing-oriented baselines.",
      "Run bounded experiments on Braket when cloud access is required.",
    ],
  },
  {
    slug: "gate-model-onboarding",
    title: "Gate-model onboarding path",
    description:
      "A newcomer-friendly path from visual intuition to serious Python SDKs.",
    resourceSlugs: [
      "strilanc-quirk",
      "microsoft-quantumkatas",
      "qiskit-qiskit",
      "quantumlib-cirq",
      "xanaduai-pennylane",
    ],
    steps: [
      "Build intuition with Quirk or Quantum Katas.",
      "Pick one primary SDK (Qiskit or Cirq) for circuit construction.",
      "Add PennyLane when hybrid classical-quantum loops matter.",
    ],
  },
  {
    slug: "simulator-selection",
    title: "Simulator selection workflow",
    description:
      "Compare simulation styles before committing to a research stack.",
    resourceSlugs: ["quantumlib-stim", "qiskit-qiskit-aer", "bbn-q-pysimulator", "adamisntdead-qusimpy"],
    steps: [
      "Define whether you need state-vector, stabilizer, or pedagogy-first simulation.",
      "Benchmark runtime on representative circuits.",
      "Document noise assumptions explicitly.",
    ],
  },
  {
    slug: "enterprise-pqc-review",
    title: "Enterprise PQC review kit",
    description:
      "Libraries procurement teams evaluate when planning quantum-safe migrations.",
    resourceSlugs: ["open-quantum-safe-liboqs", "open-quantum-safe-openssl", "pqclean-pqclean"],
    steps: [
      "Inventory algorithms supported by liboqs.",
      "Map integration paths via OpenSSL forks or application-level bindings.",
      "Validate against PQClean reference implementations.",
    ],
  },
];

export function getRecipeBySlug(slug: string) {
  return libraryRecipes.find((recipe) => recipe.slug === slug) ?? null;
}
