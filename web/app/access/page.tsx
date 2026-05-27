import type { Metadata } from "next";

import AccessRequestForm from "@/components/marketing/AccessRequestForm";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPageCopy, accessPanel } from "@/lib/copy/access";

export const metadata: Metadata = {
  title: "Access",
  description: accessPageCopy.metadataDescription,
};

type AccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = (await searchParams) ?? {};
  const source = typeof params.source === "string" ? params.source : "";
  const interest = typeof params.interest === "string" ? params.interest : "";

  return (
    <PageShell>
      <PageHero
        eyebrow={accessPanel.eyebrow}
        title={accessPanel.title}
        description={accessPanel.description}
      />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-6">
            <Card tone="strong" className="rounded-[var(--radius-xl)]">
              <Eyebrow>{accessPageCopy.audienceEyebrow}</Eyebrow>
              {source ? (
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                  Referred from: {source}
                </p>
              ) : null}
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-gray-300)]">
                {accessPageCopy.audienceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
            <Card tone="strong" className="rounded-[var(--radius-xl)]">
              <Eyebrow>{accessPageCopy.includeEyebrow}</Eyebrow>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
                {accessPageCopy.includeDescription}
              </p>
            </Card>
          </div>
          <AccessRequestForm source={source} defaultInterest={interest} />
        </div>
      </Section>
    </PageShell>
  );
}
