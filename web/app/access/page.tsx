import type { Metadata } from "next";

import AccessRequestForm from "@/components/marketing/AccessRequestForm";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPanel } from "@/lib/copy/home";

export const metadata: Metadata = {
  title: "Access",
  description: "Request pilot access to the Qtangl optimization interface.",
};

export default function AccessPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="max-w-4xl">
          <Eyebrow>{accessPanel.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {accessPanel.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-gray-300)]">
            {accessPanel.description}
          </p>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <Eyebrow>Who this is for</Eyebrow>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
                <li>Operations teams with scheduling or routing bottlenecks.</li>
                <li>Platform teams building optimization into internal tooling.</li>
                <li>Research-aligned partners evaluating hybrid execution workflows.</li>
              </ul>
            </Card>
            <Card className="rounded-2xl">
              <Eyebrow>What to include</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                Share the system you are modeling, the constraints that matter most, and whether the next step is a pilot, API evaluation, or research conversation.
              </p>
            </Card>
          </div>
          <AccessRequestForm />
        </div>
      </Section>
    </main>
  );
}
