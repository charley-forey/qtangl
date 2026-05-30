import type { Scoreboard } from "@/lib/hospital";

import {
  HospitalChip,
  HospitalEmptyState,
  HospitalMetric,
  HospitalSection,
  HospitalSectionHeader,
} from "./ui";

type ScoreboardCardProps = {
  scoreboard: Scoreboard | null;
};

function formatSolveTime(value: number) {
  if (value > 60) {
    return `${Math.round(value / 60)} min`;
  }
  return `${value.toFixed(1)}s`;
}

export default function ScoreboardCard({ scoreboard }: ScoreboardCardProps) {
  if (!scoreboard) {
    return (
      <HospitalSection>
        <HospitalSectionHeader
          label="Scoreboard"
          title="Outcome comparison"
          description="Run a solve to compare manual, classical, and hybrid paths."
        />
        <div className="mt-6">
          <HospitalEmptyState
            title="No results yet"
            description='Click "Run solve" to generate the executive scoreboard.'
          />
        </div>
      </HospitalSection>
    );
  }

  const columns = [scoreboard.manual, scoreboard.classical, scoreboard.hybrid];

  return (
    <HospitalSection tone="feature">
      <HospitalSectionHeader
        label="Scoreboard"
        title="Honest comparison"
        description="We show slower hybrid time and tied objectives when appropriate—the value is auditable alternates, not hype."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {scoreboard.hybrid.hybrid_beats_classical_objective ? (
          <HospitalChip tone="success">Hybrid wins on objective</HospitalChip>
        ) : null}
        {scoreboard.hybrid.hybrid_beats_classical_fairness &&
        !scoreboard.hybrid.hybrid_beats_classical_objective ? (
          <HospitalChip tone="success">Hybrid wins on fairness</HospitalChip>
        ) : null}
        <HospitalChip tone="neutral">
          {scoreboard.hybrid.distinct_plans} distinct hybrid plans
        </HospitalChip>
        {scoreboard.hybrid.diversity_score > 0 ? (
          <HospitalChip tone="neutral">
            Diversity {scoreboard.hybrid.diversity_score.toFixed(2)}
          </HospitalChip>
        ) : null}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.label}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/30 p-5"
          >
            <p className="text-sm font-semibold text-white">{column.label}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <HospitalMetric label="Wall time" value={formatSolveTime(column.solve_wall_time_seconds)} />
              <HospitalMetric label="Objective" value={column.objective.toFixed(2)} />
              {column.fairness_delta != null ? (
                <HospitalMetric label="Fairness Δ" value={column.fairness_delta.toFixed(3)} />
              ) : null}
              <HospitalMetric label="Plans surfaced" value={String(column.distinct_plans)} />
              {column.diversity_score != null && column.diversity_score > 0 ? (
                <HospitalMetric label="Diversity" value={column.diversity_score.toFixed(2)} />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-5 text-[var(--color-gray-400)]">{column.summary}</p>
          </div>
        ))}
      </div>
    </HospitalSection>
  );
}
