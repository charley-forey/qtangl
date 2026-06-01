import type { Metadata } from "next";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { checklistPageCopy, cryptoAgilityChecklist } from "@/lib/copy/readiness-value";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/q-day/checklist",
  title: checklistPageCopy.metadata.title,
  description: checklistPageCopy.metadata.description,
});

export default function ChecklistPage() {
  const { hero, cta } = checklistPageCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />

      <Section gap="tight">
        <div className="grid gap-6 md:grid-cols-2">
          {cryptoAgilityChecklist.map((group) => (
            <Card key={group.title} tone="feature" className="rounded-[var(--radius-xl)]">
              <Eyebrow>{group.title}</Eyebrow>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--color-gray-300)]">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <div className="flex flex-wrap gap-3">
          <Button href={cta.primary.href}>{cta.primary.label}</Button>
          <Button href={cta.secondary.href} variant="secondary">
            {cta.secondary.label}
          </Button>
          <Button href="/resources/roi" variant="secondary">
            Estimate ROI
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
