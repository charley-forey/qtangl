"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { buildDashboardDeepLink } from "@/lib/dashboard-deep-links";
import { getHostFinding, type HostFindingDetail as HostFinding } from "@/lib/discovery";

type Props = {
  findingId: string;
  agentId?: string;
  auth: { useBff: true } | { apiKey: string };
  onClose: () => void;
};

export default function HostFindingDetail({ findingId, auth, onClose }: Props) {
  const router = useRouter();
  const [finding, setFinding] = useState<HostFinding | null>(null);
  const [programItemId, setProgramItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void getHostFinding(auth, findingId)
      .then((res) => {
        setFinding(res.finding);
        setProgramItemId(res.programItemId ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load finding"))
      .finally(() => setLoading(false));
  }, [auth, findingId]);

  function openRemediate() {
    const id = programItemId ?? findingId;
    router.push(buildDashboardDeepLink({ tab: "remediate", remediationId: id, action: "verify" }));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--background)] p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Host finding</h2>
          <button type="button" className="text-sm text-[var(--color-gray-500)] hover:text-white" onClick={onClose}>
            Close
          </button>
        </div>

        {loading ? <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p> : null}
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        {finding ? (
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Type</p>
              <p className="text-white">{finding.findingType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Algorithm</p>
              <p className="text-white">{finding.algorithm ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Location</p>
              <p className="break-all text-white">{finding.location ?? finding.hostname ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Confidence</p>
              <p className="text-white capitalize">{finding.confidence ?? "—"}</p>
            </div>
            {finding.keySize != null ? (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Key size</p>
                <p className="text-white">{finding.keySize}</p>
              </div>
            ) : null}
            {finding.fingerprint ? (
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--color-gray-500)]">Fingerprint</p>
                <p className="break-all font-mono text-xs text-[var(--color-gray-400)]">{finding.fingerprint}</p>
              </div>
            ) : null}
            <p className="text-xs text-[var(--color-gray-500)]">
              Findings are pushed by the sensor daemon on schedule. Use Remediate to track migration work.
            </p>
            <Button type="button" size="sm" onClick={openRemediate}>
              Open in Remediate
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
