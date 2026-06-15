"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

export default function BusinessUnitHeatmap({
  businessUnits,
  deltas,
  onSelectUnit,
}: {
  businessUnits: Record<string, number>;
  deltas?: Record<string, number | null>;
  onSelectUnit?: (unit: string) => void;
}) {
  const entries = Object.entries(businessUnits).sort(([, a], [, b]) => a - b);
  if (entries.length === 0) {
    return null;
  }

  function cellColor(score: number) {
    if (score >= 80) return "bg-emerald-500/30 border-emerald-500/40";
    if (score >= 60) return "bg-amber-500/20 border-amber-500/40";
    return "bg-red-500/20 border-red-500/40";
  }

  return (
    <Card tone="panel">
      <Eyebrow>Business unit readiness</Eyebrow>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([unit, score]) => (
          <button
            key={unit}
            type="button"
            onClick={() => onSelectUnit?.(unit)}
            className={`rounded-xl border px-4 py-3 text-left transition hover:brightness-110 ${cellColor(score)}`}
          >
            <p className="text-sm font-medium text-white">{unit}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{score}</p>
            <p className="mt-1 text-xs text-[var(--color-gray-400)]">
              Δ {deltas?.[unit] != null ? deltas[unit] : "—"}
            </p>
          </button>
        ))}
      </div>
    </Card>
  );
}
