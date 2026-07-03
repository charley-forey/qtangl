"use client";

import { ChartEmptyState } from "@/components/dashboard/charts/ChartStates";
import { urgencyColorForYear } from "@/lib/chart-theme";

export type GanttItem = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  progressPct?: number;
};

export default function CcGantt({
  items,
  startYear = new Date().getFullYear(),
  endYear = new Date().getFullYear() + 12,
}: {
  items: GanttItem[];
  startYear?: number;
  endYear?: number;
}) {
  if (!items.length) {
    return <ChartEmptyState message="Add remediation target dates to see migration timeline." />;
  }
  const span = Math.max(1, endYear - startYear);

  return (
    <div className="space-y-2" role="list" aria-label="Migration timeline">
      {items.map((item) => {
        const left = ((item.startYear - startYear) / span) * 100;
        const width = Math.max(4, ((item.endYear - item.startYear) / span) * 100);
        return (
          <div key={item.id} className="grid grid-cols-[120px_1fr] items-center gap-2 text-xs" role="listitem">
            <span className="truncate text-[var(--color-gray-400)]">{item.label}</span>
            <div className="relative h-6 rounded bg-black/40">
              <div
                className={`absolute top-1 h-4 rounded ${urgencyColorForYear(item.endYear)}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${item.startYear}–${item.endYear}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
