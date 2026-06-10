"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";
import { dogfoodCopy } from "@/lib/copy/trust";

type DogfoodLatest = {
  scanId?: string;
  targetDomain?: string;
  readinessBand?: string;
  readinessScore?: number;
  scannedAt?: string;
  verifyUrl?: string;
  verification?: {
    valid?: boolean;
    logInclusion?: { included?: boolean; seq?: number };
  };
};

const STALE_DAYS = 8;
const fallbackScanId = process.env.NEXT_PUBLIC_DOGFOOD_SCAN_ID?.trim() || "";

function formatScannedAt(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isStale(iso?: string): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const ageMs = Date.now() - date.getTime();
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

export default function TrustDogfoodSelfScan() {
  const [data, setData] = useState<DogfoodLatest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${qtanglApiBaseUrl}/pqc/dogfood/latest`, { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as DogfoodLatest;
          if (!cancelled) {
            setData(payload);
          }
          return;
        }
        if (fallbackScanId) {
          const verifyResponse = await fetch(
            `${qtanglApiBaseUrl}/pqc/verify/${encodeURIComponent(fallbackScanId)}`,
            { cache: "no-store" }
          );
          if (!verifyResponse.ok) {
            throw new Error("Self-scan verification unavailable.");
          }
          const verifyPayload = (await verifyResponse.json()) as DogfoodLatest;
          if (!cancelled) {
            setData({ ...verifyPayload, scanId: verifyPayload.scanId ?? fallbackScanId });
          }
          return;
        }
        if (!cancelled) {
          setData(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load self-scan.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadLatest();
    return () => {
      cancelled = true;
    };
  }, []);

  const scanId = data?.scanId ?? fallbackScanId;
  const scannedLabel = formatScannedAt(data?.scannedAt);
  const stale = isStale(data?.scannedAt);

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Dogfood — we scan ourselves</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">{dogfoodCopy}</p>

      {loading ? (
        <p className="mt-4 text-sm text-[var(--color-gray-500)]">Loading latest self-scan…</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {!loading && !error && !data ? (
        <p className="mt-4 text-sm text-[var(--color-gray-500)]">
          Live self-scan badge is not yet available for this deployment. Run your own scan at{" "}
          <Link href="/assess" className="text-white underline underline-offset-4">
            /assess
          </Link>{" "}
          and verify at{" "}
          <Link href="/verify" className="text-white underline underline-offset-4">
            /verify
          </Link>
          .
        </p>
      ) : null}

      {data ? (
        <>
          {scannedLabel ? (
            <p className={`mt-4 text-sm ${stale ? "text-amber-300" : "text-[var(--color-gray-400)]"}`}>
              Last scanned: {scannedLabel}
              {stale ? " — scan is older than 8 days; freshness monitor may be failing." : ""}
            </p>
          ) : null}
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Target</dt>
              <dd className="mt-1 text-sm text-white">{data.targetDomain ?? "qtangl.com"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Readiness band</dt>
              <dd className="mt-1 text-sm text-white">{data.readinessBand ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Signature valid</dt>
              <dd className="mt-1 text-sm text-white">{data.verification?.valid ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Transparency log</dt>
              <dd className="mt-1 text-sm text-white">
                {data.verification?.logInclusion?.included
                  ? `Included (seq ${data.verification.logInclusion.seq})`
                  : "Not included"}
              </dd>
            </div>
            {scanId ? (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Scan ID</dt>
                <dd className="mt-1 font-mono text-xs text-[var(--color-gray-300)]">{scanId}</dd>
              </div>
            ) : null}
          </dl>
        </>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {scanId ? (
          <Link
            href={data?.verifyUrl ?? `/verify?scanId=${encodeURIComponent(scanId)}`}
            className="text-sm text-white underline underline-offset-4"
          >
            Verify our latest report
          </Link>
        ) : null}
        <Link href="/docs/verify-spec" className="text-sm text-[var(--color-gray-400)] underline underline-offset-4">
          Verify spec
        </Link>
      </div>
    </Card>
  );
}
