"use client";

import { useCallback, useEffect, useState } from "react";

import ReachabilityTiers from "@/components/discovery/ReachabilityTiers";
import { getDiscoveryJob, listCodeTargets, triggerCodeScan } from "@/lib/discovery";

type CodeScanPanelProps = {
  apiKey: string;
};

export default function CodeScanPanel({ apiKey }: CodeScanPanelProps) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");
  const [targets, setTargets] = useState<{ owner: string; repo: string; provider: string }[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [reachability, setReachability] = useState({ confirmed: 0, reachable: 0, available: 0 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTargets = useCallback(async () => {
    try {
      const res = await listCodeTargets(apiKey);
      setTargets(res.targets ?? []);
    } catch {
      setTargets([]);
    }
  }, [apiKey]);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  async function handleScan(o?: string, r?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await triggerCodeScan(apiKey, {
        githubOwner: o ?? owner,
        githubRepo: r ?? repo,
        githubToken: token,
        async: true,
      });
      setJobId(res.jobId);
      setTimeout(async () => {
        if (!res.jobId) return;
        const job = await getDiscoveryJob(apiKey, res.jobId);
        const jobResult = (job.result ?? job) as Record<string, unknown>;
        setResult(jobResult);
        const tiers = jobResult.reachability as { confirmed?: number; reachable?: number; available?: number };
        if (tiers) {
          setReachability({
            confirmed: tiers.confirmed ?? 0,
            reachable: tiers.reachable ?? 0,
            available: tiers.available ?? 0,
          });
        }
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  function exportCbom() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code-scan-${jobId ?? "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Code scan</h3>
      <p className="text-sm text-[var(--muted)]">
        Orchestrate CryptoScan + dependency reachability on a GitHub repository.
      </p>
      {targets.length > 0 && (
        <ul className="text-sm">
          {targets.map((t) => (
            <li key={`${t.owner}/${t.repo}`}>
              <button
                type="button"
                className="text-[var(--accent)] hover:underline"
                onClick={() => handleScan(t.owner, t.repo)}
              >
                {t.owner}/{t.repo}
              </button>
              <span className="ml-2 text-xs text-[var(--muted)]">{t.provider}</span>
            </li>
          ))}
        </ul>
      )}
      <ReachabilityTiers {...reachability} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="input" placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
        <input className="input" placeholder="Repo" value={repo} onChange={(e) => setRepo(e.target.value)} />
        <input
          className="input sm:col-span-2"
          type="password"
          placeholder="GitHub PAT"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => handleScan()}>
          {loading ? "Scanning…" : "Start code scan"}
        </button>
        {result && (
          <button type="button" className="btn btn-secondary" onClick={exportCbom}>
            Export CBOM JSON
          </button>
        )}
      </div>
      {jobId && <p className="text-xs text-[var(--muted)]">Job: {jobId}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
