"use client";

import {
  ASSESS_CBOM_IMPORT_ENABLED,
  ASSESS_PORTFOLIO_ENABLED,
  ASSESS_AI_NARRATIVE_ENABLED,
} from "@/lib/assess-config";
import { PqcChip } from "@/components/pqc/ui";

export default function AssessFeatureFlagsStrip() {
  const flags = [
    ASSESS_CBOM_IMPORT_ENABLED ? { label: "PEM / CBOM import", tone: "ok" as const } : null,
    ASSESS_PORTFOLIO_ENABLED ? { label: "Portfolio scan", tone: "ok" as const } : null,
    ASSESS_AI_NARRATIVE_ENABLED ? { label: "AI executive brief", tone: "ok" as const } : null,
    { label: "Lite scan (depth=lite)", tone: "warn" as const },
  ].filter(Boolean) as { label: string; tone: "ok" | "warn" }[];

  if (!flags.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-[var(--color-gray-500)]">Available in your workspace:</span>
      {flags.map((flag) => (
        <PqcChip key={flag.label} tone={flag.tone}>
          {flag.label}
        </PqcChip>
      ))}
    </div>
  );
}
