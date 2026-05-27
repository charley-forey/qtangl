"use client";

import { useState } from "react";

import TechnologyBlock from "@/components/technology/TechnologyBlock";
import { candidateFunnelCopy } from "@/lib/copy/visualization";
import { candidateFunnelStages } from "@/lib/copy/technology-deep";

type CandidateFunnelContentProps = {
  className?: string;
};

export function CandidateFunnelContent({ className = "" }: CandidateFunnelContentProps) {
  const [activeIndex, setActiveIndex] = useState(candidateFunnelStages.length - 1);
  const active = candidateFunnelStages[activeIndex];
  const maxCount = candidateFunnelStages[0].count;

  return (
    <div className={["tech-stack", className].filter(Boolean).join(" ")}>
      <div className="space-y-2" role="list">
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
                "touch-target flex w-full min-h-[2.75rem] items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-colors sm:gap-4",
                isActive
                  ? "border-[var(--border-strong)] bg-white/[0.08]"
                  : "border-[var(--border)] bg-white/[0.03] hover:border-[var(--border-strong)]",
              ].join(" ")}
              aria-pressed={isActive}
              aria-describedby="funnel-detail"
            >
              <span className="w-20 shrink-0 text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)] sm:w-24">
                {stage.label}
              </span>
              <div className="min-w-0 flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-white/90 transition-[width] duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-white">
                {stage.count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="funnel-detail"
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/[0.03] p-4"
      >
        <p className="text-sm font-medium text-white">{active.label}</p>
        <p className="mt-2 text-sm leading-7 text-[var(--color-gray-300)]">{active.reason}</p>
      </div>
    </div>
  );
}

type CandidateFunnelProps = {
  className?: string;
  variant?: "panel" | "content";
};

export default function CandidateFunnel({
  className = "",
  variant = "panel",
}: CandidateFunnelProps) {
  if (variant === "content") {
    return <CandidateFunnelContent className={className} />;
  }

  return (
    <TechnologyBlock
      eyebrow={candidateFunnelCopy.eyebrow}
      title={candidateFunnelCopy.title}
      description={candidateFunnelCopy.description}
      className={className}
    >
      <CandidateFunnelContent />
    </TechnologyBlock>
  );
}
