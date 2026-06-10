"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchTenantJson, postTenantJson } from "@/lib/tenant-api";

type FlipJob = {
  id: string;
  programItemId: string | null;
  flipSurface: string;
  provider: string;
  targetEnv: string;
  status: string;
  submittedBy: string | null;
};

export default function FlipApprovalQueue({ apiKey }: { apiKey: string }) {
  const [items, setItems] = useState<FlipJob[]>([]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetchTenantJson<{ items: FlipJob[] }>("/tenant/flips?status=pending_approval", apiKey);
    setItems(res.items);
  }, [apiKey]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function approve(jobId: string) {
    await postTenantJson(`/tenant/flips/${jobId}/approve`, apiKey, { approvalNote: note || "Approved" });
    setMessage(`Approved ${jobId}`);
    setNote("");
    await load();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white">Pending flip approvals</p>
      {message && <p className="text-xs text-[var(--muted)]">{message}</p>}
      <textarea
        className="w-full rounded border border-[var(--border-subtle)] bg-black p-2 text-xs text-white"
        placeholder="Approval note (required for prod)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      {items.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">No pending approvals.</p>
      ) : (
        items.map((job) => (
          <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
            <div className="text-xs text-[var(--color-gray-300)]">
              <p className="text-white">
                {job.flipSurface}/{job.provider} ({job.targetEnv})
              </p>
              <p>
                {job.id} · submitter {job.submittedBy ?? "—"}
              </p>
            </div>
            <button type="button" className="text-xs underline text-emerald-400" onClick={() => approve(job.id)}>
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}
