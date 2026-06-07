"use client";

import { useState } from "react";

import { qtanglApiBaseUrl } from "@/lib/api";

export type MergeConflict = {
  id: string;
  componentKey: string;
  field: string;
  valueA: string;
  valueB: string;
  sourceA: string;
  sourceB: string;
  status: string;
};

export default function MergeConflictPanel({
  apiKey,
  conflicts,
  onResolved,
}: {
  apiKey: string;
  conflicts: MergeConflict[];
  onResolved?: () => void;
}) {
  const [resolving, setResolving] = useState<string | null>(null);

  if (!conflicts.length) {
    return (
      <p className="text-sm text-[var(--color-gray-400)]">No open merge conflicts — aggregated CBOM is consistent.</p>
    );
  }

  async function resolve(conflictId: string, value: string) {
    setResolving(conflictId);
    try {
      const response = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/conflicts/${encodeURIComponent(conflictId)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolvedValue: value }),
      });
      if (!response.ok) {
        throw new Error("Resolve failed.");
      }
      onResolved?.();
    } finally {
      setResolving(null);
    }
  }

  return (
    <div className="space-y-3">
      {conflicts.map((conflict) => (
        <div key={conflict.id} className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-3 text-sm">
          <p className="font-mono text-xs text-amber-200">{conflict.componentKey.slice(0, 16)}…</p>
          <p className="mt-1 text-[var(--color-gray-300)]">
            Field <strong>{conflict.field}</strong>: <code>{String(conflict.valueA)}</code> vs{" "}
            <code>{String(conflict.valueB)}</code>
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={resolving === conflict.id}
              className="rounded border border-[var(--border-strong)] px-2 py-1 text-xs"
              onClick={() => resolve(conflict.id, String(conflict.valueA))}
            >
              Keep A
            </button>
            <button
              type="button"
              disabled={resolving === conflict.id}
              className="rounded border border-[var(--border-strong)] px-2 py-1 text-xs"
              onClick={() => resolve(conflict.id, String(conflict.valueB))}
            >
              Keep B
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
