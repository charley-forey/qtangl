import Card from "@/components/ui/Card";
import type { StaffingVisualization } from "@/lib/demo-data";

type StaffingGridProps = {
  plan: StaffingVisualization;
};

export default function StaffingGrid({ plan }: StaffingGridProps) {
  const people = Array.from(new Set(plan.assignments.map((assignment) => assignment.person)));

  return (
    <Card strong className="rounded-[1.5rem] p-5 sm:p-6">
      <p className="text-label">Visual plan</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{plan.title}</h3>

      <div className="mt-6 overflow-x-auto">
        <div
          className="grid min-w-[32rem] gap-3"
          style={{
            gridTemplateColumns: `minmax(10rem, 1.2fr) repeat(${plan.shifts.length}, minmax(8rem, 1fr))`,
          }}
        >
          <div className="px-4 py-3 text-xs uppercase tracking-[0.16em] text-[var(--color-gray-500)]">
            Team member
          </div>
          {plan.shifts.map((shift) => (
            <div
              key={shift}
              className="px-4 py-3 text-xs uppercase tracking-[0.16em] text-[var(--color-gray-500)]"
            >
              {shift}
            </div>
          ))}

          {people.map((person) => (
            <div key={person} className="contents">
              <div className="rounded-2xl border border-[var(--border)] bg-black/35 px-4 py-4 text-sm font-medium text-white">
                {person}
              </div>
              {plan.shifts.map((shift) => {
                const assignment = plan.assignments.find(
                  (item) => item.person === person && item.shift === shift
                );

                return (
                  <div
                    key={`${person}-${shift}`}
                    className="rounded-2xl border border-[var(--border)] bg-black/35 px-4 py-4 text-sm text-[var(--color-gray-300)]"
                  >
                    {assignment ? assignment.role : "—"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
