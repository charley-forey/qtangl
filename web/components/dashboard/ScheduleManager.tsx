"use client";

import { useCallback, useEffect, useState } from "react";

import { qtanglApiBaseUrl } from "@/lib/api";
import { fetchTenantJson, patchTenantJson, type ScheduledScan } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";

type ScheduleRun = {
  id: string;
  scanId: string | null;
  status: string;
  createdAt: string | null;
};

export default function ScheduleManager({
  apiKey,
  schedules,
  onRefresh,
  onMessage,
}: {
  apiKey: string;
  schedules: ScheduledScan[];
  onRefresh: () => void;
  onMessage: (msg: string) => void;
}) {
  const [runsBySchedule, setRunsBySchedule] = useState<Record<string, ScheduleRun[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cadenceHours, setCadenceHours] = useState(168);
  const [notifyEmail, setNotifyEmail] = useState("");

  const loadRuns = useCallback(
    async (scheduleId: string) => {
      try {
        const payload = await fetchTenantJson<{ runs: ScheduleRun[] }>(
          `/tenant/schedules/${scheduleId}/runs`,
          apiKey
        );
        setRunsBySchedule((prev) => ({ ...prev, [scheduleId]: payload.runs }));
      } catch {
        /* optional */
      }
    },
    [apiKey]
  );

  useEffect(() => {
    schedules.forEach((s) => loadRuns(s.id));
  }, [schedules, loadRuns]);

  async function savePatch(scheduleId: string) {
    try {
      await patchTenantJson(`/tenant/schedules/${scheduleId}`, apiKey, {
        cadenceHours,
        notifyEmail: notifyEmail || null,
      });
      onMessage("Schedule updated.");
      setEditingId(null);
      onRefresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Update failed.");
    }
  }

  async function deleteSchedule(scheduleId: string) {
    try {
      const response = await fetch(`${qtanglApiBaseUrl}/tenant/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Delete failed.");
      }
      onMessage("Schedule deleted.");
      onRefresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  if (!schedules.length) {
    return <p className="text-sm text-[var(--muted)]">No active schedules. Create one below.</p>;
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="rounded-2xl border border-[var(--border-strong)] bg-black/40 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-white">
                {schedule.jobType === "cloud_pull"
                  ? `Cloud CBOM · ${schedule.integrationProvider ?? "cloud"}`
                  : schedule.jobType === "host_fleet_scan"
                    ? `Host fleet · ${schedule.target ?? "all"}`
                    : schedule.jobType === "code_scan"
                      ? `Code scan · ${schedule.target ?? "repo"}`
                      : schedule.jobType === "binary_scan"
                        ? `Image scan · ${schedule.target ?? "image"}`
                        : schedule.target || schedule.scenarioId}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Every {schedule.cadenceHours}h · next{" "}
                {schedule.nextRunAt ? formatUtcDateTime(schedule.nextRunAt) : "—"}
                {schedule.lastDriftSnapshotId ? (
                  <> · drift snap {schedule.lastDriftSnapshotId.slice(0, 12)}…</>
                ) : null}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="text-xs text-white underline"
                onClick={() => {
                  setEditingId(schedule.id);
                  setCadenceHours(schedule.cadenceHours);
                  setNotifyEmail(schedule.notifyEmail ?? "");
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-xs text-red-300 underline"
                onClick={() => void deleteSchedule(schedule.id)}
              >
                Delete
              </button>
            </div>
          </div>
          {editingId === schedule.id ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <input
                type="number"
                min={1}
                value={cadenceHours}
                onChange={(e) => setCadenceHours(Number(e.target.value))}
                className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white"
              />
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Alert email"
                className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white sm:col-span-2"
              />
              <button
                type="button"
                onClick={() => savePatch(schedule.id)}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black"
              >
                Save
              </button>
            </div>
          ) : null}
          {(runsBySchedule[schedule.id] ?? []).length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-[var(--muted)]">
              {(runsBySchedule[schedule.id] ?? []).slice(0, 5).map((run) => (
                <li key={run.id}>
                  {run.status} · {run.scanId ?? "—"} ·{" "}
                  {run.createdAt ? formatUtcDateTime(run.createdAt) : "—"}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
