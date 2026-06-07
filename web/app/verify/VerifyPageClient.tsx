"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { qtanglApiBaseUrl } from "@/lib/api";

type VerifyResult = {
  valid?: boolean;
  alg?: string;
  keyFingerprint?: string;
  contentHash?: string;
  signedAt?: string;
  reason?: string;
  logInclusion?: {
    included?: boolean;
    seq?: number;
    entryHash?: string;
    rootHash?: string;
    rootSeq?: number;
    signedAt?: string;
  };
};

function VerifyResultPanel({ result }: { result: VerifyResult }) {
  return (
    <dl className="grid gap-3 rounded-xl border border-[var(--border-subtle)] p-4">
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Valid</dt>
        <dd className="text-white">{result.valid ? "Yes" : "No"}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Algorithm</dt>
        <dd>{result.alg ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Key fingerprint</dt>
        <dd className="font-mono text-xs">{result.keyFingerprint ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Content hash</dt>
        <dd className="break-all font-mono text-xs">{result.contentHash ?? "—"}</dd>
      </div>
      {!result.valid && result.reason ? (
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Reason</dt>
          <dd>{result.reason}</dd>
        </div>
      ) : null}
      {result.logInclusion?.included ? (
        <>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Transparency log</dt>
            <dd className="text-white">Included (seq {result.logInclusion.seq})</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Log root</dt>
            <dd className="break-all font-mono text-xs">{result.logInclusion.rootHash ?? "—"}</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

export default function VerifyPageClient() {
  const params = useSearchParams();
  const scanId = params.get("scanId") ?? "";
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastedJson, setPastedJson] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);

  useEffect(() => {
    if (!scanId) {
      return;
    }
    fetch(`${qtanglApiBaseUrl}/pqc/verify/${encodeURIComponent(scanId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Verification lookup failed.");
        }
        const payload = await response.json();
        setResult(payload.verification ?? null);
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Verification failed.");
      });
  }, [scanId]);

  async function verifyPastedJson() {
    setPasteLoading(true);
    setError(null);
    setResult(null);
    try {
      const reportJson = JSON.parse(pastedJson) as Record<string, unknown>;
      const response = await fetch(`${qtanglApiBaseUrl}/pqc/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportJson }),
      });
      if (!response.ok) {
        throw new Error("Verification request failed.");
      }
      const payload = await response.json();
      setResult(payload.verification ?? null);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Invalid JSON or verification failed.");
    } finally {
      setPasteLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Trust"
        title="Verify Q-Day report"
        description="Recompute the SHA-256 content hash and validate the Qtangl report signature (ML-DSA-65 or Ed25519 fallback)."
      />
      <Section>
        <div className="max-w-2xl space-y-6 text-sm text-[var(--color-gray-300)]">
          {!scanId ? (
            <p>
              Paste a scan ID in the URL: <code className="text-white">/verify?scanId=scan-…</code>
            </p>
          ) : null}
          {scanId ? <p className="font-mono text-white">{scanId}</p> : null}
          {error ? <p className="text-red-300">{error}</p> : null}
          {result ? <VerifyResultPanel result={result} /> : null}

          <div className="space-y-3 border-t border-[var(--border-subtle)] pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Or paste report JSON
            </p>
            <textarea
              value={pastedJson}
              onChange={(event) => setPastedJson(event.target.value)}
              rows={8}
              placeholder='{"scanId":"…","signature":{…},…}'
              className="w-full rounded-xl border border-[var(--border-strong)] bg-black p-3 font-mono text-xs text-white"
            />
            <button
              type="button"
              disabled={!pastedJson.trim() || pasteLoading}
              onClick={verifyPastedJson}
              className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {pasteLoading ? "Verifying…" : "Verify pasted report"}
            </button>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
