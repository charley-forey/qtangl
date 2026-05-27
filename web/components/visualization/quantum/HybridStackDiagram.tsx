"use client";

import { useState } from "react";

import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { hybridStackDiagramCopy } from "@/lib/copy/visualization";

type HybridStackDiagramProps = {
  className?: string;
};

export default function HybridStackDiagram({
  className = "",
}: HybridStackDiagramProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = hybridStackDiagramCopy.bands[activeIndex];

  return (
    <TechnologyBlock
      eyebrow={hybridStackDiagramCopy.eyebrow}
      title={hybridStackDiagramCopy.title}
      description={hybridStackDiagramCopy.description}
      className={className}
    >
      <div
        className="flex h-3 overflow-hidden rounded-full border border-[var(--border)]"
        role="group"
        aria-label="Workflow weight by stage"
      >
        {hybridStackDiagramCopy.bands.map((band, index) => (
          <button
            key={band.label}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={[
              "h-full min-w-[2px] shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]",
              index === activeIndex ? "bg-white/90" : "bg-white/35 hover:bg-white/55",
              index > 0 ? "border-l border-black/40" : "",
            ].join(" ")}
            style={{ flexGrow: band.width, flexBasis: 0 }}
            aria-pressed={index === activeIndex}
            aria-label={`${band.label}, ${band.width}% of workflow`}
            title={`${band.label} (${band.width}%)`}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {hybridStackDiagramCopy.bands.map((band, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={band.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={[
                "touch-target min-h-[4.75rem] rounded-[var(--radius-lg)] border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
                isActive
                  ? "border-[var(--border-strong)] bg-white/[0.08]"
                  : "border-[var(--border)] bg-white/[0.03] hover:border-[var(--border-strong)]",
              ].join(" ")}
              aria-pressed={isActive}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium tabular-nums text-white">{band.width}%</span>
                <span className="truncate text-[10px] uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                  {band.shortLabel}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium leading-snug text-white">{band.label}</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--color-gray-500)]">
                {band.algorithm}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4 sm:p-5"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-sm font-semibold text-white">{active.label}</p>
          <p className="font-mono text-xs text-[var(--color-gray-500)]">{active.algorithm}</p>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{active.description}</p>
        <ul className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
          {active.operations.map((op) => (
            <li
              key={op}
              className="text-sm leading-7 text-[var(--color-gray-400)] before:mr-2 before:content-['—']"
            >
              {op}
            </li>
          ))}
        </ul>
      </div>
    </TechnologyBlock>
  );
}
