"use client";

import { useEffect, useState } from "react";

import { fetchTenantJson } from "@/lib/tenant-api";

type DriftDelta = {
  sourceType: string;
  scopeKey: string;
  addedCount?: number;
  removedCount?: number;
  addedIds?: string[];
  removedIds?: string[];
  hasBaseline?: boolean;
};

export default function DriftScopeDetail({
  apiKey,
  sourceType,
  scopeKey,
}: {
  apiKey: string;
  sourceType: string;
  scopeKey: string;
}) {
  const [delta, setDelta] = useState<DriftDelta | null>(null);

  useEffect(() => {
    const encoded = encodeURIComponent(scopeKey);
    fetchTenantJson<{ delta: DriftDelta }>(
      `/tenant/drift/${sourceType}/${encoded}`,
      apiKey
    ).then((r) => setDelta(r.delta));
  }, [apiKey, sourceType, scopeKey]);

  if (!delta) {
    return <p className="text-sm text-[var(--muted)]">Loading scope drift…</p>;
  }
  if (!delta.hasBaseline) {
    return <p className="text-sm text-[var(--muted)]">First snapshot — baseline will appear after next run.</p>;
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-3 text-sm">
      <p className="font-medium text-white">
        {delta.sourceType} · {delta.scopeKey}
      </p>
      <p className="text-[var(--muted)]">
        +{delta.addedCount ?? 0} added · −{delta.removedCount ?? 0} removed
      </p>
      {(delta.addedIds?.length ?? 0) > 0 && (
        <ul className="mt-2 list-inside list-disc text-xs text-emerald-300">
          {delta.addedIds!.slice(0, 5).map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
