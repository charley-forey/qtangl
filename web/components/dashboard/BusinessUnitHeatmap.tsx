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
  scoreScope,
  title = "Business unit readiness",
}: {
  businessUnits: Record<string, number | null>;
  scoreScope?: string;
  title?: string;
  deltas?: Record<string, number | null>;
  onSelectUnit?: (unit: string) => void;
}) {
  const entries = Object.entries(businessUnits).sort(([, a], [, b]) => (a ?? Infinity) - (b ?? Infinity));
  const [mode, setMode] = useState<"grid" | "treemap">("grid");
  if (entries.length === 0) {
    return null;
  }

  const treemap = ccFlags.v2 && mode === "treemap";
  const visibleEntries = treemap ? entries.filter(([, score]) => score == null || score === 0) : entries;
  const treemapData = entries.flatMap(([unit, score]) =>
    score != null && score > 0 ? [{ name: unit, value: score, fill: treemapFill(score) }] : []
  );

  function cellColor(score: number | null) {
    if (score == null) return "bg-white/5 border-white/10";
    if (score >= 80) return "bg-emerald-500/30 border-emerald-500/40";
    if (score >= 60) return "bg-amber-500/20 border-amber-500/40";
    return "bg-red-500/20 border-red-500/40";
  }

  return (
    <Card tone="panel">
      <div className="flex items-center justify-between">
        <Eyebrow>{title}</Eyebrow>
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
      {scoreScope ? <p className="mt-2 text-xs text-[var(--color-gray-400)]">{scoreScope}</p> : null}
      {treemap && treemapData.length > 0 ? (
        <div className="mt-4">
          <CcTreemap
            data={treemapData}
            onCellClick={onSelectUnit}
          />
        </div>
      ) : null}
      {visibleEntries.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEntries.map(([unit, score]) => (
            <button
              key={unit}
              type="button"
              onClick={() => onSelectUnit?.(unit)}
              className={`rounded-xl border px-4 py-3 text-left transition hover:brightness-110 ${cellColor(score)}`}
            >
              <p className="text-sm font-medium text-white">{unit}</p>
              <p className={`mt-1 font-semibold ${score == null ? "text-sm text-[var(--color-gray-400)]" : "text-2xl text-white"}`}>
                {score ?? "Readiness unavailable"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-gray-400)]">
                Δ {deltas?.[unit] != null ? deltas[unit] : "—"}
              </p>
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
