import type { Metadata } from "next";

import EcosystemGraphLoader from "@/components/learn/EcosystemGraphLoader";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { getLibraryCategories, getLibraryIndex } from "@/lib/library";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn/map",
  title: "Ecosystem map",
  description: "Interactive map of quantum software categories and library entries.",
});

export default async function LearnMapPage() {
  const [entries, categories] = await Promise.all([
    getLibraryIndex(),
    getLibraryCategories(),
  ]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Map"
        title="See how categories and projects connect."
        description="An exploratory graph of category hubs and indexed library entries. Click a node to narrow the list."
        actions={[{ href: "/learn", label: "Back to Learn", variant: "secondary" }]}
        contentClassName="max-w-4xl"
      />
      <Section gap="tight" className="pb-0">
        <EcosystemGraphLoader entries={entries} categories={categories} />
      </Section>
    </PageShell>
  );
}
