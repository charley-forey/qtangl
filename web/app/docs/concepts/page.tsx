import type { Metadata } from "next";

import DocsShell from "@/components/docs/DocsShell";
import ProbabilityGrid from "@/components/quantum/ProbabilityGrid";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Concepts",
  description: "Core Qtangl concepts for optimization problems and hybrid execution.",
};

export default function ConceptsPage() {
  return (
    <DocsShell
      title="Core concepts"
      description="Qtangl is designed to keep the model simple for developers while preserving the constraint-heavy nature of operational planning."
    >
      <div className="grid gap-6">
        <Card as="section" className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">Optimization problems</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Qtangl focuses on three families of problems: scheduling, routing, and
            allocation. Each job combines entities, constraints, and objectives to
            produce a plan that can be executed in the real world.
          </p>
        </Card>

        <Card as="section" strong className="rounded-2xl">
          <h2 className="text-2xl font-semibold text-white">QUBO, lightly explained</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            Many optimization workflows can be reformulated as a quadratic
            unconstrained binary optimization model. In practice, that means Qtangl
            can express hard planning decisions in a form that solver backends can
            evaluate efficiently.
          </p>
        </Card>

        <Card as="section" className="relative overflow-hidden rounded-2xl">
          <ProbabilityGrid className="opacity-70" />
          <div className="relative">
          <h2 className="text-2xl font-semibold text-white">Hybrid execution</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-gray-300)]">
            The platform uses classical preprocessing, quantum-assisted search, and
            classical post-processing as one workflow. That hybrid approach matters
            more than any single backend because it keeps the system practical for
            enterprise optimization use cases.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              "Classical preprocessing",
              "Quantum-assisted search",
              "Classical post-processing",
            ].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--border)] bg-black/55 p-4 text-sm text-[var(--color-gray-300)]"
              >
                {label}
              </div>
            ))}
          </div>
          </div>
        </Card>
      </div>
    </DocsShell>
  );
}
