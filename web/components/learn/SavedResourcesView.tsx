"use client";

import { useEffect, useMemo, useState } from "react";

import LibraryResourceCard from "@/components/learn/LibraryResourceCard";
import type { LibraryIndexEntry } from "@/lib/library";

const SAVED_KEY = "qtangl-learn-saved";

type SavedResourcesViewProps = {
  entries: LibraryIndexEntry[];
};

export default function SavedResourcesView({ entries }: SavedResourcesViewProps) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      setSavedSlugs(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setSavedSlugs([]);
    }
  }, []);

  const savedEntries = useMemo(
    () => entries.filter((entry) => savedSlugs.includes(entry.slug)),
    [entries, savedSlugs]
  );

  if (!savedEntries.length) {
    return (
      <p className="text-sm leading-8 text-[var(--color-gray-300)]">
        No saved resources yet. Open any library entry and click &quot;Save resource&quot; to build your list.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {savedEntries.map((entry) => (
        <LibraryResourceCard key={entry.slug} entry={entry} />
      ))}
    </div>
  );
}
