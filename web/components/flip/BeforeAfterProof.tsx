"use client";

type Props = {
  beforeSnapshotId?: string | null;
  afterSnapshotId?: string | null;
  proofId?: string | null;
  verifyUrl?: string | null;
};

export default function BeforeAfterProof({ beforeSnapshotId, afterSnapshotId, proofId, verifyUrl }: Props) {
  return (
    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-xs text-[var(--color-gray-300)]">
      <p className="mb-2 font-medium text-white">Before / after proof</p>
      <ul className="space-y-1">
        <li>Before snapshot: {beforeSnapshotId ?? "—"}</li>
        <li>After snapshot: {afterSnapshotId ?? "—"}</li>
        <li>Proof ID: {proofId ?? "—"}</li>
      </ul>
      {verifyUrl && (
        <a className="mt-2 inline-block underline text-emerald-400" href={verifyUrl} target="_blank" rel="noreferrer">
          Open signed verify URL
        </a>
      )}
    </div>
  );
}
