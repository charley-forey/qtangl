"use client";

import { useState } from "react";

import { interferenceHeatmapCopy } from "@/lib/copy/visualization";
import { interferenceCellDetails } from "@/lib/copy/technology-deep";

type InterferenceHeatmapProps = {
  xLabels: string[];
  yLabels: string[];
  values: number[][];
  className?: string;
};

function cellKey(rowLabel: string, colLabel: string) {
  return `${rowLabel}-${colLabel}`;
}

export default function InterferenceHeatmap({
  xLabels,
  yLabels,
  values,
  className = "",
}: InterferenceHeatmapProps) {
  const [selected, setSelected] = useState<{ row: string; col: string } | null>(null);

  const detail = selected
    ? interferenceCellDetails[cellKey(selected.row, selected.col)] ?? {
        pair: `${selected.row} × ${selected.col}`,
        pressure: "Constraint pressure across this dimension pair.",
        resolution: "Re-rank after adjusting weights or relaxing soft constraints.",
      }
    : null;

  return (
    <section
      aria-label={interferenceHeatmapCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{interferenceHeatmapCopy.eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{interferenceHeatmapCopy.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        {interferenceHeatmapCopy.description}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[28rem] gap-2"
            style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(0, 1fr))` }}
          >
            <div />
            {xLabels.map((label) => (
              <div
                key={label}
                className="px-2 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--color-gray-500)]"
              >
                {label}
              </div>
            ))}

            {yLabels.map((rowLabel, rowIndex) => (
              <div key={rowLabel} className="contents">
                <div className="flex items-center pr-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                  {rowLabel}
                </div>
                {values[rowIndex].map((value, cellIndex) => {
                  const colLabel = xLabels[cellIndex];
                  const isSelected =
                    selected?.row === rowLabel && selected?.col === colLabel;

                  return (
                    <button
                      key={`${rowLabel}-${colLabel}`}
                      type="button"
                      onClick={() => setSelected({ row: rowLabel, col: colLabel })}
                      className={[
                        "aspect-square rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
                        isSelected
                          ? "border-[var(--border-strong)]"
                          : "border-white/8 hover:border-[var(--border-strong)]",
                      ].join(" ")}
                      style={{
                        background: `rgba(255,255,255,${0.08 + Math.max(0, Math.min(value, 1)) * 0.72})`,
                      }}
                      title={`${rowLabel} x ${colLabel}: ${Math.round(value * 100)}% pressure`}
                      aria-label={`${rowLabel} x ${colLabel}: ${Math.round(value * 100)}% pressure`}
                      aria-pressed={isSelected}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <aside
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4"
          aria-live="polite"
        >
          {detail ? (
            <>
              <p className="text-label">{detail.pair}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
                {detail.pressure}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-gray-200)]">
                <span className="font-semibold text-white">Resolution: </span>
                {detail.resolution}
              </p>
            </>
          ) : (
            <p className="text-sm leading-7 text-[var(--color-gray-500)]">
              Select a cell to see which constraint pair is under pressure and how the solver
              typically resolves it.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
