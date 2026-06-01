"use client";

import { useState } from "react";

import RemediationCopilotDrawer from "@/components/dashboard/RemediationCopilotDrawer";
import { postTenantJson } from "@/lib/tenant-api";

type RemediationItem = {
  id: string;
  title: string;
  severity: string;
};

type StatusRow = {
  remediationId: string;
  status: string;
  owner?: string | null;
  notes?: string | null;
  targetDate?: string | null;
  verifyScanId?: string | null;
};

type VerifyResult = {
  verified: boolean;
  verifyScanId?: string | null;
  beforeStatus?: string;
  afterStatus?: string;
  reason?: string;
};

const STATUSES = ["open", "in_progress", "done", "accepted_risk"] as const;

const PLAYBOOK = [
  "Inventory affected endpoints and key lineage.",
  "Select PQC algorithm (ML-KEM / ML-DSA) per vendor guidance.",
  "Stage rollout with canary and interoperability testing.",
  "Re-scan and attach verification evidence.",
];

export default function RemediationBoard({
  apiKey,
  scanId,
  items,
  initialStatuses,
  jiraConfigured = false,
  allScans = [],
}: {
  apiKey: string;
  scanId: string;
  items: RemediationItem[];
  initialStatuses: StatusRow[];
  jiraConfigured?: boolean;
  allScans?: Array<{ scanId: string; label: string }>;
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const row of initialStatuses) {
      map[row.remediationId] = row.status;
    }
    return map;
  });
  const [owners, setOwners] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const row of initialStatuses) {
      if (row.owner) {
        map[row.remediationId] = row.owner;
      }
    }
    return map;
  });
  const [targetDates, setTargetDates] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const row of initialStatuses) {
      if (row.targetDate) {
        map[row.remediationId] = row.targetDate.slice(0, 10);
      }
    }
    return map;
  });
  const [verifyScanId, setVerifyScanId] = useState(
    allScans.find((s) => s.scanId !== scanId)?.scanId ?? ""
  );
  const [verifyResults, setVerifyResults] = useState<Record<string, VerifyResult>>(() => {
    const map: Record<string, VerifyResult> = {};
    for (const row of initialStatuses) {
      if (row.verifyScanId) {
        map[row.remediationId] = {
          verified: row.status === "done",
          verifyScanId: row.verifyScanId,
        };
      }
    }
    return map;
  });
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [expandedPlaybook, setExpandedPlaybook] = useState<string | null>(null);

  const done = items.filter(
    (item) => statuses[item.id] === "done" || statuses[item.id] === "accepted_risk"
  ).length;
  const pct = items.length ? Math.round((100 * done) / items.length) : 100;

  async function persist(
    remediationId: string,
    status: string,
    owner?: string,
    targetDate?: string
  ) {
    await postTenantJson(`/tenant/scans/${scanId}/remediation`, apiKey, {
      remediationId,
      status,
      owner: owner || null,
      targetDate: targetDate ? `${targetDate}T00:00:00Z` : null,
    });
  }

  async function updateStatus(remediationId: string, status: string) {
    setStatuses((prev) => ({ ...prev, [remediationId]: status }));
    await persist(remediationId, status, owners[remediationId], targetDates[remediationId]);
  }

  async function updateOwner(remediationId: string, owner: string) {
    setOwners((prev) => ({ ...prev, [remediationId]: owner }));
    await persist(remediationId, statuses[remediationId] ?? "open", owner, targetDates[remediationId]);
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

  async function verifyFix(remediationId: string) {
    if (!verifyScanId) {
      setPushMessage("Select a verification scan first.");
      return;
    }
    setVerifyingId(remediationId);
    setPushMessage(null);
    try {
      const result = await postTenantJson<VerifyResult>(
        `/tenant/scans/${scanId}/remediation/verify`,
        apiKey,
        { remediationId, verifyScanId }
      );
      setVerifyResults((prev) => ({
        ...prev,
        [remediationId]: { ...result, verifyScanId: result.verifyScanId ?? verifyScanId },
      }));
      if (result.verified) {
        setStatuses((prev) => ({ ...prev, [remediationId]: "done" }));
      }
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : "Verify failed.");
    } finally {
      setVerifyingId(null);
    }
  }

  if (!items.length) {
    return <p className="text-sm text-[var(--color-gray-500)]">No remediation items.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-gray-300)]">Completion: {pct}%</p>
      {allScans.length > 1 ? (
        <label className="flex flex-col gap-1 text-xs text-[var(--color-gray-400)]">
          Verification scan (re-scan after fix)
          <select
            value={verifyScanId}
            onChange={(e) => setVerifyScanId(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-black px-3 py-1.5 text-sm text-white"
          >
            <option value="">Select scan…</option>
            {allScans
              .filter((s) => s.scanId !== scanId)
              .map((s) => (
                <option key={s.scanId} value={s.scanId}>
                  {s.label}
                </option>
              ))}
          </select>
        </label>
      ) : null}
      {pushMessage ? <p className="text-xs text-[var(--color-gray-400)]">{pushMessage}</p> : null}
      {items.slice(0, 10).map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-lg border border-[var(--border-subtle)] p-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-white">{item.title}</p>
              <p className="text-xs text-[var(--color-gray-500)]">{item.severity}</p>
              <RemediationCopilotDrawer apiKey={apiKey} finding={item} />
              <button
                type="button"
                className="mt-1 text-xs text-white underline"
                onClick={() =>
                  setExpandedPlaybook(expandedPlaybook === item.id ? null : item.id)
                }
              >
                {expandedPlaybook === item.id ? "Hide playbook" : "Playbook"}
              </button>
              {expandedPlaybook === item.id ? (
                <ol className="mt-2 list-decimal pl-4 text-xs text-[var(--color-gray-400)]">
                  {PLAYBOOK.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : null}
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
              {verifyScanId ? (
                <button
                  type="button"
                  disabled={verifyingId === item.id}
                  className="text-xs text-emerald-300 underline underline-offset-4 disabled:opacity-50"
                  onClick={() => verifyFix(item.id)}
                >
                  {verifyingId === item.id ? "Verifying…" : "Verify fix"}
                </button>
              ) : null}
              <select
                value={statuses[item.id] ?? "open"}
                onChange={(event) => updateStatus(item.id, event.target.value)}
                className="rounded-lg border border-[var(--border-subtle)] bg-black px-2 py-1 text-xs text-white"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={owners[item.id] ?? ""}
              onChange={(e) => updateOwner(item.id, e.target.value)}
              onBlur={(e) => updateOwner(item.id, e.target.value)}
              placeholder="Owner"
              className="rounded-full border border-[var(--border-subtle)] bg-black px-3 py-1 text-xs text-white"
            />
            <input
              type="date"
              value={targetDates[item.id] ?? ""}
              onChange={(e) => {
                setTargetDates((prev) => ({ ...prev, [item.id]: e.target.value }));
                persist(item.id, statuses[item.id] ?? "open", owners[item.id], e.target.value);
              }}
              className="rounded-full border border-[var(--border-subtle)] bg-black px-3 py-1 text-xs text-white"
            />
          </div>
          {verifyResults[item.id] ? (
            <VerificationEvidence result={verifyResults[item.id]!} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function VerificationEvidence({ result }: { result: VerifyResult }) {
  if (!result.verified) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
        Not verified{result.reason ? ` — ${result.reason.replace(/_/g, " ")}` : "."} Re-scan the same target
        after deploying the fix, then verify again.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
      <span className="font-semibold">Verified ✓</span>
      {result.beforeStatus && result.afterStatus ? (
        <span className="text-emerald-300/90">
          {result.beforeStatus} → {result.afterStatus}
        </span>
      ) : null}
      {result.verifyScanId ? (
        <a
          href={`/verify?scanId=${encodeURIComponent(result.verifyScanId)}`}
          target="_blank"
          rel="noreferrer"
          className="text-white underline underline-offset-4"
        >
          View signed evidence
        </a>
      ) : null}
    </div>
  );
}
