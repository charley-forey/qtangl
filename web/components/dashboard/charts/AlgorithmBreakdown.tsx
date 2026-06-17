"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type Row = { label: string; count: number };

export default function AlgorithmBreakdown({
  rows,
  insight,
}: {
  rows: Row[];
  insight?: string;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  if (rows.length === 0) {
    return (
      <Card tone="ghost" className="border border-dashed border-[var(--border-subtle)] p-4 text-center text-sm text-[var(--color-gray-500)]">
        Algorithm families appear after your first scan.
      </Card>
    );
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)] p-4">
      <Eyebrow>Algorithm exposure</Eyebrow>
      {insight ? <p className="mt-2 text-sm text-[var(--color-gray-300)]">{insight}</p> : null}
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex justify-between text-xs text-[var(--color-gray-400)]">
              <span>{row.label}</span>
              <span>{row.count}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-sky-400/80"
                style={{ width: `${Math.round((row.count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
