import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import { libraryEditorial } from "@/lib/copy/library-editorial";
import { getLibraryIndex } from "@/lib/library";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    path: "/learn/admin",
    title: "Learn admin",
    description: "Internal review dashboard for library editorial coverage.",
  }),
  robots: { index: false, follow: false },
};

const STALE_DAYS = 180;

export default async function LearnAdminPage() {
  const entries = await getLibraryIndex();
  const now = Date.now();
  const staleCutoff = now - STALE_DAYS * 24 * 60 * 60 * 1000;

  const coverage = entries.map((entry) => {
    const editorial = libraryEditorial[entry.slug];
    const verifiedAt = editorial?.lastVerifiedAt
      ? new Date(editorial.lastVerifiedAt).getTime()
      : null;
    const needsReview = !verifiedAt || verifiedAt < staleCutoff;
    return {
      slug: entry.slug,
      title: entry.title,
      hasEditorial: Boolean(editorial),
      needsReview,
      verifiedAt: editorial?.lastVerifiedAt ?? null,
      verifiedBy: editorial?.verifiedBy ?? null,
    };
  });

  const needsReview = coverage.filter((item) => item.needsReview);
  const withEditorial = coverage.filter((item) => item.hasEditorial);

  return (
    <PageShell>
      <PageHero
        eyebrow="Admin"
        title="Library editorial review."
        description="Private view for coverage and stale editorial checks. Not indexed."
        actions={[{ href: "/learn", label: "Back to Learn", variant: "secondary" }]}
        contentClassName="max-w-4xl"
      />
      <Section gap="tight" className="pb-0">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card tone="strong" size="lg">
            <p className="text-label">Total entries</p>
            <p className="mt-3 text-3xl text-white">{entries.length}</p>
          </Card>
          <Card tone="strong" size="lg">
            <p className="text-label">With editorial</p>
            <p className="mt-3 text-3xl text-white">{withEditorial.length}</p>
          </Card>
          <Card tone="strong" size="lg">
            <p className="text-label">Needs review</p>
            <p className="mt-3 text-3xl text-white">{needsReview.length}</p>
          </Card>
        </div>

        <Card tone="feature" size="lg" className="mt-8 rounded-[var(--radius-feature)]">
          <p className="text-label">Stale or missing verification (&gt; {STALE_DAYS} days)</p>
          <ul className="mt-5 max-h-[480px] space-y-2 overflow-y-auto text-sm text-[var(--color-gray-300)]">
            {needsReview.map((item) => (
              <li key={item.slug} className="flex items-center justify-between gap-4">
                <Link href={`/learn/library/${item.slug}`} className="hover:text-white">
                  {item.title}
                </Link>
                <span className="text-xs text-[var(--color-gray-500)]">
                  {item.hasEditorial ? item.verifiedAt ?? "no date" : "no editorial"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </PageShell>
  );
}
