"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import TechnologyBlock from "@/components/technology/TechnologyBlock";
import usePrefersReducedMotion from "@/lib/usePrefersReducedMotion";
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
  const reduceMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState<{
    row: string;
    col: string;
    value: number;
  } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closePopup = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selected, closePopup]);

  const detail = selected
    ? interferenceCellDetails[cellKey(selected.row, selected.col)] ?? {
        pair: `${selected.row} × ${selected.col}`,
        pressure: "Constraint pressure across this dimension pair.",
        resolution: "Re-rank after adjusting weights or relaxing soft constraints.",
      }
    : null;

  const pressurePct = selected ? Math.round(selected.value * 100) : 0;

  const hoverScale = reduceMotion ? "" : "hover:scale-[1.04]";

  return (
    <TechnologyBlock
      eyebrow={interferenceHeatmapCopy.eyebrow}
      title={interferenceHeatmapCopy.title}
      description={interferenceHeatmapCopy.description}
      className={className}
      contentClassName="grid-min-0"
    >
      <p
        id="heatmap-hint"
        className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--color-gray-400)] sm:flex-row sm:items-center sm:gap-3"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-md border border-[var(--border)] bg-white/[0.06] text-[10px] uppercase tracking-widest text-[var(--color-gray-300)] sm:self-center"
        >
          +
        </span>
        <span>{interferenceHeatmapCopy.hint}</span>
      </p>

      <div className="tech-scroll-x">
        <div
          className="grid min-w-[28rem] gap-2"
          style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(0, 1fr))` }}
          role="grid"
          aria-describedby="heatmap-hint"
        >
          <div />
          {xLabels.map((label) => (
            <div
              key={label}
              role="columnheader"
              className="px-2 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--color-gray-500)]"
            >
              {label}
            </div>
          ))}

          {yLabels.map((rowLabel, rowIndex) => (
            <div key={rowLabel} className="contents">
              <div
                role="rowheader"
                className="flex items-center pr-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-gray-500)]"
              >
                {rowLabel}
              </div>
              {values[rowIndex].map((value, cellIndex) => {
                const colLabel = xLabels[cellIndex];
                const isSelected =
                  selected?.row === rowLabel && selected?.col === colLabel;
                const pct = Math.round(value * 100);

                return (
                  <button
                    key={`${rowLabel}-${colLabel}`}
                    type="button"
                    role="gridcell"
                    onClick={() => setSelected({ row: rowLabel, col: colLabel, value })}
                    className={[
                      "group relative aspect-square min-h-[2.75rem] min-w-[2.75rem] cursor-pointer rounded-lg border transition-all duration-200",
                      hoverScale,
                      "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-panel)]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                      isSelected
                        ? "scale-[1.04] border-[var(--border-bright)] ring-2 ring-white/20"
                        : "border-white/10",
                    ].join(" ")}
                    style={{
                      background: `rgba(255,255,255,${0.08 + Math.max(0, Math.min(value, 1)) * 0.72})`,
                    }}
                    aria-label={`${rowLabel} × ${colLabel}, ${pct}% pressure. Click for details.`}
                    aria-haspopup="dialog"
                    aria-expanded={isSelected}
                  >
                    <span
                      className={[
                        "absolute inset-0 flex items-center justify-center text-[11px] font-medium tabular-nums transition-opacity",
                        "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                        isSelected ? "opacity-100 text-white" : "text-[var(--color-gray-300)]",
                      ].join(" ")}
                      aria-hidden
                    >
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected && detail ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="presentation"
          onClick={closePopup}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" aria-hidden />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="heatmap-dialog-title"
            className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--gray-950)] p-5 shadow-[var(--shadow-feature)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-label" id="heatmap-dialog-title">
                  {detail.pair}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {pressurePct}%
                  <span className="ml-2 text-sm font-normal text-[var(--color-gray-500)]">
                    pressure
                  </span>
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closePopup}
                className="touch-target shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[var(--color-gray-400)] transition-colors hover:border-[var(--border-strong)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                {interferenceHeatmapCopy.popupClose}
              </button>
            </div>

            <p className="mt-5 text-sm leading-7 text-[var(--color-gray-300)]">
              {detail.pressure}
            </p>
            <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm leading-7 text-[var(--color-gray-200)]">
              <span className="font-semibold text-white">Resolution: </span>
              {detail.resolution}
            </p>
          </div>
        </div>
      ) : null}
    </TechnologyBlock>
  );
}
