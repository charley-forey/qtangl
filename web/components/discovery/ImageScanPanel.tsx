"use client";

import { useCallback, useEffect, useState } from "react";

import SourceRuntimeDiff from "@/components/discovery/SourceRuntimeDiff";
import {
  getDiscoveryJob,
  getSourceRuntimeDiff,
  listImageTargets,
  testRegistryConnection,
  triggerBinaryScan,
} from "@/lib/discovery";

type ImageScanPanelProps = {
  apiKey: string;
};

export default function ImageScanPanel({ apiKey }: ImageScanPanelProps) {
  const [imageRef, setImageRef] = useState("nginx:1.25");
  const [targets, setTargets] = useState<{ imageRef: string; registry: string }[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [diff, setDiff] = useState<{
    sourceCount: number;
    runtimeCount: number;
    runtimeOnly: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [integrationId, setIntegrationId] = useState("");
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    try {
      const res = await listImageTargets(apiKey);
      setTargets(res.targets ?? []);
    } catch {
      setTargets([]);
    }
  }, [apiKey]);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  async function handleScan(ref?: string) {
    const target = ref ?? imageRef;
    setLoading(true);
    setDiff(null);
    try {
      const res = await triggerBinaryScan(apiKey, target);
      setJobId(res.jobId);
      setTimeout(async () => {
        if (!res.jobId) return;
        const job = await getDiscoveryJob(apiKey, res.jobId);
        const jobResult = (job.result ?? job) as Record<string, unknown>;
        setResult(jobResult);
        const runtimeFindings = (jobResult.findings as Record<string, unknown>[]) ?? [];
        const sourceFindings = (jobResult.sourceFindings as Record<string, unknown>[]) ?? [];
        if (runtimeFindings.length || sourceFindings.length) {
          const d = await getSourceRuntimeDiff(apiKey, sourceFindings, runtimeFindings);
          setDiff({
            sourceCount: d.sourceCount ?? 0,
            runtimeCount: d.runtimeCount ?? 0,
            runtimeOnly: d.runtimeOnly ?? [],
          });
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Container / binary scan</h3>
      {targets.length > 0 && (
        <ul className="text-sm text-[var(--muted)]">
          {targets.map((t) => (
            <li key={t.imageRef}>
              <button type="button" className="text-[var(--accent)] hover:underline" onClick={() => handleScan(t.imageRef)}>
                {t.imageRef}
              </button>
              <span className="ml-2 text-xs">({t.registry})</span>
            </li>
          ))}
        </ul>
      )}
      <input className="input w-full" value={imageRef} onChange={(e) => setImageRef(e.target.value)} />
      <input
        className="input w-full"
        placeholder="Registry integration id (optional)"
        value={integrationId}
        onChange={(e) => setIntegrationId(e.target.value)}
      />
      {integrationId && (
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={async () => {
            const res = await testRegistryConnection(apiKey, integrationId, imageRef);
            setTestMessage(res.ok ? "Registry pull OK" : String(res.message ?? "Pull failed"));
          }}
        >
          Test connection
        </button>
      )}
      {testMessage && <p className="text-xs text-[var(--muted)]">{testMessage}</p>}
      <button type="button" className="btn btn-primary" disabled={loading} onClick={() => handleScan()}>
        {loading ? "Scanning…" : "Scan image"}
      </button>
      {jobId && <p className="text-xs text-[var(--muted)]">Job: {jobId}</p>}
      {diff && (
        <SourceRuntimeDiff
          sourceCount={diff.sourceCount}
          runtimeCount={diff.runtimeCount}
          runtimeOnly={diff.runtimeOnly}
        />
      )}
      {result && (
        <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
