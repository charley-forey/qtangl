import type { Metadata } from "next";

import TryPlanner from "@/components/marketing/TryPlanner";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Try Qtangl",
  description:
    "See how Qtangl turns planning inputs into ranked plans, summaries, and metrics before you integrate.",
};

export default function TryPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="content-reading">
          <Eyebrow>Interactive demo</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            See the workflow before you commit to the API.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
            Start with a familiar planning problem, review the ranked output, and
            decide whether the next step is a pilot integration. This demo keeps the
            inputs plain and the output visual.
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <TryPlanner />
      </Section>

      <Section className="pt-0 pb-20 sm:pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl">
            <Eyebrow>Step 1</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Start with the work, windows, crews, vehicles, or shifts your team
              already tracks.
            </p>
          </Card>
          <Card className="rounded-2xl">
            <Eyebrow>Step 2</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Review a ranked plan, a short summary, and the metric that explains
              why the result is better than manual ordering.
            </p>
          </Card>
          <Card className="rounded-2xl">
            <Eyebrow>Step 3</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Expand the API example when you are ready to connect the same workflow
              to your own system.
            </p>
          </Card>
        </div>
      </Section>
    </main>
  );
}
