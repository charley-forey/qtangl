"use client";

type AggregateReadiness = {
  score?: number;
  band?: string;
  label?: string;
  coverageConfidence?: number;
  verifiedCount?: number;
  importedCount?: number;
  unverifiedCount?: number;
  verifiedPct?: number;
};

export default function MultiSourceInventoryWidget({
  componentCount,
  readiness,
  openConflicts,
}: {
  componentCount: number;
  readiness: AggregateReadiness | null;
  openConflicts: number;
}) {
  if (!readiness && componentCount === 0) {
    return (
      <p className="text-sm text-[var(--color-gray-400)]">
        Import a third-party CBOM or run a scan to build a multi-source inventory.
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Aggregate assets</dt>
        <dd className="text-lg font-semibold text-white">{componentCount}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Verified</dt>
        <dd className="text-lg font-semibold text-green-300">{readiness?.verifiedCount ?? 0}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Unverified source</dt>
        <dd className="text-lg font-semibold text-amber-300">{readiness?.unverifiedCount ?? 0}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Coverage confidence</dt>
        <dd className="text-lg font-semibold text-white">{readiness?.coverageConfidence ?? "—"}%</dd>
      </div>
      {readiness?.score != null ? (
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Aggregated readiness</dt>
          <dd className="text-white">
            {readiness.score} — {readiness.band}
          </dd>
          <dd className="text-xs text-[var(--color-gray-400)]">{readiness.label}</dd>
        </div>
      ) : null}
      {openConflicts > 0 ? (
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Open conflicts</dt>
          <dd className="text-amber-300">{openConflicts} require manual resolution</dd>
        </div>
      ) : null}
    </dl>
  );
}
