"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PageHero from "@/components/layout/PageHero";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/layout/Section";
import { qtanglApiBaseUrl } from "@/lib/api";
import { createPublicQtanglClient } from "@/lib/qtangl-client";
import { trackEvent } from "@/lib/analytics";

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

function normalizeScanIdInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.includes("scanId=")) {
    try {
      const href = trimmed.startsWith("http")
        ? trimmed
        : `https://qtangl.com${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
      const scanId = new URL(href).searchParams.get("scanId")?.trim();
      if (scanId) {
        return scanId;
      }
    } catch {
      // Fall through to treat the paste as a bare scan id.
    }
  }

  return trimmed;
}

export default function VerifyPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const scanId = params.get("scanId") ?? "";
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanIdInput, setScanIdInput] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);

  function goToScanId(raw: string) {
    const normalized = normalizeScanIdInput(raw);
    if (!normalized || normalized === scanId) {
      return;
    }
    trackEvent("verify_scan_id_navigate", { scanId: normalized });
    router.push(`/verify?scanId=${encodeURIComponent(normalized)}`);
  }

  function handleScanIdSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToScanId(scanIdInput);
  }

  function handleScanIdPaste(value: string) {
    const normalized = normalizeScanIdInput(value);
    setScanIdInput(normalized);
    goToScanId(normalized);
  }

  useEffect(() => {
    setScanIdInput(scanId);
  }, [scanId]);

  useEffect(() => {
    trackEvent("verify_viewed", {
      scanId: scanId || undefined,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
  }, [scanId]);

  useEffect(() => {
    if (!scanId) {
      setResult(null);
      setError(null);
      return;
    }
    setResult(null);
    setError(null);
    const client = createPublicQtanglClient();
    client
      .verifyScan(scanId)
      .then((payload) => {
        const verification = (payload.verification ?? null) as VerifyResult | null;
        setResult(verification);
        trackEvent("verify_scan_lookup", { scanId, valid: verification?.valid });
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
      const client = createPublicQtanglClient();
      const payload = await client.verifyReport(reportJson);
      const verification = (payload.verification ?? null) as VerifyResult | null;
      setResult(verification);
      trackEvent("verify_paste_json", { valid: verification?.valid });
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
          <div className="rounded-xl border border-[var(--border-subtle)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Offline verification (recommended)
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-black p-3 text-xs text-[var(--color-gray-300)]">
              {`pip install qtangl-verify
qtangl-verify report.json --api-base ${qtanglApiBaseUrl} --json`}
            </pre>
            <p className="mt-3 text-xs text-[var(--color-gray-500)]">
              Full spec:{" "}
              <a href="/docs/verify-spec" className="text-white underline underline-offset-4">
                /docs/verify-spec
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">
              Verify by scan ID
            </p>
            <form onSubmit={handleScanIdSubmit} className="flex gap-3">
              <input
                type="text"
                value={scanIdInput}
                onChange={(event) => setScanIdInput(event.target.value)}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text");
                  if (pasted.trim()) {
                    event.preventDefault();
                    handleScanIdPaste(pasted);
                  }
                }}
                placeholder="scan-… or paste a verify link"
                spellCheck={false}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-black px-4 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
              />
              <button
                type="submit"
                disabled={!normalizeScanIdInput(scanIdInput)}
                className="shrink-0 rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                Verify
              </button>
            </form>
          </div>
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
