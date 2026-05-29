"use client";

import type { MoscaAssessment } from "@/lib/pqc";

export default function MoscaTimeline({ mosca }: { mosca: MoscaAssessment }) {
  const x = mosca.data_shelf_life_years;
  const y = mosca.migration_time_years;
  const z = mosca.years_to_q_day;
  const max = Math.max(x + y, z, 1);
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--color-gray-400)]">Mosca inequality: X + Y {mosca.inequality_holds ? ">" : "≤"} Z</p>
      <div className="space-y-1">
        <Bar label={`X data shelf (${x}y)`} width={(x / max) * 100} tone="bg-sky-500/70" />
        <Bar label={`Y migration (${y}y)`} width={(y / max) * 100} tone="bg-amber-500/70" />
        <Bar label={`Z to Q-Day (${z}y)`} width={(z / max) * 100} tone="bg-red-500/70" />
      </div>
      <p className="text-xs text-[var(--color-gray-400)]">{mosca.summary}</p>
    </div>
  );
}

function Bar({ label, width, tone }: { label: string; width: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-[var(--color-gray-500)]">
        <span>{label}</span>
      </div>
      <div className="h-2 rounded bg-white/5">
        <div className={`h-2 rounded ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
