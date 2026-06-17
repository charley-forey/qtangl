"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

type DriftPoint = {
  id?: string;
  sourceType?: string;
  scopeKey?: string;
  capturedAt?: string;
};

export default function DriftTimeline() {
  const [points, setPoints] = useState<DriftPoint[]>([]);

  useEffect(() => {
    fetchDashboardJson<{ snapshots?: DriftPoint[] }>("/tenant/drift/history?limit=20")
      .then((payload) => setPoints(payload.snapshots ?? []))
      .catch(() => setPoints([]));
  }, []);

  return (
    <Card tone="panel">
      <Eyebrow>Drift history</Eyebrow>
      {points.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">No drift snapshots yet.</p>
      ) : (
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs text-[var(--color-gray-300)]">
          {points.map((p) => (
            <li key={p.id ?? `${p.sourceType}-${p.scopeKey}`} className="rounded border border-[var(--border-subtle)] px-3 py-2">
              <span className="text-white">{p.sourceType}</span> · {p.scopeKey}
              {p.capturedAt ? <span className="block text-[var(--color-gray-500)]">{p.capturedAt}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
