import type { ChargePlan } from "@/lib/ev-fleet";

import { EvFleetMetric, EvFleetSection, EvFleetSectionHeader } from "./ui";

export default function DemandCurve({
  plan,
  siteCapKw,
}: {
  plan: ChargePlan | null;
  siteCapKw: number;
}) {
  if (!plan) {
    return null;
  }

  return (
    <EvFleetSection tone="panel">
      <EvFleetSectionHeader label="Site load" title="Demand curve" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <EvFleetMetric label="Peak kW" value={plan.score.peak_kw.toFixed(1)} />
        <EvFleetMetric label="Site cap" value={`${siteCapKw.toFixed(1)} kW`} />
        <EvFleetMetric
          label="Headroom"
          value={`${Math.max(0, siteCapKw - plan.score.peak_kw).toFixed(1)} kW`}
        />
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full bg-emerald-500/80"
          style={{ width: `${Math.min(100, (plan.score.peak_kw / siteCapKw) * 100)}%` }}
        />
      </div>
    </EvFleetSection>
  );
}
