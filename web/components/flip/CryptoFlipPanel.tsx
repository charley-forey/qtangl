"use client";

import { useState } from "react";

import { postTenantJson } from "@/lib/tenant-api";

type Props = {
  apiKey: string;
  programItemId: string;
  onJobStarted?: (jobId: string) => void;
};

const SURFACES = [
  { id: "overlay", label: "Overlay", providers: ["github", "gitlab", "ado", "kubernetes", "terraform"] },
  { id: "clm", label: "CLM", providers: ["venafi", "digicert", "appviewx", "acme"] },
  { id: "kms", label: "KMS", providers: ["kms-aws", "kms-azure", "kms-gcp"] },
];

export default function CryptoFlipPanel({ apiKey, programItemId, onJobStarted }: Props) {
  const [surface, setSurface] = useState("overlay");
  const [provider, setProvider] = useState("github");
  const [targetEnv, setTargetEnv] = useState("staging");
  const [dryRunResult, setDryRunResult] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const providers = SURFACES.find((s) => s.id === surface)?.providers ?? [];

  async function runDryRun() {
    setBusy(true);
    setMessage("");
    try {
      const res = await postTenantJson<{
        dryRunResult?: Record<string, unknown>;
        policy?: Record<string, unknown>;
      }>(`/tenant/remediation/program/${programItemId}/flip/dry-run`, apiKey, {
        flipSurface: surface,
        provider,
        targetEnv,
        request: {},
      });
      setDryRunResult({ ...(res.dryRunResult ?? {}), policy: res.policy });
      setMessage("Dry-run complete — no side effects.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Dry-run failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitFlip() {
    setBusy(true);
    setMessage("");
    try {
      const res = await postTenantJson<{ job?: { id?: string; status?: string } }>(
        `/tenant/remediation/program/${programItemId}/flip`,
        apiKey,
        { flipSurface: surface, provider, targetEnv, request: {} }
      );
      const jobId = res.job?.id;
      setMessage(`Flip ${res.job?.status ?? "submitted"}${jobId ? `: ${jobId}` : ""}`);
      if (jobId) onJobStarted?.(jobId);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] p-4">
      <p className="text-sm font-medium text-white">Crypto flip</p>
      <div className="flex flex-wrap gap-2">
        <select className="rounded bg-black text-xs text-white" value={surface} onChange={(e) => setSurface(e.target.value)}>
          {SURFACES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select className="rounded bg-black text-xs text-white" value={provider} onChange={(e) => setProvider(e.target.value)}>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select className="rounded bg-black text-xs text-white" value={targetEnv} onChange={(e) => setTargetEnv(e.target.value)}>
          <option value="staging">staging</option>
          <option value="prod">prod</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className="text-xs underline text-white" onClick={runDryRun}>
          Dry-run
        </button>
        <button type="button" disabled={busy} className="text-xs underline text-emerald-400" onClick={submitFlip}>
          Submit flip
        </button>
      </div>
      {message && <p className="text-xs text-[var(--muted)]">{message}</p>}
      {dryRunResult && (
        <pre className="max-h-40 overflow-auto rounded bg-black/50 p-2 text-[10px] text-[var(--color-gray-300)]">
          {JSON.stringify(dryRunResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
