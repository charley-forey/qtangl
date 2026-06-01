"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { postTenantJson } from "@/lib/tenant-api";

type RemediationItem = {
  id: string;
  title: string;
  severity: string;
};

type Projection = {
  currentReadinessScore: number;
  projectedReadinessScore: number;
  delta: number;
  selectedCount: number;
  assumptions: string[];
};

export default function RemediationWhatIf({
  apiKey,
  scanId,
  items,
}: {
  apiKey: string;
  scanId: string;
  items: RemediationItem[];
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [projection, setProjection] = useState<Projection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(
    async (ids: string[]) => {
      if (!ids.length) {
        setProjection(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const payload = await postTenantJson<{ projection: Projection }>(
          `/tenant/scans/${scanId}/remediation/simulate`,
          apiKey,
          { remediationIds: ids }
        );
        setProjection(payload.projection);
      } catch (simError) {
        setProjection(null);
        setError(simError instanceof Error ? simError.message : "Simulation failed.");
      } finally {
        setLoading(false);
      }
    },
    [apiKey, scanId]
  );

  useEffect(() => {
    void runSimulation([...selected]);
  }, [selected, runSimulation]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (!items.length) {
    return null;
  }

  return (
    <Card tone="panel" className="mt-6 rounded-[var(--radius-xl)]">
      <Eyebrow>What-if projection</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Select backlog items to estimate readiness after remediation. Assumes successful implementation and re-scan.
      </p>

      {projection ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border-subtle)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Current</p>
            <p className="mt-1 text-xl font-semibold text-white">{projection.currentReadinessScore}</p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Projected</p>
            <p className="mt-1 text-xl font-semibold text-emerald-300">
              {projection.projectedReadinessScore}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Delta</p>
            <p className="mt-1 text-xl font-semibold text-white">+{projection.delta}</p>
          </div>
        </div>
      ) : null}

      {loading ? <p className="mt-3 text-xs text-[var(--color-gray-500)]">Calculating…</p> : null}
      {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}

      <div className="mt-4 space-y-2">
        {items.slice(0, 8).map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border-subtle)] p-3"
          >
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border-strong)]"
            />
            <span className="text-sm text-[var(--color-gray-300)]">
              {item.title}
              <span className="ml-2 text-xs text-[var(--color-gray-500)]">{item.severity}</span>
            </span>
          </label>
        ))}
      </div>

      {projection?.assumptions.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--color-gray-500)]">
          {projection.assumptions.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
