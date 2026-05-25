import type { Metadata } from "next";
import Image from "next/image";

import DocsShell from "@/components/DocsShell";

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
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Optimization problems</h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            Qtangl focuses on three families of problems: scheduling, routing, and
            allocation. Each job combines entities, constraints, and objectives to
            produce a plan that can be executed in the real world.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-semibold text-white">QUBO, lightly explained</h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            Many optimization workflows can be reformulated as a quadratic
            unconstrained binary optimization model. In practice, that means Qtangl
            can express hard planning decisions in a form that solver backends can
            evaluate efficiently.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold text-white">Hybrid execution</h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            The platform uses classical preprocessing, quantum-assisted search, and
            classical post-processing as one workflow. That hybrid approach matters
            more than any single backend because it keeps the system practical for
            enterprise optimization use cases.
          </p>
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
            <Image
              src="/docs-hybrid-execution.png"
              alt="Hybrid execution diagram showing classical preprocessing, quantum-assisted search, and classical post-processing."
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        </section>
      </div>
    </DocsShell>
  );
}
