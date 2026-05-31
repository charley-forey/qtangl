"use client";

type Milestone = {
  label: string;
  deadline: string;
  severity?: string;
  effortDays?: number;
};

export default function MigrationGantt({ milestones }: { milestones?: Milestone[] }) {
  const items =
    milestones && milestones.length > 0
      ? milestones
      : [
          { label: "NIST IR 8547", deadline: "2030" },
          { label: "CNSA 2.0", deadline: "2033" },
          { label: "NSM-10", deadline: "2035" },
        ];

  return (
    <div className="space-y-2">
      {items.map((m) => (
        <div key={`${m.label}-${m.deadline}`} className="flex items-center gap-3 text-xs">
          <span className="w-32 truncate text-[var(--color-gray-500)]" title={m.label}>
            {m.label}
          </span>
          <div className="h-2 flex-1 rounded bg-white/5">
            <div
              className={`h-2 rounded ${
                m.severity === "critical" ? "bg-red-500/60" : "bg-[var(--color-accent)]/60"
              }`}
              style={{ width: `${Math.min(100, Math.max(20, 100 - parseInt(String(m.deadline), 10) + 2026))}%` }}
            />
          </div>
          <span className="text-[var(--color-gray-400)]">{m.deadline}</span>
        </div>
      ))}
    </div>
  );
}
