"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { postDashboardJson } from "@/lib/dashboard-bff";
import { postTenantJson } from "@/lib/tenant-api";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";

type PassportScope = "report" | "bundle" | "passport";

type ShareResult = {
  url?: string;
  token?: string;
  scope?: string;
  label?: string;
  expiresAt?: string;
};

export default function PassportPanel({
  scanId,
  apiKey,
  onCreated,
  useBff = false,
}: {
  scanId: string;
  apiKey: string;
  onCreated?: (result: ShareResult) => void;
  useBff?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [scope, setScope] = useState<PassportScope>("passport");
  const [expiresHours, setExpiresHours] = useState(168);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShareResult | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function createPassport() {
    setLoading(true);
    setError(null);
    try {
      const payload = useBff
        ? await postDashboardJson<ShareResult>(
            `/tenant/scans/${encodeURIComponent(scanId)}/share`,
            { label: label.trim(), scope, expiresHours }
          )
        : await postTenantJson<ShareResult>(
            `/tenant/scans/${encodeURIComponent(scanId)}/share`,
            apiKey,
            { label: label.trim(), scope, expiresHours }
          );
      setResult(payload);
      trackDashboardEvent("passport_created", { scanId, scope });
      onCreated?.(payload);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create passport.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="text-white underline underline-offset-4"
        onClick={() => {
          setOpen(true);
          setError(null);
          setResult(null);
        }}
      >
        Passport
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-label="Close passport panel"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="passport-panel-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-black p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
          >
            <Eyebrow>Readiness passport</Eyebrow>
            <h3 id="passport-panel-title" className="mt-2 text-lg font-semibold text-white">
              Share signed evidence
            </h3>
            <p className="mt-2 text-sm text-[var(--color-gray-400)]">
              Create an expiring link for scan{" "}
              <span className="font-mono text-[var(--color-gray-300)]">{scanId}</span>. Scope controls
              what recipients can download without an API key.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Label (e.g. Q2 board review)"
                maxLength={255}
                className="w-full rounded-lg border border-[var(--border-strong)] bg-black px-3 py-2 text-sm text-white"
              />
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value as PassportScope)}
                className="w-full rounded-lg border border-[var(--border-strong)] bg-black px-3 py-2 text-sm text-white"
              >
                <option value="report">Report — PDF summary only</option>
                <option value="bundle">Bundle — full evidence ZIP</option>
                <option value="passport">Passport — report + bundle + metadata</option>
              </select>
              <label className="block text-xs text-[var(--color-gray-500)]">
                Expires in (hours)
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={expiresHours}
                  onChange={(event) => setExpiresHours(Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-black px-3 py-2 text-sm text-white"
                />
              </label>
            </div>

            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
            {result?.url ? (
              <p className="mt-3 break-all text-sm text-green-300">
                Link created: <span className="font-mono text-white">{result.url}</span>
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={loading || (!useBff && !apiKey)}
                aria-busy={loading}
                onClick={() => void createPassport()}
              >
                {loading ? "Creating…" : "Create passport"}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
