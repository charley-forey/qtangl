"use client";

import { useState } from "react";

import { useQtanglClient } from "@qtangl/sdk-react";

type Props = {
  programItemId: string;
  onJobStarted?: (jobId: string) => void;
};

const SURFACES = [
  { id: "overlay", label: "Overlay", providers: ["github", "gitlab", "ado", "kubernetes", "terraform"] },
  { id: "clm", label: "CLM", providers: ["venafi", "digicert", "appviewx", "acme"] },
  { id: "kms", label: "KMS", providers: ["kms-aws", "kms-azure", "kms-gcp"] },
];

export default function CryptoFlipPanel({ programItemId, onJobStarted }: Props) {
  const client = useQtanglClient();
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
      const res = await client.remediation.flipDryRun(programItemId, {
        flipSurface: surface,
        provider,
        targetEnv,
        request: {},
      });
      setDryRunResult({
        ...((res.dryRunResult as Record<string, unknown> | undefined) ?? {}),
        policy: res.policy,
      });
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
      const res = await client.remediation.flip(programItemId, {
        flipSurface: surface,
        provider,
        targetEnv,
        request: {},
      });
      const job = res.job as { id?: string; status?: string } | undefined;
      const jobId = job?.id;
      setMessage(`Flip ${job?.status ?? "submitted"}${jobId ? `: ${jobId}` : ""}`);
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
        <select
          className="rounded bg-black text-xs text-white"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          className="rounded bg-black px-2 py-1 text-xs text-white"
          value={targetEnv}
          onChange={(e) => setTargetEnv(e.target.value)}
          placeholder="Target env"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void runDryRun()}
          className="rounded bg-white/10 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          Dry run
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void submitFlip()}
          className="rounded bg-emerald-600 px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          Submit flip
        </button>
      </div>
      {message && <p className="text-xs text-[var(--muted)]">{message}</p>}
      {dryRunResult && (
        <pre className="max-h-40 overflow-auto rounded bg-black/60 p-2 text-xs text-[var(--color-gray-300)]">
          {JSON.stringify(dryRunResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
