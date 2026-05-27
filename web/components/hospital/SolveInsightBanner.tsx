import Card from "@/components/ui/Card";
import type { HospitalSolveResponse } from "@/lib/hospital";

type SolveInsightBannerProps = {
  response: HospitalSolveResponse;
};

export default function SolveInsightBanner({ response }: SolveInsightBannerProps) {
  const { scoreboard, hybridCandidates, classicalCandidate } = response;
  const topHybrid = hybridCandidates[0];

  return (
    <Card tone="feature" className="rounded-[var(--radius-feature)] border-emerald-300/20">
      <p className="text-label text-emerald-100">Solve complete</p>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-200)]">
        Classical baseline finished in{" "}
        <strong className="text-white">
          {scoreboard.classical.solve_wall_time_seconds.toFixed(2)}s
        </strong>{" "}
        with objective{" "}
        <strong className="text-white">{scoreboard.classical.objective.toFixed(1)}</strong>. Hybrid
        replay surfaced{" "}
        <strong className="text-white">{scoreboard.hybrid.distinct_plans} distinct feasible plans</strong>{" "}
        in {scoreboard.hybrid.solve_wall_time_seconds.toFixed(2)}s — slower, but auditable.
      </p>
      {topHybrid ? (
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          Top hybrid swap: <strong className="text-white">{topHybrid.nurse_name}</strong> →{" "}
          {topHybrid.target_ward} (agency ${topHybrid.score.agency_cost.toLocaleString()}, fatigue{" "}
          {topHybrid.score.fatigue_score.toFixed(1)}). Classical pick:{" "}
          <strong className="text-white">{classicalCandidate.nurse_name}</strong> →{" "}
          {classicalCandidate.target_ward}.
        </p>
      ) : null}
    </Card>
  );
}
