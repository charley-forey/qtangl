import Card from "@/components/ui/Card";
import type { Scoreboard } from "@/lib/hospital";

type ScoreboardCardProps = {
  scoreboard: Scoreboard | null;
};

function formatSolveTime(value: number) {
  if (value > 60) {
    return `${Math.round(value / 60)} min`;
  }
  return `${value.toFixed(2)} s`;
}

export default function ScoreboardCard({ scoreboard }: ScoreboardCardProps) {
  if (!scoreboard) {
    return (
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <p className="text-label">Honest scoreboard</p>
        <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
          Fire the call-out to compare manual, classical, and hybrid outcomes side by side.
        </p>
      </Card>
    );
  }

  const columns = [
    scoreboard.manual,
    scoreboard.classical,
    scoreboard.hybrid,
  ];

  return (
    <Card tone="feature" className="rounded-[var(--radius-feature)]">
      <p className="text-label">Honest scoreboard</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">We do not pretend the hybrid pass is faster</h3>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        We show the slower hybrid pass because it surfaces feasible alternates your classical solver
        would have discarded, along with the audit trail explaining why each swap stayed within the rules.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.label}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-black/35 p-5"
          >
            <p className="text-sm font-medium text-white">{column.label}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-gray-400)]">Solve wall time</dt>
                <dd className="text-white">{formatSolveTime(column.solve_wall_time_seconds)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-gray-400)]">Objective</dt>
                <dd className="text-white">{column.objective.toFixed(4)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-gray-400)]">Distinct feasible plans</dt>
                <dd className="text-white">{column.distinct_plans}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-gray-400)]">Audit pack</dt>
                <dd className="text-white">{column.audit_pack_available ? "Yes" : "No"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">{column.summary}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm leading-7 text-[var(--color-gray-300)]">
        Pitch line: “We will not pretend quantum is faster. We will show you three provably-feasible
        swaps your CP-SAT solver would have picked one of and discarded the rest.”
      </p>
    </Card>
  );
}
