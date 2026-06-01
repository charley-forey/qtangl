"use client";

import Eyebrow from "@/components/ui/Eyebrow";

export type ScanDiff = {
  previousScanId?: string;
  readinessDelta?: number;
  previousReadinessScore?: number;
  currentReadinessScore?: number;
  summary?: string;
  newQuantumVulnerableCount?: number;
  certExpiringCount?: number;
  newAssets?: Array<{ label?: string; host?: string; algorithm?: string }>;
  degradedAlgorithms?: Array<{ label?: string; previousStatus?: string; currentStatus?: string }>;
  newQuantumVulnerable?: Array<{ label?: string; host?: string; severity?: string }>;
  assetTimeline?: Array<{ assetId?: string; label?: string; state?: string; detail?: string }>;
  driftCauses?: Array<{ cause?: string; count?: number }>;
};

export default function ScanDiffPanel({ diff }: { diff: ScanDiff | null | undefined }) {
  if (!diff || !diff.previousScanId) {
    return (
      <p className="text-sm text-[var(--color-gray-500)]">
        No prior scan to compare. Run a second scan to see drift.
      </p>
    );
  }

  const delta = diff.readinessDelta ?? 0;
  const deltaLabel =
    delta > 0 ? `+${delta.toFixed(1)}` : delta < 0 ? delta.toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-gray-300)]">{diff.summary}</p>
      <dl className="grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Readiness delta</dt>
          <dd className={delta < 0 ? "text-red-300" : delta > 0 ? "text-emerald-300" : "text-white"}>
            {deltaLabel} ({diff.previousReadinessScore} → {diff.currentReadinessScore})
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">New Q-vulnerable</dt>
          <dd className="text-white">{diff.newQuantumVulnerableCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Certs expiring ≤30d</dt>
          <dd className="text-white">{diff.certExpiringCount ?? 0}</dd>
        </div>
      </dl>
      {diff.newQuantumVulnerable && diff.newQuantumVulnerable.length > 0 ? (
        <div>
          <Eyebrow>New quantum-vulnerable assets</Eyebrow>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-gray-400)]">
            {diff.newQuantumVulnerable.slice(0, 8).map((asset, index) => (
              <li key={`${asset.host}-${index}`}>
                {asset.label ?? asset.host} · {asset.severity}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {diff.degradedAlgorithms && diff.degradedAlgorithms.length > 0 ? (
        <div>
          <Eyebrow>Degraded algorithms</Eyebrow>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-gray-400)]">
            {diff.degradedAlgorithms.slice(0, 8).map((row, index) => (
              <li key={`${row.label}-${index}`}>
                {row.label}: {row.previousStatus} → {row.currentStatus}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {diff.driftCauses && diff.driftCauses.length > 0 ? (
        <div>
          <Eyebrow>Drift root causes</Eyebrow>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-gray-400)]">
            {diff.driftCauses.map((cause, index) => (
              <li key={`${cause.cause}-${index}`}>
                {cause.cause}: {cause.count ?? 0}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {diff.assetTimeline && diff.assetTimeline.length > 0 ? (
        <div>
          <Eyebrow>Asset lifecycle timeline</Eyebrow>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-gray-400)]">
            {diff.assetTimeline.slice(0, 8).map((event, index) => (
              <li key={`${event.assetId}-${index}`}>
                {event.label ?? event.assetId}: {event.state} {event.detail ? `(${event.detail})` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-xs text-[var(--color-gray-500)]">
        Compared to scan <span className="font-mono text-white">{diff.previousScanId}</span>
      </p>
    </div>
  );
}
