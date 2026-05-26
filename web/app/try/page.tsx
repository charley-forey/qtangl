import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import TryPlanner from "@/components/marketing/TryPlanner";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Try Qtangl",
  description:
    "Explore how Qtangl turns scheduling, routing, and staffing inputs into visual plans and plain-English summaries.",
};

export default function TryPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Interactive demo"
        title="See the workflow before you commit to the API."
        description={
          <>
            Start with a familiar planning problem, review the ranked output, and
            decide whether the next step is a pilot integration. This demo keeps the
            inputs plain and the output visual.
          </>
        }
      />
      <Section className="pt-0">
        <TryPlanner />
      </Section>

      <Section className="pt-0 pb-0">
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
    </PageShell>
  );
}
