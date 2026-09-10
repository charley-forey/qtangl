"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type Slice = { label: string; value: number; color: string };

export default function SeverityDonut({
  slices,
  insight,
}: {
  slices: Slice[];
  insight?: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <Card tone="ghost" className="border border-dashed border-[var(--border-subtle)] p-4 text-center text-sm text-[var(--color-gray-500)]">
        Run a scan to see severity breakdown.
      </Card>
    );
  }

  let offset = 0;
  const stops: string[] = [];
  for (const slice of slices) {
    const start = offset;
    offset += (slice.value / total) * 100;
    stops.push(`${slice.color} ${start}% ${offset}%`);
  }
  const gradient = stops.join(", ");

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)] p-4">
      <Eyebrow>Finding severity</Eyebrow>
      {insight ? <p className="mt-2 text-sm text-[var(--color-gray-300)]">{insight}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div
          className="h-28 w-28 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-hidden
        />
        <ul className="space-y-2 text-sm">
          {slices.map((slice) => (
            <li key={slice.label} className="flex items-center gap-2 text-[var(--color-gray-300)]">
              <span className="h-2 w-2 rounded-full" style={{ background: slice.color }} />
              {slice.label}: {slice.value}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
