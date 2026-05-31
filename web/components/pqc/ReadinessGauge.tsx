"use client";

import InfoTip from "./InfoTip";

export default function ReadinessGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = (clamped / 100) * 270;
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(var(--color-accent) ${angle}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface)] text-2xl font-semibold text-white">
          {clamped}
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-gray-400)]">
        <InfoTip termId="readiness_score" label="Q-Day readiness (endpoint-scoped)" />
      </p>
    </div>
  );
}
