import { collapseMeterCopy } from "@/lib/copy/visualization";

type CollapseMeterProps = {
  candidatesEvaluated: number;
  className?: string;
};

export default function CollapseMeter({
  candidatesEvaluated,
  className = "",
}: CollapseMeterProps) {
  const safeCandidateCount = Math.max(1, candidatesEvaluated);

  return (
    <section
      aria-label={collapseMeterCopy.title}
      className={[
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-label">{collapseMeterCopy.eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold text-white">{collapseMeterCopy.title}</h3>

      <div className="mt-6 flex items-end gap-6">
        <div className="flex h-48 w-14 items-end rounded-full border border-[var(--border)] bg-white/[0.04] p-2">
          <div className="w-full rounded-full bg-white/90" style={{ height: "22%" }} />
        </div>
        <div className="space-y-3">
          <p className="text-3xl font-semibold tracking-tight text-white">1</p>
          <p className="text-sm leading-7 text-[var(--color-gray-300)]">
            executable plan returned from {safeCandidateCount} evaluated candidates
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-gray-500)]">
            candidates {safeCandidateCount} {"->"} 1
          </p>
        </div>
      </div>
    </section>
  );
}
