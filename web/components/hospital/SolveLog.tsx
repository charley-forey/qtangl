import type { TimelineEvent } from "@/lib/hospital";

import { HospitalEmptyState, HospitalSection, HospitalSectionHeader } from "./ui";

type SolveLogProps = {
  items: TimelineEvent[];
  isSolving: boolean;
};

const statusLabel: Record<TimelineEvent["status"], string> = {
  done: "Live",
  replayed: "Cached trace",
  skipped: "Skipped",
};

export default function SolveLog({ items, isSolving }: SolveLogProps) {
  return (
    <HospitalSection className="flex h-full flex-col">
      <HospitalSectionHeader
        label="Engine log"
        title="Solve pipeline"
        description="Classical global pass, repair window, then hybrid micro-solve."
      />
      <div className="mt-5 flex-1 space-y-2">
        {items.length ? (
          items.map((item, index) => (
            <div
              key={item.key}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/25 px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--color-gray-500)]">
                    {(item.duration_ms / 1000).toFixed(2)}s
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-gray-500)]">
                  {statusLabel[item.status]}
                </p>
              </div>
            </div>
          ))
        ) : (
          <HospitalEmptyState
            title={isSolving ? "Running solve…" : "Awaiting call-out"}
            description={
              isSolving
                ? "CP-SAT and hybrid passes are executing on the backend."
                : 'Select a scenario and click "Run solve" to populate this log.'
            }
          />
        )}
      </div>
    </HospitalSection>
  );
}
