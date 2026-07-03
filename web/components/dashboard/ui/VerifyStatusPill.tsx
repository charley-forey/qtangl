"use client";

import HoverPopover from "@/components/dashboard/ui/HoverPopover";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import VerifyFixPanel from "@/components/dashboard/VerifyFixPanel";
import type { VerifyResult } from "@/lib/remediation-types";

export type VerifyStatus = "verified" | "pending" | "failed" | "unknown";

export function verifyStatusFromResult(result?: VerifyResult | null, status?: string): VerifyStatus {
  if (result?.verified) return "verified";
  if (result && !result.verified) return "failed";
  if (status === "done") return "pending";
  return "unknown";
}

const ICON: Record<VerifyStatus, string> = {
  verified: "✓",
  pending: "○",
  failed: "✗",
  unknown: "○",
};

const TONE: Record<VerifyStatus, "success" | "warning" | "critical" | "neutral"> = {
  verified: "success",
  pending: "warning",
  failed: "critical",
  unknown: "neutral",
};

const LABEL: Record<VerifyStatus, string> = {
  verified: "Verified",
  pending: "Needs verify",
  failed: "Not verified",
  unknown: "Unverified",
};

export default function VerifyStatusPill({
  status,
  result,
  remediationId,
  verifyScanId,
  verifying,
  onVerify,
  onSelectScan,
  scanOptions,
  scanId,
}: {
  status: VerifyStatus;
  result?: VerifyResult | null;
  remediationId?: string;
  verifyScanId?: string | null;
  verifying?: boolean;
  onVerify?: (id: string) => void;
  onSelectScan?: (id: string) => void;
  scanOptions?: Array<{ scanId: string; label?: string }>;
  scanId?: string;
}) {
  const popoverContent = (
    <div className="space-y-2">
      {result?.verified ? (
        <div className="text-emerald-200">
          <span className="font-semibold">Verified ✓</span>
          {result.verifyScanId ? (
            <a
              href={`/verify?scanId=${encodeURIComponent(result.verifyScanId)}`}
              className="mt-1 block text-white underline"
              target="_blank"
              rel="noreferrer"
            >
              View signed evidence
            </a>
          ) : null}
        </div>
      ) : result && !result.verified ? (
        <p className="text-amber-200">
          Not verified{result.reason ? ` — ${result.reason.replace(/_/g, " ")}` : ""}. Re-scan after deploying the fix.
        </p>
      ) : (
        <p className="text-[var(--color-gray-400)]">Run a verification scan after deploying the fix.</p>
      )}
      {remediationId && onVerify && scanId ? (
        <VerifyFixPanel
          remediationId={remediationId}
          verifyScanId={verifyScanId ?? ""}
          verifying={Boolean(verifying)}
          result={result ?? undefined}
          onVerify={onVerify}
          onSelectScan={onSelectScan ?? (() => {})}
          scanOptions={(scanOptions ?? []).map((s) => ({
            scanId: s.scanId,
            label: s.label ?? s.scanId,
          }))}
        />
      ) : null}
    </div>
  );

  return (
    <HoverPopover
      trigger={
        <span className="inline-flex items-center gap-1">
          <StatusPill label={`${ICON[status]} ${LABEL[status]}`} tone={TONE[status]} />
        </span>
      }
      content={popoverContent}
    />
  );
}
