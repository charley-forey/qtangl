import type { Metadata } from "next";

import ArticleLayout from "@/components/docs/ArticleLayout";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Why Quantum Optimization Matters",
  description:
    "A plain-English introduction to QUBO, QAOA, and hybrid optimization workflows.",
};

export default function QuantumOptimizationPage() {
  return (
    <div id={MAIN_CONTENT_ID} className="scroll-mt-24 sm:scroll-mt-28">
      <ArticleLayout
        eyebrow="Quantum optimization basics"
        title="Why quantum optimization matters for operational planning"
        intro="Qtangl is not built around abstract quantum theory. It is built around the idea that real scheduling and routing problems stay hard when constraints stack on top of each other."
        coverImage="/qtangl-technology-solver-grid.svg"
        coverAlt="Black and white abstract technology illustration showing solver workflow panels and network geometry."
      >
        <section>
          <h2>Start with the actual business problem</h2>
          <p>
            Most operations teams do not need a lecture on quantum computing. They
            need a better way to decide which crew goes where, which route happens
            next, and which trade or vehicle is blocked by capacity limits.
          </p>
        </section>

        <section>
          <h2>QUBO is a modeling tool, not the product</h2>
          <p>
            Quadratic unconstrained binary optimization is one way to express a hard
            decision problem in a solver-friendly format. Qtangl uses this kind of
            formulation to map constraints and objectives into a structure that can be
            evaluated systematically.
          </p>
        </section>

        <section>
          <h2>QAOA fits into a hybrid workflow</h2>
          <p>
            In the MVP story, QAOA is a method inside the system rather than the
            system itself. Classical preprocessing shapes the problem, quantum-assisted
            search explores candidates, and classical post-processing returns an
            operational result that teams can use.
          </p>
        </section>
      </ArticleLayout>
    </div>
  );
}
