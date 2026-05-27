"use client";

import { useState } from "react";

import { candidateFunnelCopy } from "@/lib/copy/visualization";
import { candidateFunnelStages } from "@/lib/copy/technology-deep";

type CandidateFunnelProps = {
  className?: string;
  compact?: boolean;
};

export default function CandidateFunnel({
  className = "",
  compact = false,
}: CandidateFunnelProps) {
  const [activeIndex, setActiveIndex] = useState(candidateFunnelStages.length - 1);
  const active = candidateFunnelStages[activeIndex];
  const maxCount = candidateFunnelStages[0].count;

  return (
    <section
      aria-label={candidateFunnelCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!compact ? (
        <>
          <p className="text-label">{candidateFunnelCopy.eyebrow}</p>
          <h3 className="mt-3 text-lg font-semibold text-white">{candidateFunnelCopy.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
            {candidateFunnelCopy.description}
          </p>
        </>
      ) : (
        <p className="text-sm leading-7 text-[var(--color-gray-500)]">
          {candidateFunnelCopy.description}
        </p>
      )}

      <div className={compact ? "mt-4 space-y-2" : "mt-6 space-y-2"} role="list">
        {candidateFunnelStages.map((stage, index) => {
          const widthPct = Math.max(8, (stage.count / maxCount) * 100);
          const isActive = index === activeIndex;

          return (
            <button
              key={stage.label}
              type="button"
              role="listitem"
              onClick={() => setActiveIndex(index)}
              className={[
                "flex w-full items-center gap-4 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-colors",
                isActive
                  ? "border-[var(--border-strong)] bg-white/[0.08]"
                  : "border-[var(--border)] bg-white/[0.03] hover:border-[var(--border-strong)]",
              ].join(" ")}
              aria-pressed={isActive}
              aria-describedby="funnel-detail"
            >
              <span className="min-w-[5.5rem] text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                {stage.label}
              </span>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-white/90 transition-[width] duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
              <span className="min-w-[2.5rem] text-right text-sm font-medium text-white">
                {stage.count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="funnel-detail"
        className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4"
      >
        <p className="text-sm font-medium text-white">{active.label}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{active.reason}</p>
      </div>
    </section>
  );
}
