"use client";

import { useCallback, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  fetchTenantJson,
  getStoredTenantApiKey,
  setStoredTenantApiKey,
  tenantReportUrl,
  type TenantScanSummary,
} from "@/lib/tenant-api";
import { qtanglApiBaseUrl } from "@/lib/api";

type TenantMe = {
  tenantId: string;
  persistenceEnabled: boolean;
};

export default function DashboardClient() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [me, setMe] = useState<TenantMe | null>(null);
  const [scans, setScans] = useState<TenantScanSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredTenantApiKey();
    if (stored) {
      setApiKey(stored);
      setSavedKey(stored);
    }
  }, []);

  const loadDashboard = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    try {
      const mePayload = await fetchTenantJson<{ tenantId: string; persistenceEnabled: boolean }>(
        "/tenant/me",
        key
      );
      const scansPayload = await fetchTenantJson<{ scans: TenantScanSummary[] }>("/tenant/scans", key);
      setMe({ tenantId: mePayload.tenantId, persistenceEnabled: mePayload.persistenceEnabled });
      setScans(scansPayload.scans);
      setSavedKey(key);
      setStoredTenantApiKey(key);
    } catch (loadError) {
      setMe(null);
      setScans([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card tone="strong" className="rounded-[var(--radius-xl)]">
        <Eyebrow>Tenant API key</Eyebrow>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
          Paste the tenant key issued by Qtangl admin. It is stored in this browser session only.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="qtangl_..."
            className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
          <button
            type="button"
            disabled={!apiKey || loading}
            onClick={() => loadDashboard(apiKey)}
            className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "Loading…" : "Connect"}
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--color-gray-500)]">
          API base: {qtanglApiBaseUrl}
        </p>
      </Card>

      {error ? (
        <Card tone="ghost" className="border border-red-500/40 text-red-200">
          {error}
        </Card>
      ) : null}

      {me ? (
        <Card tone="panel">
          <Eyebrow>Tenant overview</Eyebrow>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Tenant ID</dt>
              <dd className="mt-1 font-mono text-sm text-white">{me.tenantId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-gray-500)]">Persistence</dt>
              <dd className="mt-1 text-sm text-white">{me.persistenceEnabled ? "Postgres enabled" : "In-memory / demo"}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

      {savedKey && scans.length > 0 ? (
        <Card tone="panel">
          <Eyebrow>Recent PQC scans</Eyebrow>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
                <tr>
                  <th className="pb-3 pr-4">Scan ID</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Scenario</th>
                  <th className="pb-3 pr-4">Created</th>
                  <th className="pb-3">Report</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-gray-300)]">
                {scans.map((scan) => (
                  <tr key={scan.scanId} className="border-t border-[var(--border-subtle)]">
                    <td className="py-3 pr-4 font-mono text-xs text-white">{scan.scanId}</td>
                    <td className="py-3 pr-4">{scan.status}</td>
                    <td className="py-3 pr-4">{scan.scenarioId ?? "—"}</td>
                    <td className="py-3 pr-4">{new Date(scan.createdAt).toLocaleString()}</td>
                    <td className="py-3">
                      {scan.status === "done" ? (
                        <a
                          href={tenantReportUrl(scan.scanId, savedKey, "pdf")}
                          className="text-white underline underline-offset-4"
                          target="_blank"
                          rel="noreferrer"
                        >
                          PDF
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : savedKey && !loading ? (
        <Card tone="ghost">
          <p className="text-sm text-[var(--color-gray-400)]">No scans yet for this tenant.</p>
        </Card>
      ) : null}
    </div>
  );
}
