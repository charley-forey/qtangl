import type { HospitalRosterNurse } from "@/lib/hospital";

import { HospitalSection, HospitalSectionHeader } from "./ui";

const MAX_COLUMNS = 14;

type RosterHeatmapProps = {
  roster: HospitalRosterNurse[];
  highlightedNurseIds: string[];
  calloutNurseId: string;
};

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
    return "bg-red-400/70";
  }
  if (value >= 2) {
    return "bg-white/80";
  }
  if (value === 1) {
    return "bg-white/45";
  }
  return "bg-white/[0.06]";
}

export default function RosterHeatmap({
  roster,
  highlightedNurseIds,
  calloutNurseId,
}: RosterHeatmapProps) {
  const highlighted = new Set(highlightedNurseIds);

  return (
    <HospitalSection className="min-h-0">
      <HospitalSectionHeader
        label="Roster"
        title="14-day staffing grid"
        description={
          roster.length > 0
            ? `${roster.length} nurses · scroll to explore · red row is the call-out`
            : "Roster loads when the API connects."
        }
      />
      <div className="mt-4 max-h-[min(26rem,52vh)] overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/30 p-3 [scrollbar-gutter:stable]">
        <div className="min-w-[44rem] space-y-1.5">
          <div className="sticky top-0 z-10 grid grid-cols-[13rem_repeat(14,minmax(0,1fr))] gap-2 bg-[#0a0b0d] pb-2">
            <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-gray-500)]">
              Nurse
            </div>
            {Array.from({ length: MAX_COLUMNS }, (_, index) => (
              <div
                key={`day-${index}`}
                className="py-1 text-center text-xs font-medium text-[var(--color-gray-500)]"
              >
                D{index + 1}
              </div>
            ))}
          </div>
          {roster.map((nurse) => {
            const days = assignmentCountByDay(nurse);
            const isCallout = nurse.id === calloutNurseId;
            const isHighlighted = highlighted.has(nurse.id) || isCallout;
            return (
              <div
                key={nurse.id}
                className="grid grid-cols-[13rem_repeat(14,minmax(0,1fr))] gap-2"
              >
                <div
                  className={[
                    "rounded-lg px-3 py-2 text-sm",
                    isCallout
                      ? "border border-red-400/40 bg-red-500/10 text-red-100"
                      : isHighlighted
                        ? "border border-[var(--border-strong)] bg-white/[0.06] text-white"
                        : "border border-transparent bg-black/20 text-[var(--color-gray-400)]",
                  ].join(" ")}
                >
                  <div className="truncate font-medium">{nurse.name}</div>
                  <div className="truncate text-xs opacity-70">{nurse.home_ward}</div>
                </div>
                {days.map((value, index) => (
                  <div
                    key={`${nurse.id}-${index}`}
                    className={`h-8 rounded-md ${cellClass(value, isCallout)}`}
                    title={`Day ${index + 1}: ${value} shift${value === 1 ? "" : "s"}`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </HospitalSection>
  );
}
