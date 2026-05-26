import Card from "@/components/ui/Card";
import type { ScheduleVisualization } from "@/lib/demo-data";

type ScheduleTimelineProps = {
  plan: ScheduleVisualization;
};

export default function ScheduleTimeline({ plan }: ScheduleTimelineProps) {
  const horizon = Math.max(...plan.blocks.map((block) => block.start + block.duration), 1);

  return (
    <Card strong className="rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-label">Visual plan</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{plan.title}</h3>
        </div>
        <p className="text-sm text-[var(--color-gray-400)]">{plan.horizonLabel}</p>
      </div>

      <div className="mt-6 space-y-4">
        <div
          className="ml-[7.5rem] grid gap-2 text-xs uppercase tracking-[0.16em] text-[var(--color-gray-500)]"
          style={{ gridTemplateColumns: `repeat(${horizon}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: horizon }, (_, index) => (
            <span key={index}>D{index + 1}</span>
          ))}
        </div>

        {plan.blocks.map((block) => {
          const startPercent = (block.start / horizon) * 100;
          const widthPercent = (block.duration / horizon) * 100;

          return (
            <div key={block.id} className="grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-medium text-white">{block.label}</p>
                <p className="text-xs text-[var(--color-gray-400)]">{block.resource}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-black/45 px-3 py-3">
                <div className="relative h-10 rounded-xl bg-white/[0.03]">
                  <div
                    className="absolute inset-y-1 rounded-lg border border-white/15 bg-white/[0.1] px-3 py-2 text-xs text-white"
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  >
                    <span className="block truncate">{block.label}</span>
                  </div>
                </div>
                {block.note ? (
                  <p className="mt-3 text-xs leading-6 text-[var(--color-gray-400)]">
                    {block.note}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
