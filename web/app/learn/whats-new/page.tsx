import type { Metadata } from "next";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import FeatureCard from "@/components/marketing/FeatureCard";
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
      <Section gap="tight">
        <Eyebrow>Qtangl editorial · June 2026</Eyebrow>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          New quantum cryptography curriculum — 15 video companions, five-layer path, and free
          downloadable guide.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Quantum crypto hub"
            description="Video grid, layer checkpoints, diagrams, and NIST bibliography."
            href="/learn/quantum-crypto"
            ctaLabel="Open curriculum →"
          />
          <FeatureCard
            title="4-week learning path"
            description="Week-by-week schedule with embedded videos and practitioner articles."
            href="/blog/learning-quantum-crypto-4-week-path"
            ctaLabel="Read schedule →"
          />
          <FeatureCard
            title="Shor's for CISOs"
            description="Pillar article — why RSA breaks and what to inventory first."
            href="/blog/shors-algorithm-explained-for-cisos"
            ctaLabel="Read article →"
          />
        </div>
      </Section>
      <Section gap="tight">
        <Eyebrow>Earlier · HNDL education</Eyebrow>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-gray-400)]">
          HNDL collection vectors, vertical exposure guides, and interactive tools.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="HNDL hub"
            description="Collection vectors, Mosca calculator, and exposure estimator."
            href="/q-day/hndl"
            ctaLabel="Open hub →"
          />
          <FeatureCard
            title="How harvesting works"
            description="Practitioner blog on breach, backups, and TLS capture."
            href="/blog/how-encrypted-data-is-harvested"
            ctaLabel="Read article →"
          />
          <FeatureCard
            title="HNDL learn topic"
            description="Shelf-life by vertical and Mosca framing."
            href="/learn/topics/hndl-risk"
            ctaLabel="Open topic →"
          />
        </div>
      </Section>
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
