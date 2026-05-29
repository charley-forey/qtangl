import type { AirlineSolveResponse } from "@/lib/airline";

import { AirlineChip, AirlineSection } from "./ui";

export default function SolveInsightBanner({ response }: { response: AirlineSolveResponse }) {
  const { scoreboard, hybridPlans, classicalPlan } = response;
  const topHybrid = hybridPlans[0];
  const beatsObjective = scoreboard.hybrid.hybrid_beats_classical_objective;

  return (
    <AirlineSection
      tone="feature"
      className="border-sky-400/20 bg-[linear-gradient(165deg,rgba(59,130,246,0.1),rgba(255,255,255,0.02))]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <AirlineChip tone="success">Recovery complete</AirlineChip>
        {beatsObjective ? <AirlineChip tone="success">Hybrid lower objective</AirlineChip> : null}
        <AirlineChip tone="neutral">
          Cost delta vs manual: $
          {String(response.details.costDeltaVsManual ?? "—")}
        </AirlineChip>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-gray-200)]">
        Routing repair assigned tails across {response.routing.open_legs.length} open legs. Classical (
        {scoreboard.classical.solve_wall_time_seconds.toFixed(2)}s) covers{" "}
        <strong className="text-white">{classicalPlan.assignments.length} legs</strong> · Hybrid (
        {scoreboard.hybrid.solve_wall_time_seconds.toFixed(2)}s) surfaced{" "}
        <strong className="text-white">{scoreboard.hybrid.distinct_plans} distinct plans</strong>
        {topHybrid ? ` — top alternate ${topHybrid.label}` : ""}.
      </p>
    </AirlineSection>
  );
}
