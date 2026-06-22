"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { notFoundCopy } from "@/lib/copy/not-found";
import { searchSiteRoutes, type RouteSuggestion } from "@/lib/site-route-index";

type NotFoundRouteSearchProps = {
  initialQuery?: string;
  pathname: string;
};

export default function NotFoundRouteSearch({ initialQuery = "", pathname }: NotFoundRouteSearchProps) {
  const copy = notFoundCopy.marketing.search;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => searchSiteRoutes(query, 8), [query]);

  const onSelect = useCallback(
    (entry: RouteSuggestion, source: "search" | "keyboard") => {
      trackEvent("not_found_suggestion_click", {
        pathname,
        query,
        destination: entry.href,
        source,
        score: entry.score,
      });
    },
    [pathname, query]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      if (!isInput && event.key === "/" && !event.shiftKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-label text-[var(--color-gray-500)]">{copy.label}</span>
        <div className="relative mt-2">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.label}
            className="input-field pr-16"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[var(--color-gray-500)] sm:inline">
            {copy.shortcutHint}
          </kbd>
        </div>
      </label>

      <ul className="space-y-1 rounded-[var(--radius-feature)] border border-[var(--border)] bg-black/35 p-2">
        {results.length === 0 ? (
          <li className="px-3 py-2 text-sm text-[var(--color-gray-500)]">{copy.noResults}</li>
        ) : (
          results.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                onClick={() => onSelect(entry, "search")}
                className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  <code className="font-mono text-[0.7rem] text-[var(--color-gray-500)]">{entry.href}</code>
                </div>
                {entry.section ? (
                  <p className="mt-1 text-xs text-[var(--color-gray-500)]">{entry.section}</p>
                ) : null}
                {entry.description ? (
                  <p className="mt-1 text-xs leading-5 text-[var(--color-gray-400)]">{entry.description}</p>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
