"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { trackEvent } from "@/lib/analytics";

export default function HubSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) {
      return;
    }
    trackEvent("learn_hub_search", { query: normalized });
    router.push(`/learn/library?q=${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[var(--color-gray-400)]">
          Search the library
        </span>
        <div className="flex gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Qiskit, simulators, optimization..."
            className="w-full rounded-2xl border border-[var(--border)] bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--border-strong)]"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full border border-[var(--border-strong)] bg-white/[0.08] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.12]"
          >
            Search
          </button>
        </div>
      </label>
    </form>
  );
}
