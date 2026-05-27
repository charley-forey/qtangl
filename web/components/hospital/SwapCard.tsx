import Button from "@/components/ui/Button";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import type { HospitalCandidate } from "@/lib/hospital";

import { HospitalChip } from "./ui";

type SwapCardProps = {
  candidate: HospitalCandidate;
  title: string;
  recommended?: boolean;
  onOpenAudit?: (candidateId: string) => void;
};

export default function SwapCard({
  candidate,
  title,
  recommended = false,
  onOpenAudit,
}: SwapCardProps) {
  return (
    <article
      className={[
        "flex h-full flex-col rounded-[var(--radius-xl)] border bg-black/30 p-5",
        recommended
          ? "border-emerald-400/35 ring-1 ring-emerald-400/15"
          : "border-[var(--border)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label">{title}</p>
          <h4 className="mt-2 truncate text-lg font-semibold text-white">
            {candidate.nurse_name}
          </h4>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            {candidate.home_ward} → {candidate.target_ward}
          </p>
        </div>
        <MethodBadge method={candidate.source === "classical" ? "classical" : "hybrid"} />
      </div>

      {recommended ? (
        <div className="mt-3">
          <HospitalChip tone="success">Recommended</HospitalChip>
        </div>
      ) : null}

      <p className="mt-3 line-clamp-2 text-sm leading-5 text-[var(--color-gray-400)]">
        {candidate.summary}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-[var(--color-gray-500)]">Objective</dt>
          <dd className="font-medium tabular-nums text-white">
            {candidate.score.objective.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Quantum</dt>
          <dd className="font-medium tabular-nums text-white">
            {candidate.quantum_weight != null ? `${candidate.quantum_weight.toFixed(0)}%` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Fatigue</dt>
          <dd className="font-medium tabular-nums text-white">
            {candidate.score.fatigue_score.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Fairness Δ</dt>
          <dd className="font-medium tabular-nums text-white">
            {candidate.score.fairness_delta.toFixed(3)}
          </dd>
        </div>
      </dl>

      {onOpenAudit ? (
        <div className="mt-auto pt-5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => onOpenAudit(candidate.id)}
          >
            View audit pack
          </Button>
        </div>
      ) : null}
    </article>
  );
}
