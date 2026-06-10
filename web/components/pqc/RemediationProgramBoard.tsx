"use client";

import { useCallback, useEffect, useState } from "react";

import CryptoFlipPanel from "@/components/flip/CryptoFlipPanel";
import FlipJobProgress from "@/components/flip/FlipJobProgress";
import { fetchTenantJson, postTenantJson, putTenantJson } from "@/lib/tenant-api";

type ProgramItem = {
  id: string;
  title: string;
  status: string;
  owner: string | null;
  sourceType: string;
  deepLink: string | null;
  targetDate: string | null;
};

type Velocity = {
  total: number;
  done: number;
  completionPct: number;
  itemsPerWeek: number;
};

export default function RemediationProgramBoard({ apiKey }: { apiKey: string }) {
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [velocity, setVelocity] = useState<Velocity | null>(null);
  const [playbook, setPlaybook] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const [flipItemId, setFlipItemId] = useState<string | null>(null);
  const [activeFlipJobId, setActiveFlipJobId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = await fetchTenantJson<{ items: ProgramItem[] }>("/tenant/remediation/program", apiKey);
    const vel = await fetchTenantJson<Velocity & { status: string }>(
      "/tenant/remediation/program/velocity",
      apiKey
    );
    setItems(list.items);
    setVelocity(vel);
  }, [apiKey]);

  useEffect(() => {
    load().catch((e) => setMessage(e instanceof Error ? e.message : "Load failed"));
  }, [load]);

  async function updateStatus(id: string, status: string) {
    await putTenantJson(`/tenant/remediation/program/${id}`, apiKey, { status });
    await load();
  }

  async function openPlaybook(id: string) {
    const res = await fetchTenantJson<{ playbook: { steps: string[] } }>(
      `/tenant/remediation/program/${id}/playbook`,
      apiKey
    );
    setPlaybook(res.playbook.steps);
  }

  async function verify(id: string) {
    setMessage("Verification queued…");
    await postTenantJson(`/tenant/remediation/program/${id}/verify`, apiKey, {});
    setMessage("Verify job started.");
    await load();
  }

  return (
    <div className="space-y-4">
      {velocity && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-subtle)] p-3">
            <p className="text-xl font-semibold text-white">{velocity.completionPct}%</p>
            <p className="text-xs text-[var(--muted)]">Completion</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] p-3">
            <p className="text-xl font-semibold text-white">{velocity.done}/{velocity.total}</p>
            <p className="text-xs text-[var(--muted)]">Done / total</p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] p-3">
            <p className="text-xl font-semibold text-white">{velocity.itemsPerWeek}</p>
            <p className="text-xs text-[var(--muted)]">Items / week</p>
          </div>
        </div>
      )}
      {message && <p className="text-sm text-[var(--muted)]">{message}</p>}
      <div className="space-y-2">
        {items.slice(0, 20).map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-strong)] p-3"
          >
            <div>
              <p className="font-medium text-white">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {item.sourceType} · {item.status}
                {item.owner ? ` · ${item.owner}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded bg-black text-xs text-white"
                value={item.status}
                onChange={(e) => updateStatus(item.id, e.target.value)}
              >
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
                <option value="accepted_risk">accepted_risk</option>
              </select>
              <button type="button" className="text-xs underline text-white" onClick={() => openPlaybook(item.id)}>
                Playbook
              </button>
              <button type="button" className="text-xs underline text-white" onClick={() => verify(item.id)}>
                Verify
              </button>
              <button
                type="button"
                className="text-xs underline text-emerald-400"
                onClick={() => {
                  setFlipItemId(item.id);
                  setActiveFlipJobId(null);
                }}
              >
                Flip
              </button>
            </div>
          </div>
        ))}
      </div>
      {flipItemId && (
        <CryptoFlipPanel
          apiKey={apiKey}
          programItemId={flipItemId}
          onJobStarted={(jobId) => setActiveFlipJobId(jobId)}
        />
      )}
      {activeFlipJobId && <FlipJobProgress apiKey={apiKey} jobId={activeFlipJobId} />}
      {playbook && (
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
          <p className="mb-2 font-medium text-white">Playbook</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--color-gray-300)]">
            {playbook.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
