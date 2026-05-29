"use client";

const MILESTONES = [
  { label: "NIST IR 8547", year: 2030 },
  { label: "CNSA 2.0", year: 2033 },
  { label: "NSM-10", year: 2035 },
];

export default function MigrationGantt() {
  return (
    <div className="space-y-2">
      {MILESTONES.map((m) => (
        <div key={m.label} className="flex items-center gap-3 text-xs">
          <span className="w-24 text-[var(--color-gray-500)]">{m.label}</span>
          <div className="h-2 flex-1 rounded bg-white/5">
            <div
              className="h-2 rounded bg-[var(--color-accent)]/60"
              style={{ width: `${((m.year - 2026) / 10) * 100}%` }}
            />
          </div>
          <span className="text-[var(--color-gray-400)]">{m.year}</span>
        </div>
      ))}
    </div>
  );
}
