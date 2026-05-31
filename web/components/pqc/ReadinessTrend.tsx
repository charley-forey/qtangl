"use client";

type TrendPoint = {
  scanId: string;
  createdAt: string;
  readinessScore: number;
  readinessBand?: string;
};

export default function ReadinessTrend({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-xs text-[var(--color-gray-500)]">
        Run multiple scans (or enable scheduled monitoring) to see readiness trend.
      </p>
    );
  }

  const sorted = [...points].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const max = Math.max(...sorted.map((p) => p.readinessScore), 100);

  return (
    <div className="flex h-24 items-end gap-1">
      {sorted.map((point) => (
        <div key={point.scanId} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-[var(--color-accent)]/70"
            style={{ height: `${Math.max(8, (point.readinessScore / max) * 100)}%` }}
            title={`${point.readinessScore} — ${point.scanId}`}
          />
          <span className="font-mono text-[9px] text-[var(--color-gray-500)]">
            {point.readinessScore}
          </span>
        </div>
      ))}
    </div>
  );
}
