"use client";

import { calculatePqcRoi } from "@/lib/pqc-roi";

export default function RoiCalculator({ quantumVulnerable }: { quantumVulnerable: number }) {
  const roi = calculatePqcRoi({ quantumVulnerableAssets: quantumVulnerable });
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-gray-500)]">Compliance exposure</p>
      <p className="mt-2 text-sm font-medium text-white">{roi.headline}</p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">{roi.hndlRiskLabel}</p>
    </div>
  );
}
