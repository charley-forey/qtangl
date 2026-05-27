import Card from "@/components/ui/Card";
import type { TimelineEvent } from "@/lib/hospital";

type SolveLogProps = {
  items: TimelineEvent[];
  isSolving: boolean;
};

export default function SolveLog({ items, isSolving }: SolveLogProps) {
  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-label">Solve log</p>
      <h3 className="mt-3 text-xl font-semibold text-white">What the engine is doing</h3>
      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.key}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/30 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-white">{item.label}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">
                  {item.duration_ms} ms
                </span>
              </div>
              <p className="mt-2 text-xs leading-6 text-[var(--color-gray-400)]">
                {item.status === "replayed"
                  ? "Replayed from the cached QPU trace for a recording-safe run."
                  : item.status === "skipped"
                    ? "Skipped in this pass."
                    : "Completed in the live backend path."}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm leading-7 text-[var(--color-gray-300)]">
            {isSolving
              ? "Initializing the call-out solver..."
              : "The log will fill as soon as you fire the call-out."}
          </p>
        )}
      </div>
    </Card>
  );
}
