import type { Metadata } from "next";
import { Suspense } from "react";

import CompareMatrix from "@/components/learn/CompareMatrix";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { getLibraryIndex } from "@/lib/library";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn/compare",
  title: "Compare quantum libraries",
  description: "Compare open-source quantum software resources side by side.",
});

export default async function ComparePage() {
  const entries = await getLibraryIndex();

  return (
    <PageShell>
      <PageHero
        eyebrow="Compare"
        title="Side-by-side library comparison."
        description="Select up to five resources and compare language, license, activity, and positioning. Share the URL to keep your selection."
        actions={[{ href: "/learn/library", label: "Back to library", variant: "secondary" }]}
        contentClassName="max-w-4xl"
      />
      <Section gap="tight" className="pb-0 learn-print-area">
        <Suspense fallback={<p className="text-sm text-[var(--color-gray-400)]">Loading compare…</p>}>
          <CompareMatrix entries={entries} />
        </Suspense>
      </Section>
    </PageShell>
  );
}
