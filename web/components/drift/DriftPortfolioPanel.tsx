"use client";

import { useEffect, useState } from "react";

import { fetchTenantJson } from "@/lib/tenant-api";

type DriftSummary = {
  sinceDays: number;
  scopeCount: number;
  totalAdded: number;
  totalRemoved: number;
  bySource: Record<string, { scopes: number; added: number; removed: number }>;
  snapshotCount: number;
};

export default function DriftPortfolioPanel({ apiKey }: { apiKey: string }) {
  const [summary, setSummary] = useState<DriftSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantJson<DriftSummary & { status: string }>("/tenant/drift/summary?since_days=7", apiKey)
      .then((data) => setSummary(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load drift"));
  }, [apiKey]);

  if (error) {
    return <p className="text-sm text-amber-400">{error}</p>;
  }
  if (!summary) {
    return <p className="text-sm text-[var(--muted)]">Loading drift summary…</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border-strong)] bg-black/40 p-4">
      <h3 className="font-medium text-white">Portfolio drift (7d)</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-2xl font-semibold text-white">{summary.totalAdded}</p>
          <p className="text-xs text-[var(--muted)]">Added findings</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{summary.totalRemoved}</p>
          <p className="text-xs text-[var(--muted)]">Removed findings</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{summary.scopeCount}</p>
          <p className="text-xs text-[var(--muted)]">Monitored scopes</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(summary.bySource).map(([source, stats]) => (
          <span
            key={source}
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--color-gray-300)]"
          >
            {source}: +{stats.added} / −{stats.removed}
          </span>
        ))}
      </div>
    </div>
  );
}
