import type { Scoreboard } from "@/lib/airline";

import {
  AirlineChip,
  AirlineEmptyState,
  AirlineMetric,
  AirlineSection,
  AirlineSectionHeader,
} from "./ui";

function formatSolveTime(value: number) {
  if (value > 60) {
    return `${Math.round(value / 60)} min`;
  }
  return `${value.toFixed(1)}s`;
}

export default function ScoreboardCard({ scoreboard }: { scoreboard: Scoreboard | null }) {
  if (!scoreboard) {
    return (
      <AirlineSection>
        <AirlineSectionHeader
          label="Scoreboard"
          title="Outcome comparison"
          description='Run "Recover" to compare manual, classical, and hybrid paths.'
        />
        <div className="mt-6">
          <AirlineEmptyState
            title="No results yet"
            description='Click "Recover" to generate the OCC scoreboard.'
          />
        </div>
      </AirlineSection>
    );
  }

  const columns = [scoreboard.manual, scoreboard.classical, scoreboard.hybrid];

  return (
    <AirlineSection tone="feature">
      <AirlineSectionHeader
        label="Scoreboard"
        title="Honest comparison"
        description="Recovery cost delta, on-time probability, and FAR 117 compliance—classical often ties; hybrid surfaces auditable alternates."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {scoreboard.hybrid.hybrid_beats_classical_objective ? (
          <AirlineChip tone="success">Hybrid wins on objective</AirlineChip>
        ) : null}
        {scoreboard.hybrid.far117_compliant ? (
          <AirlineChip tone="success">FAR 117 compliant</AirlineChip>
        ) : null}
        <AirlineChip tone="neutral">
          {scoreboard.hybrid.distinct_plans} distinct hybrid plans
        </AirlineChip>
        {scoreboard.hybrid.diversity_score != null && scoreboard.hybrid.diversity_score > 0 ? (
          <AirlineChip tone="neutral">
            Diversity {scoreboard.hybrid.diversity_score.toFixed(2)}
          </AirlineChip>
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
              <AirlineMetric label="Wall time" value={formatSolveTime(column.solve_wall_time_seconds)} />
              <AirlineMetric label="Objective" value={column.objective.toFixed(2)} />
              {column.on_time_probability != null ? (
                <AirlineMetric
                  label="On-time"
                  value={`${(column.on_time_probability * 100).toFixed(0)}%`}
                />
              ) : null}
              {column.recovery_cost != null ? (
                <AirlineMetric label="Recovery $" value={column.recovery_cost.toLocaleString()} />
              ) : null}
              <AirlineMetric label="Plans" value={String(column.distinct_plans)} />
              {"diversity_score" in column && (column.diversity_score ?? 0) > 0 ? (
                <AirlineMetric label="Diversity" value={(column.diversity_score ?? 0).toFixed(2)} />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-5 text-[var(--color-gray-400)]">{column.summary}</p>
          </div>
        ))}
      </div>
    </AirlineSection>
  );
}
