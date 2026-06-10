"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchTenantJson } from "@/lib/tenant-api";

type FlipJob = {
  id: string;
  status: string;
  flipSurface: string;
  provider: string;
  externalRef: string | null;
  error: string | null;
  retryCount: number;
};

export default function FlipJobProgress({ apiKey, jobId }: { apiKey: string; jobId: string }) {
  const [job, setJob] = useState<FlipJob | null>(null);

  const poll = useCallback(async () => {
    const res = await fetchTenantJson<{ job: FlipJob }>(`/tenant/flips/${jobId}/poll`, apiKey);
    setJob(res.job);
  }, [apiKey, jobId]);

  useEffect(() => {
    poll().catch(() => undefined);
    const t = setInterval(() => poll().catch(() => undefined), 5000);
    return () => clearInterval(t);
  }, [poll]);

  if (!job) return <p className="text-xs text-[var(--muted)]">Loading flip job…</p>;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-3 text-xs text-[var(--color-gray-300)]">
      <p className="font-medium text-white">
        {job.flipSurface}/{job.provider} — {job.status}
      </p>
      {job.externalRef && (
        <p>
          External ref:{" "}
          <a className="underline" href={job.externalRef.startsWith("http") ? job.externalRef : "#"}>
            {job.externalRef}
          </a>
        </p>
      )}
      {job.error && <p className="text-red-400">{job.error}</p>}
      {job.retryCount > 0 && <p>Retries: {job.retryCount}</p>}
    </div>
  );
}
