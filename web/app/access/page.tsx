import type { Metadata } from "next";

import AccessRequestForm from "@/components/marketing/AccessRequestForm";
import AccessTimeline from "@/components/marketing/AccessTimeline";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import JsonLd from "@/components/seo/JsonLd";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { accessPageCopy, accessPanel } from "@/lib/copy/access";
import { buildContactPageJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/access",
  title: "Access",
  description: accessPageCopy.metadataDescription,
});

type AccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = (await searchParams) ?? {};
  const source = typeof params.source === "string" ? params.source : "";
  const interest = typeof params.interest === "string" ? params.interest : "";

  return (
    <PageShell>
      <JsonLd data={buildContactPageJsonLd()} />
      <PageHero
        eyebrow={accessPanel.eyebrow}
        title={accessPanel.title}
        description={accessPanel.description}
      />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="order-2 space-y-6 xl:order-1">
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
              <p className="mt-5 text-sm leading-7 text-[var(--color-gray-400)]">
                {accessPageCopy.trustNote}
              </p>
            </Card>
            <AccessTimeline />
          </div>
          <div className="order-1 xl:order-2">
            <AccessRequestForm source={source} defaultInterest={interest} />
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
