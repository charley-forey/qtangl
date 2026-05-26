import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
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
          <Eyebrow>API reference</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            `POST /optimize`
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--color-gray-300)]">
            Submit a schedule, route, or staffing problem and receive a readable
            summary, metrics, and structured plan output.
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
          <Card className="rounded-2xl">
            <h2 className="text-2xl font-semibold text-white">Execution flow</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              <li>1. Validate the problem type, payload shape, and hard constraints.</li>
              <li>2. Evaluate feasible plans with the available solver workflow.</li>
              <li>3. Return the ranked result with a summary and metrics first.</li>
            </ol>
          </Card>

          <Card strong className="rounded-2xl">
            <h2 className="text-2xl font-semibold text-white">Error cases</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {apiErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-[var(--color-gray-400)]">
              MVP rate limit: 10 requests per minute per API key.
            </p>
          </Card>
        </div>
      </Section>
    </main>
  );
}
