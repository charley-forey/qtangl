"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Card from "@/components/ui/Card";
import type { LibraryIndexEntry } from "@/lib/library";
import { trackEvent } from "@/lib/analytics";

type CompareMatrixProps = {
  entries: LibraryIndexEntry[];
};

const MAX_COMPARE = 5;

export default function CompareMatrix({ entries }: CompareMatrixProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [picker, setPicker] = useState("");

  const selectedSlugs = useMemo(() => {
    const raw = searchParams.get("ids") ?? "";
    return raw
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean)
      .slice(0, MAX_COMPARE);
  }, [searchParams]);

  const selected = useMemo(
    () =>
      selectedSlugs
        .map((slug) => entries.find((entry) => entry.slug === slug))
        .filter(Boolean) as LibraryIndexEntry[],
    [entries, selectedSlugs]
  );

  function updateSelection(slugs: string[]) {
    const next = slugs.slice(0, MAX_COMPARE).join(",");
    router.replace(next ? `/learn/compare?ids=${next}` : "/learn/compare", { scroll: false });
    trackEvent("learn_compare_update", { count: slugs.length });
  }

  function addSlug(slug: string) {
    if (!slug || selectedSlugs.includes(slug) || selectedSlugs.length >= MAX_COMPARE) {
      return;
    }
    updateSelection([...selectedSlugs, slug]);
    setPicker("");
  }

  function removeSlug(slug: string) {
    updateSelection(selectedSlugs.filter((item) => item !== slug));
  }

  const rows = [
    { label: "Category", render: (e: LibraryIndexEntry) => e.category.title },
    { label: "Language", render: (e: LibraryIndexEntry) => e.primaryLanguage ?? "—" },
    { label: "License", render: (e: LibraryIndexEntry) => e.license ?? "—" },
    { label: "Stars", render: (e: LibraryIndexEntry) => (e.stars > 0 ? e.stars.toLocaleString() : "—") },
    { label: "Last pushed", render: (e: LibraryIndexEntry) => e.lastPushedAt?.slice(0, 10) ?? "—" },
    { label: "Flagship", render: (e: LibraryIndexEntry) => (e.flagship ? "Yes" : "No") },
    { label: "Qtangl relevant", render: (e: LibraryIndexEntry) => (e.qtanglRelevant ? "Yes" : "No") },
    { label: "Summary", render: (e: LibraryIndexEntry) => e.summary },
  ];

  return (
    <div className="space-y-8">
      <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
        <p className="text-label">Add resources (up to {MAX_COMPARE})</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => removeSlug(entry.slug)}
              className="rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-3 py-1 text-xs text-white"
            >
              {entry.title} ×
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <select
            value={picker}
            onChange={(event) => {
              const value = event.target.value;
              setPicker(value);
              if (value) {
                addSlug(value);
              }
            }}
            className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
          >
            <option value="">Select a library entry…</option>
            {entries.map((entry) => (
              <option key={entry.slug} value={entry.slug} disabled={selectedSlugs.includes(entry.slug)}>
                {entry.title} ({entry.category.title})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selected.length ? (
        <div className="overflow-x-auto rounded-[var(--radius-feature)] border border-[var(--border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-black/50">
              <tr>
                <th className="px-4 py-3 text-[var(--color-gray-400)]">Field</th>
                {selected.map((entry) => (
                  <th key={entry.slug} className="px-4 py-3 font-semibold text-white">
                    <Link href={`/learn/library/${entry.slug}`} className="hover:underline">
                      {entry.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border)]">
                  <td className="px-4 py-3 text-[var(--color-gray-400)]">{row.label}</td>
                  {selected.map((entry) => (
                    <td key={entry.slug} className="px-4 py-3 align-top text-[var(--color-gray-300)]">
                      {row.render(entry)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-gray-400)]">
          Select up to five resources to compare side by side. Share the URL to preserve your selection.
        </p>
      )}
    </div>
  );
}
