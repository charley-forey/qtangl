import type { Metadata } from "next";

import CodeBlock from "@/components/CodeBlock";
import CTA from "@/components/CTA";
import FeatureCard from "@/components/FeatureCard";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import {
  apiPreviewRequest,
  apiPreviewResponse,
  platformHighlights,
  problemPoints,
  siteMetadata,
  solutionPoints,
  useCases,
  workflowSteps,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Home",
  description: siteMetadata.description,
};

export default function Home() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <Hero />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              The problem
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Business operations are harder to optimize than they should be.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Qtangl is built for the problems that still fall between manual
              planning and generic software. When scheduling and routing depend on
              changing constraints, teams need a solver stack instead of another
              dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {problemPoints.map((point) => (
              <div
                key={point}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              The solution
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A quantum optimization API for real-world operations.
            </h2>
          </div>
          <div className="space-y-4">
            {solutionPoints.map((point) => (
              <div
                key={point}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 text-sm leading-7 text-slate-300"
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {platformHighlights.map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Three steps from input to optimized plan.
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="text-sm font-semibold text-cyan-300">0{index + 1}</div>
              <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Use cases
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for scheduling, routing, and allocation workflows.
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <FeatureCard
              key={useCase.title}
              eyebrow={useCase.eyebrow}
              title={useCase.title}
              description={useCase.description}
            >
              <p>
                <span className="font-semibold text-white">Problem:</span>{" "}
                {useCase.problem}
              </p>
              <p>
                <span className="font-semibold text-white">Outcome:</span>{" "}
                {useCase.outcome}
              </p>
              <p>
                <span className="font-semibold text-white">Value:</span>{" "}
                {useCase.value}
              </p>
            </FeatureCard>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              API concept
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Job submission in, optimized result out.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Developers define the problem in JSON, Qtangl runs the optimization
              workflow, and operations teams receive a plan with solution metadata
              they can review or feed back into existing systems.
            </p>
          </div>
          <div className="grid gap-5">
            <CodeBlock title="Request" code={apiPreviewRequest} />
            <CodeBlock title="Response" code={apiPreviewResponse} />
          </div>
        </div>
      </Section>

      <Section className="pb-20 sm:pb-24">
        <CTA />
      </Section>
    </main>
  );
}
