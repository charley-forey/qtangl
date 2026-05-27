"use client";

import dynamic from "next/dynamic";

import type { LibraryCategorySummary, LibraryIndexEntry } from "@/lib/library-types";

const EcosystemGraph = dynamic(() => import("./EcosystemGraph"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-[var(--color-gray-400)]">Loading ecosystem map…</p>
  ),
});

type EcosystemGraphLoaderProps = {
  entries: LibraryIndexEntry[];
  categories: LibraryCategorySummary[];
};

export default function EcosystemGraphLoader(props: EcosystemGraphLoaderProps) {
  return <EcosystemGraph {...props} />;
}
