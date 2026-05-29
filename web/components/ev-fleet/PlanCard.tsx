import Button from "@/components/ui/Button";
import MethodBadge from "@/components/visualization/quantum/MethodBadge";
import type { ChargePlan } from "@/lib/ev-fleet";

import { EvFleetChip } from "./ui";

export default function PlanCard({
  plan,
  title,
  recommended = false,
  onOpenAudit,
}: {
  plan: ChargePlan;
  title: string;
  recommended?: boolean;
  onOpenAudit?: (planId: string) => void;
}) {
  return (
    <article
      className={[
        "flex h-full flex-col rounded-[var(--radius-xl)] border bg-black/30 p-5",
        recommended ? "border-emerald-400/35 ring-1 ring-emerald-400/15" : "border-[var(--border)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label">{title}</p>
          <h4 className="mt-2 text-lg font-semibold text-white">{plan.label}</h4>
          <p className="mt-1 text-xs text-[var(--color-gray-500)]">
            {plan.slots.length} charge sessions · peak {plan.score.peak_kw.toFixed(1)} kW
          </p>
        </div>
        <MethodBadge method={plan.source === "classical" ? "classical" : "hybrid"} />
      </div>
      {recommended ? (
        <div className="mt-3">
          <EvFleetChip tone="success">Recommended</EvFleetChip>
        </div>
      ) : null}
      <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto text-sm text-[var(--color-gray-300)]">
        {plan.slots.slice(0, 6).map((slot) => (
          <li key={`${plan.id}-${slot.vehicle_id}`} className="rounded-lg border border-[var(--border)] px-3 py-2">
            <span className="font-medium text-white">{slot.vehicle_id}</span>
            <span className="text-[var(--color-gray-500)]"> @ </span>
            {slot.charger_id} · {slot.period}
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[var(--color-gray-500)]">$/day</dt>
          <dd className="font-medium text-white">${plan.score.total_cost.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-gray-500)]">On-time</dt>
          <dd className="font-medium text-white">
            {(plan.score.on_time_probability * 100).toFixed(0)}%
          </dd>
        </div>
      </dl>
      {onOpenAudit ? (
        <div className="mt-auto pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={() => onOpenAudit(plan.id)}>
            Audit pack
          </Button>
        </div>
      ) : null}
    </article>
  );
}
