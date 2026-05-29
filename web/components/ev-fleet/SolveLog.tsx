import type { TimelineEvent } from "@/lib/ev-fleet";

import { EvFleetEmptyState, EvFleetSection, EvFleetSectionHeader } from "./ui";

export default function SolveLog({
  items,
  isSolving,
}: {
  items: TimelineEvent[];
  isSolving: boolean;
}) {
  return (
    <EvFleetSection className="h-full">
      <EvFleetSectionHeader label="Pipeline" title="Solve timeline" />
      {isSolving ? (
        <p className="mt-6 text-sm text-[var(--color-gray-400)]">Running VRP → CP-SAT → hybrid micro-solve…</p>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EvFleetEmptyState title="No timeline yet" description='Click "Plan routes + charge" to run the pipeline.' />
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3"
            >
              <span className="text-sm text-white">{item.label}</span>
              <span className="font-mono text-xs text-[var(--color-gray-500)]">
                {item.duration_ms}ms · {item.status}
              </span>
            </li>
          ))}
        </ol>
      )}
    </EvFleetSection>
  );
}
