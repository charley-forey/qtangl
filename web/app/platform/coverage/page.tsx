import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { coveragePageCopy } from "@/lib/copy/readiness-coverage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/platform/coverage",
  title: coveragePageCopy.metadata.title,
  description: coveragePageCopy.metadata.description,
});

const statusLabel = {
  live: "Live today",
  beta: "Beta",
  roadmap: "Roadmap",
} as const;

export default function CoveragePage() {
  const { hero, sources } = coveragePageCopy;

  return (
    <PageShell>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} description={hero.description} />

      <Section gap="tight">
        <div className="grid gap-4">
          {sources.map((source) => (
            <Card key={source.name} tone="panel" className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Eyebrow>{statusLabel[source.status]}</Eyebrow>
                  <h2 className="mt-2 text-lg font-medium text-white">{source.name}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">{source.description}</p>
                </div>
                <Link href={source.href} className="text-sm text-white underline">
                  Learn more
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
