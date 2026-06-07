"use client";

import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchTenantJson, postTenantJson } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";

type VaultObject = {
  id: string;
  scanId: string;
  objectType: string;
  contentHash?: string;
  retainedUntil?: string | null;
  createdAt?: string | null;
};

type VaultSummary = {
  total: number;
  active: number;
  objects: VaultObject[];
};

export default function EvidenceVaultPanel({
  apiKey,
  scanIds = [],
  onMessage,
}: {
  apiKey: string;
  scanIds?: string[];
  onMessage?: (message: string) => void;
}) {
  const [summary, setSummary] = useState<VaultSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [retaining, setRetaining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchTenantJson<VaultSummary>("/tenant/evidence", apiKey);
      setSummary(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load evidence vault.");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  async function retainScan(scanId: string) {
    setRetaining(scanId);
    try {
      const result = await postTenantJson<{ retained?: boolean; retainedUntil?: string }>(
        `/tenant/evidence/${encodeURIComponent(scanId)}/retain`,
        apiKey,
        {}
      );
      if (result.retained) {
        onMessage?.(`Evidence retained for ${scanId} until ${result.retainedUntil ?? "policy default"}.`);
      } else {
        onMessage?.(`Could not retain ${scanId} — persistence may be disabled.`);
      }
      await loadVault();
    } catch (retainError) {
      onMessage?.(retainError instanceof Error ? retainError.message : "Retain failed.");
    } finally {
      setRetaining(null);
    }
  }

  const retainCandidates = scanIds.filter(
    (scanId) => !summary?.objects.some((obj) => obj.scanId === scanId)
  );

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border-subtle)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Eyebrow>Evidence vault</Eyebrow>
        {!summary ? (
          <button
            type="button"
            className="text-sm text-white underline underline-offset-4"
            onClick={() => void loadVault()}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load vault"}
          </button>
        ) : (
          <button
            type="button"
            className="text-xs text-[var(--color-gray-400)] underline"
            onClick={() => void loadVault()}
          >
            Refresh
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--color-gray-300)]">
        Retain signed bundles with configurable retention for audit and regulatory requests.
      </p>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {summary ? (
        <>
          <p className="text-xs text-[var(--color-gray-500)]">
            {summary.active} active · {summary.total} total retained
          </p>
          {summary.objects.length > 0 ? (
            <ul className="space-y-2 text-xs text-[var(--color-gray-400)]">
              {summary.objects.map((obj) => (
                <li
                  key={obj.id}
                  className="flex flex-col gap-1 rounded-lg border border-[var(--border-subtle)] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-white">{obj.scanId}</p>
                    <p>
                      {obj.objectType}
                      {obj.contentHash ? ` · ${obj.contentHash.slice(0, 12)}…` : ""}
                    </p>
                    {obj.retainedUntil ? (
                      <p>Until {formatUtcDateTime(obj.retainedUntil)}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-gray-500)]">No retained evidence yet.</p>
          )}
        </>
      ) : null}

      {retainCandidates.length > 0 ? (
        <div className="border-t border-[var(--border-subtle)] pt-3">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
            Retain from recent scans
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {retainCandidates.slice(0, 5).map((scanId) => (
              <Button
                key={scanId}
                type="button"
                size="sm"
                variant="secondary"
                disabled={retaining === scanId}
                aria-busy={retaining === scanId}
                onClick={() => void retainScan(scanId)}
              >
                {retaining === scanId ? "Retaining…" : `Retain ${scanId.slice(0, 12)}…`}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
