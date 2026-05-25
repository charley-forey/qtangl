import type { Metadata } from "next";

import CodeBlock from "@/components/CodeBlock";
import Section from "@/components/Section";
import {
  apiErrors,
  apiReferenceRequest,
  apiReferenceResponse,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "API Reference",
  description: "Reference page for the Qtangl `/optimize` endpoint.",
};

export default function ApiPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            API reference
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            `POST /optimize`
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Submit a scheduling, routing, or allocation problem and receive a
            structured optimization result.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeBlock title="Request" code={apiReferenceRequest} />
          <CodeBlock title="Response" code={apiReferenceResponse} />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold text-white">Execution flow</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>1. Validate the problem type, payload shape, and constraints.</li>
              <li>2. Convert the job into an optimization-ready representation.</li>
              <li>3. Run the solver stack and return the best feasible result.</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-semibold text-white">Error cases</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {apiErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              MVP rate limit: 10 requests per minute per API key.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
