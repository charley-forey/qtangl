import Image from "next/image";
import Link from "next/link";

import Card from "@/components/ui/Card";
import type { LibraryIndexEntry } from "@/lib/library";
import { formatRelativeDate, isNewThisMonth } from "@/lib/library-utils";

import ResourceChips from "./ResourceChips";

type LibraryResourceCardProps = {
  entry: LibraryIndexEntry;
  showCategory?: boolean;
  showImage?: boolean;
};

export default function LibraryResourceCard({
  entry,
  showCategory = true,
  showImage = false,
}: LibraryResourceCardProps) {
  const relativeDate = formatRelativeDate(entry.lastPushedAt);
  const chips = [
    entry.primaryLanguage
      ? {
          label: entry.primaryLanguage,
          title:
            entry.primaryLanguages.length > 1
              ? entry.primaryLanguages.join(", ")
              : undefined,
        }
      : null,
    entry.license ? { label: entry.license } : null,
    entry.flagship ? { label: "Flagship", tone: "strong" as const } : null,
    entry.qtanglRelevant ? { label: "Qtangl relevant", tone: "strong" as const } : null,
    entry.archived ? { label: "Archive", tone: "muted" as const } : null,
    isNewThisMonth(entry.lastPushedAt) ? { label: "New this month", tone: "strong" as const } : null,
  ].filter(Boolean) as Parameters<typeof ResourceChips>[0]["chips"];

  return (
    <Card
      as="article"
      tone="feature"
      size="lg"
      interactive
      className="group relative h-full rounded-[var(--radius-feature)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="relative">
        {showImage && entry.imagePath ? (
          <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/60">
            <Image
              src={entry.imagePath}
              alt={`${entry.title} illustration`}
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 42vw, 100vw"
              className="object-cover grayscale transition duration-500 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
          <span>{entry.owner}</span>
          {showCategory ? (
            <>
              <span aria-hidden="true">/</span>
              <span>{entry.category.title}</span>
            </>
          ) : null}
        </div>

        <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
          <Link
            href={`/learn/library/${entry.slug}`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {entry.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          {entry.summary}
        </p>

        <div className="mt-5">
          <ResourceChips chips={chips} />
        </div>

        {relativeDate || entry.stars > 0 ? (
          <p className="mt-4 text-xs text-[var(--color-gray-400)]">
            {entry.stars > 0 ? `${entry.stars.toLocaleString()} stars` : null}
            {entry.stars > 0 && relativeDate ? " · " : null}
            {relativeDate}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
