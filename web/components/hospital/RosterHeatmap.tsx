import Card from "@/components/ui/Card";
import type { HospitalRosterNurse } from "@/lib/hospital";

type RosterHeatmapProps = {
  roster: HospitalRosterNurse[];
  highlightedNurseIds: string[];
  calloutNurseId: string;
};

const MAX_COLUMNS = 14;

function assignmentCountByDay(nurse: HospitalRosterNurse) {
  const days = Array.from({ length: MAX_COLUMNS }, () => 0);
  nurse.assignments.forEach((assignment) => {
    const day = new Date(assignment.start).getDate();
    const baseDay = new Date(nurse.assignments[0]?.start ?? assignment.start).getDate();
    const index = Math.max(0, Math.min(MAX_COLUMNS - 1, day - baseDay));
    days[index] += 1;
  });
  return days;
}

function cellClass(value: number, highlighted: boolean) {
  if (highlighted) {
    return "bg-red-200";
  }
  if (value >= 2) {
    return "bg-white";
  }
  if (value === 1) {
    return "bg-white/60";
  }
  return "bg-white/[0.08]";
}

export default function RosterHeatmap({
  roster,
  highlightedNurseIds,
  calloutNurseId,
}: RosterHeatmapProps) {
  const highlighted = new Set(highlightedNurseIds);

  return (
    <Card tone="strong" className="rounded-[var(--radius-xl)]">
      <p className="text-label">Roster heatmap</p>
      <h3 className="mt-3 text-xl font-semibold text-white">14-day staffing surface</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Every row is a nurse, every column is a day in the planning horizon. The red row is the
        call-out; highlighted rows are the repair-window candidates.
      </p>
      <div className="mt-6 overflow-auto">
        <div className="min-w-[44rem] space-y-2">
          {roster.map((nurse) => {
            const days = assignmentCountByDay(nurse);
            const isCallout = nurse.id === calloutNurseId;
            const isHighlighted = highlighted.has(nurse.id) || isCallout;
            return (
              <div key={nurse.id} className="grid grid-cols-[13rem_repeat(14,minmax(0,1fr))] gap-2">
                <div
                  className={[
                    "rounded-lg px-3 py-2 text-sm",
                    isCallout
                      ? "border border-red-300/40 bg-red-200/10 text-red-100"
                      : isHighlighted
                        ? "border border-[var(--border-strong)] bg-white/[0.06] text-white"
                        : "border border-[var(--border)] bg-black/35 text-[var(--color-gray-300)]",
                  ].join(" ")}
                >
                  <div className="truncate font-medium">{nurse.name}</div>
                  <div className="truncate text-xs text-[var(--color-gray-500)]">{nurse.home_ward}</div>
                </div>
                {days.map((value, index) => (
                  <div
                    key={`${nurse.id}-${index}`}
                    className={`h-10 rounded-lg ${cellClass(value, isCallout)}`}
                    title={`Day ${index + 1}: ${value} assigned shift${value === 1 ? "" : "s"}`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
