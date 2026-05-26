import type { Metadata } from "next";

import AccessRequestForm from "@/components/marketing/AccessRequestForm";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPanel } from "@/lib/copy/home";

export const metadata: Metadata = {
  title: "Access",
  description: "Request pilot access for scheduling, routing, and allocation workflows.",
};

export default function AccessPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow={accessPanel.eyebrow}
        title={accessPanel.title}
        description={accessPanel.description}
      />
      <Section className="pt-0 pb-0">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <Card className="rounded-2xl">
            <Eyebrow>Who this is for</Eyebrow>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
              <li>Operations teams dealing with scheduling, routing, or staffing bottlenecks.</li>
              <li>Platform teams embedding optimization into internal or customer-facing tools.</li>
              <li>Technical partners preparing for an API evaluation or pilot deployment.</li>
            </ul>
            <div className="hairline-divider mt-6" />
            <Eyebrow className="mt-6">What to include</Eyebrow>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
              Share the workflow you are improving, the constraints that matter most,
              and the tools your team already uses today.
            </p>
          </Card>
          <AccessRequestForm />
        </div>
      </Section>
    </PageShell>
  );
}
