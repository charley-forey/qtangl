"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import Modal from "@/components/ui/Modal";
import type { DocsSearchEntry } from "@/lib/docs/types";

type DocsSearchProps = {
  index: DocsSearchEntry[];
};

function scoreEntry(entry: DocsSearchEntry, query: string) {
  const q = query.toLowerCase();
  let score = 0;
  if (entry.title.toLowerCase().includes(q)) {
    score += 10;
  }
  if (entry.description?.toLowerCase().includes(q)) {
    score += 5;
  }
  if (entry.section?.toLowerCase().includes(q)) {
    score += 3;
  }
  for (const heading of entry.headings ?? []) {
    if (heading.toLowerCase().includes(q)) {
      score += 2;
    }
  }
  return score;
}

export default function DocsSearch({ index }: DocsSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) {
      return index.slice(0, 8);
    }
    return index
      .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.entry);
  }, [index, query]);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const isInput =
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.isContentEditable;

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!isInput && event.key === "/" && !event.shiftKey) {
      event.preventDefault();
      setOpen(true);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-left text-sm text-[var(--color-gray-500)] transition hover:border-[var(--border-strong)] hover:text-[var(--color-gray-300)]"
      >
        <span>Search docs…</span>
        <kbd className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[0.65rem] sm:inline">
          ⌘K
        </kbd>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Search documentation"
        eyebrow="Documentation"
        size="lg"
      >
        <div className="space-y-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages and headings…"
            aria-label="Search documentation"
            className="input-field"
            autoFocus
          />
          <ul className="max-h-[50dvh] space-y-1 overflow-y-auto">
            {results.length === 0 ? (
              <li className="px-2 py-3 text-sm text-[var(--color-gray-500)]">
                No matches. Try API, schedule, or authentication.
              </li>
            ) : (
              results.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 transition hover:bg-white/[0.06]"
                  >
                    <p className="text-sm font-medium text-white">{entry.title}</p>
                    {entry.section ? (
                      <p className="text-xs text-[var(--color-gray-500)]">{entry.section}</p>
                    ) : null}
                    {entry.description ? (
                      <p className="mt-1 text-xs leading-5 text-[var(--color-gray-400)]">
                        {entry.description}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </Modal>
    </>
  );
}
