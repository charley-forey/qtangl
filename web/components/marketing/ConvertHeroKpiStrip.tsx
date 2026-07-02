"use client";

import { convertEvidenceCallout } from "@/lib/copy/readiness-convert";
import { convertPreviewBaseline, convertPreviewItems } from "@/lib/copy/readiness-demos";

export default function ConvertHeroKpiStrip() {
  const chips: Array<{
    label: string;
    value: string;
    highlight?: boolean;
    className?: string;
  }> = [
    {
      label: "Readiness score",
      value: convertPreviewBaseline.currentScore.toFixed(1),
      highlight: true,
    },
    {
      label: "Backlog items",
      value: String(convertPreviewItems.length),
    },
    {
      label: "Projected delta",
      value: `+${convertPreviewBaseline.projectedDelta}`,
      className: "text-emerald-300",
    },
    {
      label: "Velocity",
      value: `${convertPreviewBaseline.itemsPerWeek}/wk`,
    },
    {
      label: "After verify-fix",
      value: convertEvidenceCallout.afterScore.toFixed(1),
      className: "text-emerald-300",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4"
      role="list"
      aria-label="Convert program KPI summary"
    >
      {chips.map((chip) => (
        <div
          key={chip.label}
          role="listitem"
          className={[
            "min-h-[5.5rem] rounded-[var(--radius-xl)] border px-4 py-4 sm:px-5 sm:py-5",
            chip.highlight
              ? "border-white/20 bg-white/[0.06]"
              : "border-[var(--border)] bg-black/40",
          ].join(" ")}
        >
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            {chip.label}
          </p>
          <p
            className={[
              "mt-1.5 font-semibold tabular-nums",
              chip.highlight ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              chip.className ?? "text-white",
            ].join(" ")}
          >
            {chip.value}
          </p>
        </div>
      ))}
    </div>
  );
}
