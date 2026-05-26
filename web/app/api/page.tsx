import type { Metadata } from "next";

import CodeBlock from "@/components/docs/CodeBlock";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import {
  apiErrors,
  apiReferenceRequest,
  apiReferenceResponse,
} from "@/lib/constants";
import { apiReferencePageCopy } from "@/lib/copy/docs";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "See exactly what to send to `/optimize`, what measurements come back, and how the method field is reported.",
};

export default function ApiPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={apiReferencePageCopy.eyebrow}
        title={apiReferencePageCopy.title}
        description={apiReferencePageCopy.description}
        actions={[
          { href: "/docs/api", label: "Read the API guide", variant: "primary" },
          {
            href: "/docs/data-formats",
            label: "Review data formats",
            variant: "secondary",
          },
        ]}
        contentClassName="max-w-3xl"
      />
      <Section gap="tight">
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeBlock title="Request" code={apiReferenceRequest} />
          <CodeBlock title="Response" code={apiReferenceResponse} />
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card tone="strong" className="rounded-[var(--radius-xl)]">
            <h2 className="heading-section !text-2xl">
              {apiReferencePageCopy.executionFlow.title}
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {apiReferencePageCopy.executionFlow.steps.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </Card>

          <Card tone="feature" className="rounded-[var(--radius-feature)]">
            <h2 className="heading-section !text-2xl">{apiReferencePageCopy.errorCases.title}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              {apiErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-[var(--color-gray-400)]">
              {apiReferencePageCopy.errorCases.note}
            </p>
          </Card>
        </div>
      </Section>
    </PageShell>
  );
}
