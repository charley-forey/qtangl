"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";
import { dogfoodCopy } from "@/lib/copy/trust";
import {
  type DogfoodSummary,
  fetchDogfoodSummary,
  formatDogfoodDate,
  isDogfoodStale,
} from "@/lib/dogfood";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

const fallbackScanId = process.env.NEXT_PUBLIC_DOGFOOD_SCAN_ID?.trim() || "";

type Props = {
  showTargetsTable?: boolean;
  compact?: boolean;
};

export default function TrustDogfoodSelfScan({ showTargetsTable = false, compact = false }: Props) {
  const [summary, setSummary] = useState<DogfoodSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchDogfoodSummary();
        if (cancelled) return;
        if (payload?.latest) {
          setSummary(payload);
          trackDashboardEvent("trust_dogfood_viewed", {
            allFresh: payload.freshness?.allFresh ?? false,
            targetCount: payload.targets?.length ?? 0,
          });
          if (payload.targets?.some((t) => t.stale)) {
            trackDashboardEvent("trust_dogfood_stale_seen");
          }
          return;
        }
        if (fallbackScanId) {
          const verifyResponse = await fetch(
            `${qtanglApiBaseUrl}/pqc/verify/${encodeURIComponent(fallbackScanId)}`,
            { cache: "no-store" }
          );
          if (!verifyResponse.ok) throw new Error("Self-scan verification unavailable.");
          const verifyPayload = await verifyResponse.json();
          setSummary({
            latest: {
              scanId: verifyPayload.scanId ?? fallbackScanId,
              targetDomain: verifyPayload.targetDomain,
              readinessBand: verifyPayload.readinessBand,
              readinessScore: verifyPayload.readinessScore,
              verification: verifyPayload.verification,
            },
          });
          return;
        }
        setSummary(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load self-scan.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = summary?.latest;
  const scanId = latest?.scanId ?? fallbackScanId;
  const scannedLabel = formatDogfoodDate(latest?.scannedAt);
  const stale = isDogfoodStale(latest?.scannedAt);
  const transparencyUrl = `${qtanglApiBaseUrl}/pqc/transparency/root`;

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Dogfood — we scan ourselves</Eyebrow>
      {!compact ? (
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{dogfoodCopy}</p>
      ) : null}

      {loading ? <p className="mt-4 text-sm text-[var(--color-gray-500)]">Loading latest self-scan…</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {!loading && !error && !latest ? (
        <p className="mt-4 text-sm text-[var(--color-gray-500)]">
          Live self-scan badge is not yet available. Run your own scan at{" "}
          <Link href="/assess" className="text-white underline underline-offset-4">
            /assess
          </Link>{" "}
          or verify at{" "}
          <Link href="/verify" className="text-white underline underline-offset-4">
            /verify
          </Link>
          .
        </p>
      ) : null}

      {latest ? (
        <>
          {scannedLabel ? (
            <p className={`mt-4 text-sm ${stale ? "text-amber-300" : "text-[var(--color-gray-400)]"}`}>
              Last scanned: {scannedLabel}
              {stale ? " — older than 8 days; freshness monitor may be failing." : ""}
            </p>
          ) : null}
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Target</dt>
              <dd className="mt-1 text-sm text-white">{latest.targetDomain ?? "qtangl.com"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Readiness</dt>
              <dd className="mt-1 text-sm text-white">
                {latest.readinessScore ?? "—"}
                {latest.readinessBand ? ` (${latest.readinessBand})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Signature valid</dt>
              <dd className="mt-1 text-sm text-white">{latest.verification?.valid ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Transparency log</dt>
              <dd className="mt-1 text-sm text-white">
                {latest.verification?.logInclusion?.included ? (
                  <>
                    Included (seq {latest.verification.logInclusion.seq}) ·{" "}
                    <a href={transparencyUrl} className="underline" target="_blank" rel="noreferrer">
                      View root
                    </a>
                  </>
                ) : (
                  "Not included"
                )}
              </dd>
            </div>
          </dl>

          {showTargetsTable && summary?.targets && summary.targets.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[var(--color-gray-500)]">
                    <th className="pb-2 pr-3">Domain</th>
                    <th className="pb-2 pr-3">Score</th>
                    <th className="pb-2 pr-3">Last scan</th>
                    <th className="pb-2">Verify</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.targets.map((row) => (
                    <tr key={row.targetDomain} className="border-t border-[var(--border-subtle)]">
                      <td className="py-2 pr-3 text-white">{row.targetDomain}</td>
                      <td className="py-2 pr-3">
                        {row.missing ? (
                          <span className="text-amber-300">No scan</span>
                        ) : (
                          <>
                            {row.readinessScore ?? "—"}
                            {row.stale ? <span className="ml-1 text-amber-300">stale</span> : null}
                          </>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-[var(--color-gray-400)]">
                        {formatDogfoodDate(row.scannedAt) ?? "—"}
                      </td>
                      <td className="py-2">
                        {row.verifyUrl ? (
                          <a
                            href={row.verifyUrl}
                            className="underline"
                            onClick={() => trackDashboardEvent("trust_verify_clicked", { target: row.targetDomain })}
                          >
                            Verify
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
          ) : null}
        </>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {scanId ? (
          <Link
            href={latest?.verifyUrl ?? `/verify?scanId=${encodeURIComponent(scanId)}`}
            className="text-sm text-white underline underline-offset-4"
            onClick={() => trackDashboardEvent("trust_verify_clicked", { source: "primary_cta" })}
          >
            Verify our latest report
          </Link>
        ) : null}
        <Link href="/trust/dogfood" className="text-sm text-sky-300 underline underline-offset-4">
          Full dogfood report
        </Link>
        <Link href="/docs/trust/product-sbom" className="text-sm text-[var(--color-gray-400)] underline underline-offset-4">
          Platform CBOM
        </Link>
        <Link href="/docs/verify-spec" className="text-sm text-[var(--color-gray-400)] underline underline-offset-4">
          Verify spec
        </Link>
      </div>
    </Card>
  );
}
