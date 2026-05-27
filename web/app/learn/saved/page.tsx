import type { Metadata } from "next";

import SavedResourcesView from "@/components/learn/SavedResourcesView";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { getLibraryIndex } from "@/lib/library";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn/saved",
  title: "Saved resources",
  description: "Your saved quantum software library entries.",
});

export default async function SavedPage() {
  const entries = await getLibraryIndex();

  return (
    <PageShell>
      <PageHero
        eyebrow="Saved"
        title="Resources you marked to revisit."
        description="Saved locally in your browser. Use the catalog Saved filter to browse them from the library index."
        actions={[{ href: "/learn/library?focus=saved", label: "Open in catalog", variant: "secondary" }]}
        contentClassName="max-w-4xl"
      />
      <Section gap="tight" className="pb-0">
        <SavedResourcesView entries={entries} />
      </Section>
    </PageShell>
  );
}
