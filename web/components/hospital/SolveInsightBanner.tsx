import type { HospitalSolveResponse } from "@/lib/hospital";

import { HospitalChip, HospitalSection } from "./ui";

type SolveInsightBannerProps = {
  response: HospitalSolveResponse;
};

export default function SolveInsightBanner({ response }: SolveInsightBannerProps) {
  const { scoreboard, hybridCandidates, classicalCandidate } = response;
  const topHybrid = hybridCandidates[0];
  const beatsObjective = scoreboard.hybrid.hybrid_beats_classical_objective;
  const beatsFairness = scoreboard.hybrid.hybrid_beats_classical_fairness;

  return (
    <HospitalSection
      tone="feature"
      className="border-emerald-400/20 bg-[linear-gradient(165deg,rgba(16,185,129,0.08),rgba(255,255,255,0.02))]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <HospitalChip tone="success">Solve complete</HospitalChip>
        {beatsObjective ? <HospitalChip tone="success">Hybrid lower objective</HospitalChip> : null}
        {beatsFairness && !beatsObjective ? (
          <HospitalChip tone="success">Better fairness</HospitalChip>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-gray-200)]">
        Classical ({scoreboard.classical.solve_wall_time_seconds.toFixed(2)}s):{" "}
        <strong className="text-white">{classicalCandidate.nurse_name}</strong> · Hybrid (
        {scoreboard.hybrid.solve_wall_time_seconds.toFixed(2)}s):{" "}
        <strong className="text-white">{scoreboard.hybrid.distinct_plans} feasible plans</strong>
        {topHybrid ? ` — top alternate ${topHybrid.nurse_name}` : ""}.
      </p>
    </HospitalSection>
  );
}
