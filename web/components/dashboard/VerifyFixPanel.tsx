"use client";

type VerifyResult = {
  verified: boolean;
  verifyScanId?: string | null;
  beforeStatus?: string;
  afterStatus?: string;
  reason?: string;
};

export default function VerifyFixPanel({
  remediationId,
  verifyScanId,
  verifying,
  result,
  onVerify,
  onSelectScan,
  scanOptions,
}: {
  remediationId: string;
  verifyScanId: string;
  verifying: boolean;
  result?: VerifyResult;
  onVerify: (remediationId: string) => void;
  onSelectScan: (scanId: string) => void;
  scanOptions: Array<{ scanId: string; label: string }>;
}) {
  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
      <p className="text-xs font-medium text-emerald-200">Verify fix</p>
      <p className="mt-1 text-[10px] text-[var(--color-gray-400)]">
        Re-scan the target after deploying the fix, then compare against the baseline scan.
      </p>
      {scanOptions.length > 0 ? (
        <label className="mt-2 flex flex-col gap-1 text-xs text-[var(--color-gray-400)]">
          Verification scan
          <select
            value={verifyScanId}
            onChange={(e) => onSelectScan(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
          >
            <option value="">Select scan…</option>
            {scanOptions.map((s) => (
              <option key={s.scanId} value={s.scanId}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        disabled={!verifyScanId || verifying}
        className="mt-2 text-xs text-emerald-300 underline underline-offset-4 disabled:opacity-50"
        onClick={() => onVerify(remediationId)}
      >
        {verifying ? "Verifying…" : "Verify fix"}
      </button>
      {result ? (
        result.verified ? (
          <div className="mt-2 text-xs text-emerald-200">
            Verified ✓
            {result.verifyScanId ? (
              <>
                {" "}
                <a
                  href={`/verify?scanId=${encodeURIComponent(result.verifyScanId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  View signed evidence
                </a>
              </>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-amber-200">
            Not verified{result.reason ? ` — ${result.reason.replace(/_/g, " ")}` : ""}
          </p>
        )
      ) : null}
    </div>
  );
}
