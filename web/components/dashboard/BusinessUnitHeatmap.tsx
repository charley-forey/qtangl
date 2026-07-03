"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import CcTreemap from "@/components/dashboard/charts/CcTreemap";
import { ccFlags } from "@/lib/cc-feature-flags";

function treemapFill(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

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
  const [mode, setMode] = useState<"grid" | "treemap">("grid");
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
      <div className="flex items-center justify-between">
        <Eyebrow>Business unit readiness</Eyebrow>
        {ccFlags.v2 ? (
          <div className="flex gap-1 text-[10px]">
            <button
              type="button"
              className={`rounded-full px-2 py-1 ${mode === "grid" ? "bg-sky-500/20 text-sky-300" : "text-gray-500"}`}
              onClick={() => setMode("grid")}
            >
              Grid
            </button>
            <button
              type="button"
              className={`rounded-full px-2 py-1 ${mode === "treemap" ? "bg-sky-500/20 text-sky-300" : "text-gray-500"}`}
              onClick={() => setMode("treemap")}
            >
              Treemap
            </button>
          </div>
        ) : null}
      </div>
      {ccFlags.v2 && mode === "treemap" ? (
        <div className="mt-4">
          <CcTreemap
            data={entries.map(([unit, score]) => ({ name: unit, value: score, fill: treemapFill(score) }))}
            onCellClick={onSelectUnit}
          />
        </div>
      ) : (
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
      )}
    </Card>
  );
}
