"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";

type DogfoodVerify = {
  scanId?: string;
  readinessBand?: string;
  targetDomain?: string;
  verification?: {
    valid?: boolean;
    alg?: string;
    keyFingerprint?: string;
    logInclusion?: { included?: boolean; seq?: number };
  };
};

const dogfoodScanId = process.env.NEXT_PUBLIC_DOGFOOD_SCAN_ID?.trim() || "";

export default function TrustDogfoodSelfScan() {
  const [data, setData] = useState<DogfoodVerify | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(dogfoodScanId));

  useEffect(() => {
    if (!dogfoodScanId) {
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${qtanglApiBaseUrl}/pqc/verify/${encodeURIComponent(dogfoodScanId)}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error("Self-scan verification unavailable.");
        }
        const payload = (await response.json()) as DogfoodVerify;
        if (!cancelled) {
          setData(payload);
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
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Dogfood — we scan ourselves</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-300)]">
        Qtangl runs weekly PQC scans of our own domains in CI and publishes signed reports customers can
        verify independently. We hold ourselves to the standard we sell.
      </p>

      {!dogfoodScanId ? (
        <p className="mt-4 text-sm text-[var(--color-gray-500)]">
          Live self-scan badge is not configured for this deployment. Run your own scan at{" "}
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

      {dogfoodScanId && loading ? (
        <p className="mt-4 text-sm text-[var(--color-gray-500)]">Loading latest self-scan…</p>
      ) : null}
      {dogfoodScanId && error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {dogfoodScanId && data ? (
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
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Scan ID</dt>
            <dd className="mt-1 font-mono text-xs text-[var(--color-gray-300)]">
              {data.scanId ?? dogfoodScanId}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {dogfoodScanId ? (
          <Link
            href={`/verify?scanId=${encodeURIComponent(data?.scanId ?? dogfoodScanId)}`}
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
