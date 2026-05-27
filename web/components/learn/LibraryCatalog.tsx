"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Card from "@/components/ui/Card";
import type { LibraryCategorySummary, LibraryIndexEntry } from "@/lib/library";
import { trackEvent } from "@/lib/analytics";

import LibraryResourceCard from "./LibraryResourceCard";

type LibraryCatalogProps = {
  entries: LibraryIndexEntry[];
  categories: LibraryCategorySummary[];
};

type FocusFilter = "all" | "flagship" | "qtangl" | "saved";

const SAVED_KEY = "qtangl-learn-saved";

function readSavedSlugs(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function LibraryCatalog({
  entries,
  categories,
}: LibraryCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("cat") ?? "all";
  const language = searchParams.get("lang") ?? "all";
  const focus = (searchParams.get("focus") ?? "all") as FocusFilter;
  const cluster = searchParams.get("cluster") ?? "all";

  useEffect(() => {
    setSavedSlugs(readSavedSlugs());
  }, []);

  const languages = useMemo(() => {
    return Array.from(
      new Set(entries.map((entry) => entry.primaryLanguage).filter(Boolean) as string[])
    ).sort();
  }, [entries]);

  const categoryBySlug = useMemo(
    () => new Map(categories.map((item) => [item.slug, item])),
    [categories]
  );

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const next = params.toString();
    router.replace(next ? `/learn/library?${next}` : "/learn/library", { scroll: false });
  }

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      if (category !== "all" && entry.category.slug !== category) {
        return false;
      }
      if (cluster !== "all") {
        const categoryMeta = categoryBySlug.get(entry.category.slug);
        if (categoryMeta?.cluster !== cluster) {
          return false;
        }
      }
      if (language !== "all" && entry.primaryLanguage !== language) {
        return false;
      }
      if (focus === "flagship" && !entry.flagship) {
        return false;
      }
      if (focus === "qtangl" && !entry.qtanglRelevant) {
        return false;
      }
      if (focus === "saved" && !savedSlugs.includes(entry.slug)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        entry.title,
        entry.owner,
        entry.summary,
        entry.category.title,
        ...entry.topics.map((topic) => topic.title),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [category, categoryBySlug, cluster, entries, focus, language, query, savedSlugs]);

  return (
    <div className="space-y-8">
      <Card tone="strong" size="lg" className="rounded-[var(--radius-feature)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))]">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
              Search
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                updateParams({ q: event.target.value || null });
                trackEvent("learn_catalog_search", { query: event.target.value });
              }}
              placeholder="Search Qiskit, simulators, optimization..."
              className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--border-strong)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => updateParams({ cat: event.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--border-strong)]"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
              Language
            </span>
            <select
              value={language}
              onChange={(event) => updateParams({ lang: event.target.value })}
              className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--border-strong)]"
            >
              <option value="all">All languages</option>
              {languages.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
              Focus
            </span>
            <div className="flex h-[50px] flex-wrap items-center gap-2">
              {[
                { value: "all", label: "All" },
                { value: "flagship", label: "Flagship" },
                { value: "qtangl", label: "Qtangl" },
                { value: "saved", label: "Saved" },
              ].map((item) => {
                const active = focus === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateParams({ focus: item.value })}
                    className={[
                      "rounded-full border px-3 py-2 text-xs transition",
                      active
                        ? "border-[var(--border-strong)] bg-white/[0.08] text-white"
                        : "border-[var(--border)] text-[var(--color-gray-300)] hover:border-[var(--border-strong)] hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--color-gray-300)]">
          <span>{filteredEntries.length} resources shown</span>
          <span className="text-[var(--color-gray-500)]">/</span>
          <span>{entries.length} total indexed</span>
          {cluster !== "all" ? (
            <>
              <span className="text-[var(--color-gray-500)]">/</span>
              <span>cluster: {cluster}</span>
            </>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredEntries.map((entry) => (
          <LibraryResourceCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </div>
  );
}
