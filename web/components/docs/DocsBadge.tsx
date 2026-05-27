import type { DocsFeatureStatus } from "@/lib/docs/types";

const labels: Record<DocsFeatureStatus, string> = {
  ga: "GA",
  pilot: "Pilot",
  "coming-soon": "Coming soon",
  research: "Research",
  deprecated: "Deprecated",
};

const styles: Record<DocsFeatureStatus, string> = {
  ga: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
  pilot: "border-amber-500/35 bg-amber-500/10 text-amber-100",
  "coming-soon": "border-[var(--border-strong)] bg-white/[0.06] text-[var(--color-gray-300)]",
  research: "border-violet-500/35 bg-violet-500/10 text-violet-100",
  deprecated: "border-red-500/35 bg-red-500/10 text-red-200",
};

type DocsBadgeProps = {
  status: DocsFeatureStatus;
  className?: string;
};

export default function DocsBadge({ status, className = "" }: DocsBadgeProps) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em]",
        styles[status],
        className,
      ].join(" ")}
    >
      {labels[status]}
    </span>
  );
}
