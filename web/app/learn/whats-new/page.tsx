import type { Metadata } from "next";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Eyebrow from "@/components/ui/Eyebrow";
import { getLibraryIndex } from "@/lib/library";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  path: "/learn/whats-new",
  title: "What's new in the library",
  description: "Recently updated open-source quantum software resources in the Qtangl library.",
});

function monthKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en", { month: "long", year: "numeric" });
}

export default async function WhatsNewPage() {
  const entries = (await getLibraryIndex())
    .filter((entry) => entry.lastPushedAt)
    .sort(
      (a, b) =>
        new Date(b.lastPushedAt ?? 0).getTime() - new Date(a.lastPushedAt ?? 0).getTime()
    );

  const grouped = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = monthKey(entry.lastPushedAt!);
    const bucket = grouped.get(key) ?? [];
    bucket.push(entry);
    grouped.set(key, bucket);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="What's new"
        title="Recently updated resources."
        description="A chronological feed of library entries sorted by last repository activity."
        actions={[{ href: "/learn", label: "Back to Learn", variant: "secondary" }]}
        contentClassName="max-w-4xl"
      />
      <Section gap="tight" className="pb-0">
        {[...grouped.entries()].map(([key, monthEntries]) => (
          <div key={key} className="mb-12">
            <Eyebrow>{monthLabel(key)}</Eyebrow>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {monthEntries.map((entry) => (
                <LibraryResourceCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </Section>
    </PageShell>
  );
}
