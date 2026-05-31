"use client";

import { useState } from "react";

import { postTenantJson } from "@/lib/tenant-api";

type RemediationItem = {
  id: string;
  title: string;
  severity: string;
};

type StatusRow = {
  remediationId: string;
  status: string;
};

const STATUSES = ["open", "in_progress", "done", "accepted_risk"] as const;

export default function RemediationBoard({
  apiKey,
  scanId,
  items,
  initialStatuses,
  jiraConfigured = false,
}: {
  apiKey: string;
  scanId: string;
  items: RemediationItem[];
  initialStatuses: StatusRow[];
  jiraConfigured?: boolean;
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const row of initialStatuses) {
      map[row.remediationId] = row.status;
    }
    return map;
  });
  const [pushMessage, setPushMessage] = useState<string | null>(null);

  const done = items.filter(
    (item) => statuses[item.id] === "done" || statuses[item.id] === "accepted_risk"
  ).length;
  const pct = items.length ? Math.round((100 * done) / items.length) : 100;

  async function updateStatus(remediationId: string, status: string) {
    setStatuses((prev) => ({ ...prev, [remediationId]: status }));
    await postTenantJson(`/tenant/scans/${scanId}/remediation`, apiKey, {
      remediationId,
      status,
    });
  }

  async function pushToJira(remediationId: string) {
    setPushMessage(null);
    try {
      const result = await postTenantJson<{ sent?: boolean; reason?: string }>(
        `/tenant/scans/${scanId}/integrations/push`,
        apiKey,
        { remediationId, provider: "jira" }
      );
      setPushMessage(result.sent ? "Ticket created in Jira." : `Push failed: ${result.reason ?? "unknown"}`);
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : "Push failed.");
    }
  }

  if (!items.length) {
    return <p className="text-sm text-[var(--color-gray-500)]">No remediation items.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-gray-300)]">Completion: {pct}%</p>
      {pushMessage ? <p className="text-xs text-[var(--color-gray-400)]">{pushMessage}</p> : null}
      {items.slice(0, 12).map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-2 rounded-lg border border-[var(--border-subtle)] p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm text-white">{item.title}</p>
            <p className="text-xs text-[var(--color-gray-500)]">{item.severity}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {jiraConfigured ? (
              <button
                type="button"
                className="text-xs text-white underline underline-offset-4"
                onClick={() => pushToJira(item.id)}
              >
                Push to Jira
              </button>
            ) : null}
            <select
              value={statuses[item.id] ?? "open"}
              onChange={(event) => updateStatus(item.id, event.target.value)}
              className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1 text-xs text-white"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
