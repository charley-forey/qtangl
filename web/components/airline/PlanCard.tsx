import Button from "@/components/ui/Button";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import type { RecoveryPlan } from "@/lib/airline";

import { AirlineChip } from "./ui";

export default function PlanCard({
  plan,
  title,
  recommended = false,
  onOpenAudit,
}: {
  plan: RecoveryPlan;
  title: string;
  recommended?: boolean;
  onOpenAudit?: (planId: string) => void;
}) {
  return (
    <article
      className={[
        "flex h-full flex-col rounded-[var(--radius-xl)] border bg-black/30 p-5",
        recommended
          ? "border-sky-400/35 ring-1 ring-sky-400/15"
          : "border-[var(--border)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label">{title}</p>
          <h4 className="mt-2 text-lg font-semibold text-white">{plan.label}</h4>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            {plan.assignments.length} leg assignments · FAR 117{" "}
            {plan.far117_compliant ? "OK" : "review"}
          </p>
        </div>
        <MethodBadge method={plan.source === "classical" ? "classical" : "hybrid"} />
      </div>

      {recommended ? (
        <div className="mt-3">
          <AirlineChip tone="success">Recommended</AirlineChip>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2 text-sm text-[var(--color-gray-300)]">
        {plan.assignments.map((assignment) => (
          <li key={`${plan.id}-${assignment.leg_id}`} className="rounded-lg border border-[var(--border)] px-3 py-2">
            <span className="font-medium text-white">{assignment.leg_id}</span>
            <span className="text-[var(--color-gray-500)]"> · </span>
            {assignment.crew_name} ({assignment.role})
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-[var(--color-gray-500)]">Objective</dt>
          <dd className="font-medium tabular-nums text-white">{plan.score.objective.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">On-time</dt>
          <dd className="font-medium tabular-nums text-white">
            {(plan.score.on_time_probability * 100).toFixed(0)}%
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Quantum</dt>
          <dd className="font-medium tabular-nums text-white">
            {plan.quantum_weight != null ? `${plan.quantum_weight.toFixed(0)}%` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">Reserve $</dt>
          <dd className="font-medium tabular-nums text-white">
            {plan.score.reserve_cost.toFixed(0)}
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
            onClick={() => onOpenAudit(plan.id)}
          >
            View audit pack
          </Button>
        </div>
      ) : null}
    </article>
  );
}
