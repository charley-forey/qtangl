import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import TryPlanner from "@/components/marketing/TryPlanner";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { tryPageCopy } from "@/lib/copy/try";

export const metadata: Metadata = {
  title: "Try Qtangl",
  description:
    `${tryPageCopy.eyebrow}: see how Qtangl turns planning inputs into ranked plans, summaries, and metrics before you integrate.`,
};

export default function TryPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={tryPageCopy.eyebrow}
        title={tryPageCopy.title}
        description={tryPageCopy.description}
      />
      <Section gap="tight">
        <TryPlanner />
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 md:grid-cols-3">
          {tryPageCopy.steps.map((step) => (
            <Card key={step.eyebrow} tone="strong" className="rounded-[var(--radius-xl)]">
              <Eyebrow>{step.eyebrow}</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
