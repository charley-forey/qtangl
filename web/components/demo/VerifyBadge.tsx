"use client";

import { useState } from "react";

import { verifyDemoSnapshot } from "@/lib/demo";

export default function VerifyBadge({
  snapshotId,
  signature,
}: {
  snapshotId?: string | null;
  signature?: Record<string, unknown> | null;
}) {
  const [result, setResult] = useState<{ valid?: boolean; contentHash?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    if (!snapshotId) return;
    setBusy(true);
    try {
      const response = await verifyDemoSnapshot(snapshotId);
      setResult({ valid: response.valid, contentHash: response.contentHash });
    } finally {
      setBusy(false);
    }
  }

  const hash = signature?.contentHash ? String(signature.contentHash) : result?.contentHash;

  return (
    <div className="rounded-[var(--radius-lg)] border border-emerald-500/20 bg-emerald-500/5 p-4">
      <p className="text-sm font-semibold text-emerald-200">Signed evidence</p>
      <p className="mt-1 text-xs text-[var(--color-gray-400)]">
        Each snapshot produces a signed report you can independently verify.
      </p>
      {hash ? (
        <p className="mt-2 break-all font-mono text-[10px] text-[var(--color-gray-500)]">{hash.slice(0, 48)}…</p>
      ) : null}
      <button
        type="button"
        disabled={!snapshotId || busy}
        onClick={() => void verify()}
        className="mt-3 rounded-full border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/10 disabled:opacity-50"
      >
        {busy ? "Verifying…" : result?.valid ? "Verified ✓" : "Verify snapshot"}
      </button>
    </div>
  );
}
