"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MatrixCellBadge from "@/components/compare/MatrixCellBadge";
import Card from "@/components/ui/Card";
import type { CapabilityRow, CompetitorEntry } from "@/lib/competitors-types";
import { CAPABILITY_LABELS } from "@/lib/competitors-types";
import { isQtanglOnlyWin } from "@/lib/compare/matrix-utils";
import {
  competitorCompareHref,
  qtanglBaseline,
} from "@/lib/copy/competitors";
import { trackEvent } from "@/lib/analytics";

type ComparisonMatrixProps = {
  competitors: CompetitorEntry[];
  basePath?: string;
  showPicker?: boolean;
  maxCompare?: number;
  compact?: boolean;
};

const MAX_DEFAULT = 6;

export default function ComparisonMatrix({
  competitors,
  basePath = "/compare",
  showPicker = true,
  maxCompare = MAX_DEFAULT,
  compact = false,
}: ComparisonMatrixProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [picker, setPicker] = useState("");
  const [highlightWins, setHighlightWins] = useState(false);

  const selectedSlugs = useMemo(() => {
    const raw = searchParams.get("ids") ?? "";
    const parsed = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, maxCompare);
    if (parsed.length) return parsed;
    return competitors.slice(0, compact ? 3 : 5).map((c) => c.slug);
  }, [searchParams, competitors, maxCompare, compact]);

  const selected = useMemo(
    () =>
      selectedSlugs
        .map((slug) => competitors.find((c) => c.slug === slug))
        .filter(Boolean) as CompetitorEntry[],
    [competitors, selectedSlugs],
  );

  function updateSelection(slugs: string[]) {
    const next = slugs.slice(0, maxCompare).join(",");
    const path = next ? `${basePath}?ids=${next}` : basePath;
    router.replace(path, { scroll: false });
    trackEvent("compare_matrix_filter", { count: slugs.length });
  }

  function addSlug(slug: string) {
    if (!slug || selectedSlugs.includes(slug) || selectedSlugs.length >= maxCompare) return;
    updateSelection([...selectedSlugs, slug]);
    setPicker("");
  }

  function removeSlug(slug: string) {
    updateSelection(selectedSlugs.filter((s) => s !== slug));
  }

  const columns = [
    { slug: "qtangl", name: qtanglBaseline.name, capabilities: qtanglBaseline.capabilities, href: "/assess" },
    ...selected.map((c) => ({
      slug: c.slug,
      name: c.name,
      capabilities: c.capabilities,
      href: competitorCompareHref(c.slug),
    })),
  ];

  function rowHighlight(key: keyof CapabilityRow): boolean {
    if (!highlightWins || selected.length !== 1) return false;
    return isQtanglOnlyWin(qtanglBaseline.capabilities, selected[0]!.capabilities, key);
  }

  return (
    <div className="space-y-6">
      {showPicker ? (
        <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-label">Filter vendors (up to {maxCompare})</p>
            <label className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
              <input
                type="checkbox"
                checked={highlightWins}
                onChange={(e) => setHighlightWins(e.target.checked)}
                className="rounded border-[var(--border)]"
              />
              Highlight Qtangl-only wins
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.map((entry) => (
              <button
                key={entry.slug}
                type="button"
                onClick={() => removeSlug(entry.slug)}
                className="rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-3 py-1 text-xs text-white"
              >
                {entry.name} ×
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <select
              value={picker}
              onChange={(e) => {
                const value = e.target.value;
                setPicker(value);
                if (value) addSlug(value);
              }}
              aria-label="Add a vendor to compare"
              className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white"
            >
              <option value="">Add a vendor…</option>
              {competitors.map((entry) => (
                <option
                  key={entry.slug}
                  value={entry.slug}
                  disabled={selectedSlugs.includes(entry.slug)}
                >
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      ) : null}

      <div className="overflow-x-auto rounded-[var(--radius-feature)] border border-[var(--border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-black/50">
            <tr>
              <th className="sticky left-0 z-10 bg-black/90 px-4 py-3 text-[var(--color-gray-400)]">
                Capability
              </th>
              {columns.map((col) => (
                <th
                  key={col.slug}
                  className={`px-4 py-3 font-semibold ${col.slug === "qtangl" ? "text-[#6ee7a0]" : "text-white"}`}
                >
                  <Link href={col.href} className="hover:underline">
                    {col.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITY_LABELS.map(({ key, label }) => (
              <tr
                key={key}
                className={`border-b border-[var(--border)] ${rowHighlight(key) ? "bg-[#6ee7a0]/[0.04]" : ""}`}
              >
                <td className="sticky left-0 z-10 bg-[#0a0a0a] px-4 py-3 text-[var(--color-gray-400)]">
                  {label}
                </td>
                {columns.map((col) => (
                  <td key={col.slug} className="px-4 py-3 align-top">
                    <MatrixCellBadge
                      cell={col.capabilities[key]}
                      highlight={col.slug === "qtangl" && rowHighlight(key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <table className="sr-only" aria-hidden="true">
        <caption>Feature comparison matrix</caption>
        <thead>
          <tr>
            <th scope="col">Capability</th>
            {columns.map((col) => (
              <th key={col.slug} scope="col">
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CAPABILITY_LABELS.map(({ key, label }) => (
            <tr key={key}>
              <th scope="row">{label}</th>
              {columns.map((col) => (
                <td key={col.slug}>{col.capabilities[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
