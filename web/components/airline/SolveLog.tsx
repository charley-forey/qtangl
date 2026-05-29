import type { TimelineEvent } from "@/lib/airline";

import { AirlineEmptyState, AirlineSection, AirlineSectionHeader } from "./ui";

const statusLabel: Record<TimelineEvent["status"], string> = {
  done: "Live",
  replayed: "Cached trace",
  skipped: "Skipped",
};

const SOLVE_STEPS = [
  "Aircraft routing repair",
  "CP-SAT crew assignment",
  "Repair window detection",
  "Hybrid micro-solve",
];

export default function SolveLog({
  items,
  isSolving,
}: {
  items: TimelineEvent[];
  isSolving: boolean;
}) {
  return (
    <AirlineSection className="flex h-full flex-col">
      <AirlineSectionHeader
        label="Engine log"
        title="Recovery pipeline"
        description={
          isSolving
            ? "Running on the backend…"
            : items.length
              ? "Completed — see recovery plans below."
              : "Tail routing, crew assignment, repair window, then hybrid micro-solve."
        }
      />
      <div className="mt-5 flex-1 space-y-2">
        {isSolving ? (
          SOLVE_STEPS.map((step, index) => (
            <div
              key={step}
              className="airline-solve-pulse flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-white/[0.04] px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-medium text-[var(--color-gray-400)]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{step}</p>
                <p className="mt-1 text-xs text-[var(--color-gray-500)]">In progress…</p>
              </div>
            </div>
          ))
        ) : items.length ? (
          items.map((item, index) => (
            <div
              key={item.key}
              className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/25 px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-medium text-sky-100">
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
          <AirlineEmptyState
            title="Awaiting disruption"
            description='Select a scenario and click "Recover" to populate this log.'
          />
        )}
      </div>
    </AirlineSection>
  );
}
