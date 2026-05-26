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
        <table className="min-w-[32rem] w-full border-separate border-spacing-3">
          <caption className="sr-only">{plan.summary}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-[var(--color-gray-500)]"
              >
                Team member
              </th>
              {plan.shifts.map((shift) => (
                <th
                  key={shift}
                  scope="col"
                  className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-[var(--color-gray-500)]"
                >
                  {shift}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person}>
                <th
                  scope="row"
                  className="rounded-2xl border border-[var(--border)] bg-black/35 px-4 py-4 text-left text-sm font-medium text-white"
                >
                  {person}
                </th>
                {plan.shifts.map((shift) => {
                  const assignment = plan.assignments.find(
                    (item) => item.person === person && item.shift === shift
                  );

                  return (
                    <td
                      key={`${person}-${shift}`}
                      className="rounded-2xl border border-[var(--border)] bg-black/35 px-4 py-4 text-sm text-[var(--color-gray-300)]"
                    >
                      {assignment ? assignment.role : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
