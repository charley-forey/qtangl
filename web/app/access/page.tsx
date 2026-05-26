import type { Metadata } from "next";

import AccessRequestForm from "@/components/marketing/AccessRequestForm";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPageCopy, accessPanel } from "@/lib/copy/access";

export const metadata: Metadata = {
  title: "Access",
  description: accessPageCopy.metadataDescription,
};

export default function AccessPage() {
  return (
    <main className="flex-1">
      <Section className="pt-12 sm:pt-16">
        <div className="content-reading">
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
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <Eyebrow>{accessPageCopy.audienceEyebrow}</Eyebrow>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
                {accessPageCopy.audienceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
            <Card className="rounded-2xl">
              <Eyebrow>{accessPageCopy.includeEyebrow}</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {accessPageCopy.includeDescription}
              </p>
            </Card>
          </div>
          <AccessRequestForm />
        </div>
      </Section>
    </main>
  );
}
