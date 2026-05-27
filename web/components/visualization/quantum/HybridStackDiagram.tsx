"use client";

import { useState } from "react";

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
    <section
      aria-label={hybridStackDiagramCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{hybridStackDiagramCopy.eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{hybridStackDiagramCopy.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        {hybridStackDiagramCopy.description}
      </p>

      <div className="mt-6 flex overflow-hidden rounded-full border border-[var(--border)]">
        {hybridStackDiagramCopy.bands.map((band, index) => (
          <button
            key={band.label}
            type="button"
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            className={[
              "flex min-h-24 items-end px-4 py-4 text-left text-sm leading-6 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]",
              index === activeIndex ? "bg-white/[0.18]" : "bg-white/[0.08] hover:bg-white/[0.12]",
            ].join(" ")}
            style={{ width: `${band.width}%` }}
            aria-pressed={index === activeIndex}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-200)]">
                {band.width}%
              </p>
              <p className="mt-2 font-medium">{band.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div
        className="mt-3 flex justify-between gap-2 px-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-gray-500)]"
        aria-hidden
      >
        {hybridStackDiagramCopy.bands.map((band) => (
          <span key={band.label} style={{ width: `${band.width}%` }} className="truncate">
            {band.algorithm}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4">
        <p className="font-mono text-xs text-[var(--color-gray-500)]">{active.algorithm}</p>
        <p className="mt-2 text-sm font-medium text-white">{active.label}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{active.description}</p>
        <ul className="mt-4 space-y-2">
          {active.operations.map((op) => (
            <li key={op} className="text-sm leading-7 text-[var(--color-gray-400)]">
              {op}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {hybridStackDiagramCopy.bands.map((band, index) => (
          <button
            key={`card-${band.label}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={[
              "rounded-[var(--radius-lg)] border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              index === activeIndex
                ? "border-[var(--border-strong)] bg-white/[0.06]"
                : "border-[var(--border)] bg-white/[0.03] hover:border-[var(--border-strong)]",
            ].join(" ")}
          >
            <p className="font-mono text-[10px] text-[var(--color-gray-500)]">{band.algorithm}</p>
            <p className="mt-2 text-sm font-medium text-white">{band.label}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">
              {band.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
