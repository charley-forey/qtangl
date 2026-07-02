"use client";

import { useConvertDemo } from "@/components/marketing/convert-demo-context";
import { convertEvidenceCallout } from "@/lib/copy/readiness-convert";
import { convertPreviewBaseline } from "@/lib/copy/readiness-demos";

export default function ConvertEvidenceCallout() {
  const { projectedScore } = useConvertDemo();

  return (
    <div className="rounded-[var(--radius-xl)] border border-emerald-500/30 bg-emerald-950/20 px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-label text-emerald-300/90">{convertEvidenceCallout.label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white sm:text-3xl">
        <span>{convertPreviewBaseline.currentScore}</span>
        <span className="mx-2 text-[var(--color-gray-500)]">→</span>
        <span className="text-emerald-300">{projectedScore.toFixed(1)}</span>
        <span className="ml-2 text-base font-normal text-[var(--color-gray-400)]">
          (target {convertEvidenceCallout.afterScore} after full wave)
        </span>
      </p>
    </div>
  );
}
