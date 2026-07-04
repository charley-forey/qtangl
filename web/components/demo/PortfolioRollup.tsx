"use client";

type Unit = {
  businessUnit: string;
  assetCount: number;
  readinessScore: number | null;
};

export default function PortfolioRollup({
  units,
  overallReadiness,
  overallBand,
}: {
  units: Unit[];
  overallReadiness: number | null;
  overallBand: string | null;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/30 p-4">
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-white">Portfolio rollup</p>
        {overallReadiness != null ? (
          <p className="text-xs text-[var(--color-gray-400)]">
            {overallReadiness}/100 · {overallBand}
          </p>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {units.map((unit) => (
          <div key={unit.businessUnit}>
            <div className="flex justify-between text-xs text-[var(--color-gray-400)]">
              <span>{unit.businessUnit}</span>
              <span>{unit.readinessScore ?? "—"} · {unit.assetCount} assets</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-cyan-400/80"
                style={{ width: `${Math.max(0, Math.min(100, unit.readinessScore ?? 0))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
