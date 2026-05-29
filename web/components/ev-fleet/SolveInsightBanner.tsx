import type { EvFleetSolveResponse } from "@/lib/ev-fleet";

import { EvFleetChip, EvFleetSection } from "./ui";

export default function SolveInsightBanner({ response }: { response: EvFleetSolveResponse }) {
  const details = response.details as {
    costDeltaVsNaive?: number;
    peakKwReduction?: number;
  };
  return (
    <EvFleetSection className="border-emerald-400/25 bg-emerald-950/20">
      <div className="flex flex-wrap gap-2">
        <EvFleetChip tone="success">Plan ready</EvFleetChip>
        {response.scoreboard.hybrid.hybrid_beats_classical_cost ? (
          <EvFleetChip tone="success">Hybrid saves vs classical</EvFleetChip>
        ) : (
          <EvFleetChip tone="neutral">Classical tied — hybrid adds alternates</EvFleetChip>
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-gray-300)]">
        {response.scoreboard.hybrid.summary}
      </p>
      {details.costDeltaVsNaive != null ? (
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">
          Classical vs naive manual: ${details.costDeltaVsNaive.toFixed(2)}/day · Peak kW reduction{" "}
          {details.peakKwReduction?.toFixed(1) ?? "—"}
        </p>
      ) : null}
    </EvFleetSection>
  );
}
