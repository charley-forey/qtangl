"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";

type HndlTimelineProps = {
  dataYears?: number;
  migrationYears?: number;
  quantumYears?: number;
};

export default function HndlTimeline({
  dataYears = 35,
  migrationYears = 7,
  quantumYears = 10,
}: HndlTimelineProps) {
  const sum = dataYears + migrationYears;
  const holds = sum > quantumYears;
  const maxScale = Math.max(sum, quantumYears, 20);
  const xWidth = (dataYears / maxScale) * 100;
  const yWidth = (migrationYears / maxScale) * 100;
  const zPos = (quantumYears / maxScale) * 100;

  return (
    <Card tone="feature" size="lg" className="rounded-[var(--radius-feature)]">
      <Eyebrow>Mosca timeline</Eyebrow>
      <p className="mt-4 text-sm leading-7 text-[var(--color-gray-300)]">
        Visual comparison of X + Y against Z on a shared timeline.
      </p>
      <div
        className="relative mt-8 h-24 rounded-xl border border-[var(--border)] bg-black/40"
        role="img"
        aria-label={`Timeline: X ${dataYears} years plus Y ${migrationYears} years equals ${sum} versus Z ${quantumYears} years. ${holds ? "HNDL exposure today." : "Lower immediate HNDL pressure."}`}
      >
        <div className="absolute inset-x-4 bottom-6 top-6 flex items-stretch">
          <div
            className="rounded-l-md bg-[#6ee7a0]/80"
            style={{ width: `${xWidth}%` }}
            title={`X: ${dataYears} years`}
          />
          <div
            className="rounded-r-md bg-[#60a5fa]/80"
            style={{ width: `${yWidth}%` }}
            title={`Y: ${migrationYears} years`}
          />
        </div>
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-[#f87171]"
          style={{ left: `calc(1rem + ${zPos}% * (100% - 2rem) / 100)` }}
          aria-hidden
        />
        <span
          className="absolute -top-6 text-xs font-medium text-[#f87171]"
          style={{ left: `calc(1rem + ${zPos}% * (100% - 2rem) / 100 - 1rem)` }}
        >
          Z = {quantumYears}y
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--color-gray-400)]">
        <span>
          <span className="inline-block h-2 w-2 rounded-full bg-[#6ee7a0] mr-1" aria-hidden />
          X = {dataYears}y
        </span>
        <span>
          <span className="inline-block h-2 w-2 rounded-full bg-[#60a5fa] mr-1" aria-hidden />
          Y = {migrationYears}y
        </span>
        <span>
          Sum = {sum}y vs Z = {quantumYears}y
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-white" aria-live="polite">
        {holds ? "X + Y > Z — HNDL exposure today." : "X + Y ≤ Z — lower immediate HNDL pressure."}
      </p>
    </Card>
  );
}
