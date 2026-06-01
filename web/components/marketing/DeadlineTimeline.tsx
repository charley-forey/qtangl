import { qDayHubCopy, type DeadlineTier } from "@/lib/copy/readiness-qday-hub";

const urgencyStyles: Record<DeadlineTier["urgency"], string> = {
  immediate: "border-white/30 bg-white/[0.08]",
  near: "border-[var(--border-strong)] bg-white/[0.05]",
  mid: "border-[var(--border)] bg-black/40",
  long: "border-[var(--border)] bg-black/30",
};

type DeadlineTimelineProps = {
  tiers?: readonly DeadlineTier[];
};

export default function DeadlineTimeline({ tiers = qDayHubCopy.deadlines.tiers }: DeadlineTimelineProps) {
  return (
    <div className="space-y-4">
      {tiers.map((tier) => (
        <div
          key={tier.framework}
          className={[
            "rounded-[var(--radius-xl)] border px-5 py-4 sm:px-6",
            urgencyStyles[tier.urgency],
          ].join(" ")}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-white">{tier.framework}</p>
            <p className="text-sm text-[var(--color-gray-300)]">{tier.deadline}</p>
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--color-gray-400)]">{tier.summary}</p>
        </div>
      ))}
    </div>
  );
}
