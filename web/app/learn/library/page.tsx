import type { Metadata } from "next";

import LibraryCatalog from "@/components/learn/LibraryCatalog";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import { getLibraryCategories, getLibraryIndex } from "@/lib/library";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse Qtangl's index of open-source quantum software resources by category, language, and focus area.",
};

export default async function LibraryIndexPage() {
  const [entries, categories] = await Promise.all([
    getLibraryIndex(),
    getLibraryCategories(),
  ]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Library"
        title="Search the ecosystem without losing the plot."
        description="Filter the full index by category, language, or Qtangl relevance, then open any entry for a clearer explanation of what it is and why people use it."
        actions={[
          { href: "/learn", label: "Back to Learn", variant: "secondary" },
        ]}
        contentClassName="max-w-4xl"
      />

      <Section gap="tight">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <p className="text-label">Indexed resources</p>
            <p className="mt-4 text-4xl font-semibold text-white">{entries.length}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
              Static pages generated from the local reference corpus.
            </p>
          </Card>
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <p className="text-label">Categories</p>
            <p className="mt-4 text-4xl font-semibold text-white">{categories.length}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
              Different ways to orient yourself before drilling into a tool.
            </p>
          </Card>
          <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
            <p className="text-label">Flagship entries</p>
            <p className="mt-4 text-4xl font-semibold text-white">
              {entries.filter((entry) => entry.flagship).length}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
              Higher-touch entries with deeper editorial coverage and imagery.
            </p>
          </Card>
        </div>
      </Section>

      <Section gap="tight" className="pb-0">
        <LibraryCatalog entries={entries} categories={categories} />
      </Section>
    </PageShell>
  );
}
