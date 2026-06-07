"use client";

import Eyebrow from "@/components/ui/Eyebrow";

type CbomDrift = {
  available?: boolean;
  addedCount?: number;
  removedCount?: number;
  changedCount?: number;
  reason?: string;
};

export default function CbomDriftWidget({ drift }: { drift: CbomDrift | null }) {
  if (!drift) {
    return null;
  }
  if (!drift.available) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] p-4">
        <Eyebrow>CBOM drift</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Run at least two CBOM ingests to compare inventory drift.
        </p>
      </div>
    );
  }

  const added = drift.addedCount ?? 0;
  const changed = drift.changedCount ?? 0;
  const removed = drift.removedCount ?? 0;
  const hasDrift = added + changed + removed > 0;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-4">
      <Eyebrow>CBOM drift</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-300)]">
        {hasDrift
          ? `Since last ingest: +${added} added, ${changed} changed, −${removed} removed.`
          : "No drift since last ingest."}
      </p>
    </div>
  );
}
