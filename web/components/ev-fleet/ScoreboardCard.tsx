import type { Scoreboard } from "@/lib/ev-fleet";

import { EvFleetChip, EvFleetEmptyState, EvFleetMetric, EvFleetSection, EvFleetSectionHeader } from "./ui";

function formatSolveTime(value: number) {
  return value > 60 ? `${Math.round(value / 60)} min` : `${value.toFixed(1)}s`;
}

export default function ScoreboardCard({ scoreboard }: { scoreboard: Scoreboard | null }) {
  if (!scoreboard) {
    return (
      <EvFleetSection>
        <EvFleetSectionHeader label="Scoreboard" title="Outcome comparison" />
        <div className="mt-6">
          <EvFleetEmptyState title="No results yet" description='Click "Plan routes + charge" to generate the scoreboard.' />
        </div>
      </EvFleetSection>
    );
  }

  const columns = [scoreboard.manual, scoreboard.classical, scoreboard.hybrid];
  return (
    <EvFleetSection tone="feature">
      <EvFleetSectionHeader
        label="Scoreboard"
        title="Honest comparison"
        description="$/day, peak demand kW, and on-time delivery — hybrid targets staggering and TOU savings."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {scoreboard.hybrid.hybrid_beats_classical_cost ? (
          <EvFleetChip tone="success">Hybrid saves $/day</EvFleetChip>
        ) : null}
        <EvFleetChip tone="neutral">{scoreboard.hybrid.distinct_plans} hybrid plans</EvFleetChip>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.label}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/30 p-5"
          >
            <p className="text-sm font-semibold text-white">{column.label}</p>
            <div className="mt-4 grid gap-3">
              <EvFleetMetric label="Wall time" value={formatSolveTime(column.solve_wall_time_seconds)} />
              {column.daily_cost != null ? (
                <EvFleetMetric label="$/day" value={`$${column.daily_cost.toFixed(2)}`} />
              ) : (
                <EvFleetMetric label="Objective" value={column.objective.toFixed(2)} />
              )}
              {column.peak_kw != null ? (
                <EvFleetMetric label="Peak kW" value={column.peak_kw.toFixed(1)} />
              ) : null}
              {column.on_time_probability != null ? (
                <EvFleetMetric
                  label="On-time"
                  value={`${(column.on_time_probability * 100).toFixed(0)}%`}
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-5 text-[var(--color-gray-400)]">{column.summary}</p>
          </div>
        ))}
      </div>
    </EvFleetSection>
  );
}
