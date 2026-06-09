"use client";

import { useCallback, useEffect, useState } from "react";

import { listAgents, revokeAgents, triggerHostScan } from "@/lib/discovery";

const LATEST_SENSOR = "0.1.0";

type Agent = {
  agentId: string;
  hostname: string;
  os: string;
  sensorVersion: string;
  status: string;
  lastSeenAt: string | null;
  findingsCount: number;
};

type AgentFleetTableProps = {
  apiKey: string;
};

export default function AgentFleetTable({ apiKey }: AgentFleetTableProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await listAgents(apiKey);
      setAgents(res.agents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load agents");
    }
  }, [apiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleRevoke() {
    if (selected.size === 0) return;
    const res = await revokeAgents(apiKey, [...selected]);
    setMessage(`Revoked ${res.revoked} agent(s)`);
    setSelected(new Set());
    void load();
  }

  async function handleFleetScan() {
    await triggerHostScan(apiKey);
    setMessage("Host fleet scan enqueued");
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (agents.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No agents enrolled yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary text-xs" disabled={selected.size === 0} onClick={handleRevoke}>
          Revoke selected ({selected.size})
        </button>
        <button type="button" className="btn btn-secondary text-xs" onClick={handleFleetScan}>
          Trigger fleet scan
        </button>
      </div>
      {message && <p className="text-xs text-[var(--muted)]">{message}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted)]">
              <th className="py-2 pr-2" />
              <th className="py-2 pr-4">Hostname</th>
              <th className="py-2 pr-4">OS</th>
              <th className="py-2 pr-4">Version</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Findings</th>
              <th className="py-2">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => {
              const drift = a.sensorVersion && a.sensorVersion !== LATEST_SENSOR;
              return (
                <tr key={a.agentId} className="border-b border-[var(--border)]/50">
                  <td className="py-2 pr-2">
                    <input type="checkbox" checked={selected.has(a.agentId)} onChange={() => toggle(a.agentId)} />
                  </td>
                  <td className="py-2 pr-4 font-medium">
                    <a href={`/assess?host=${encodeURIComponent(a.hostname)}`} className="hover:underline">
                      {a.hostname}
                    </a>
                  </td>
                  <td className="py-2 pr-4">{a.os}</td>
                  <td className={`py-2 pr-4 ${drift ? "text-amber-400" : ""}`}>
                    {a.sensorVersion}
                    {drift && <span className="ml-1 text-[10px]">(update)</span>}
                  </td>
                  <td className="py-2 pr-4">{a.status}</td>
                  <td className="py-2 pr-4">{a.findingsCount}</td>
                  <td className="py-2">{a.lastSeenAt ? new Date(a.lastSeenAt).toLocaleString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
