"use client";

import { useCallback, useEffect, useState } from "react";

import { useQtanglClient } from "@qtangl/sdk-react";

import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";
import { type ScheduledScan } from "@/lib/tenant-api";
import { formatUtcDateTime } from "@/lib/format";

type ScheduleRun = {
  id: string;
  scanId: string | null;
  status: string;
  createdAt: string | null;
};

export default function ScheduleManager({
  schedules,
  onRefresh,
  onMessage,
}: {
  schedules: ScheduledScan[];
  onRefresh: () => void;
  onMessage: (msg: string) => void;
}) {
  const client = useQtanglClient();
  const [runsBySchedule, setRunsBySchedule] = useState<Record<string, ScheduleRun[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cadenceHours, setCadenceHours] = useState(168);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [createTarget, setCreateTarget] = useState("");
  const [creating, setCreating] = useState(false);

  const loadRuns = useCallback(
    async (scheduleId: string) => {
      try {
        const payload = await client.monitor.scheduleRuns(scheduleId);
        setRunsBySchedule((prev) => ({
          ...prev,
          [scheduleId]: (payload.runs as ScheduleRun[] | undefined) ?? [],
        }));
      } catch {
        /* optional */
      }
    },
    [client]
  );

  useEffect(() => {
    schedules.forEach((s) => loadRuns(s.id));
  }, [schedules, loadRuns]);

  async function savePatch(scheduleId: string) {
    try {
      await client.monitor.patchSchedule(scheduleId, {
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
      await client.monitor.deleteSchedule(scheduleId);
      onMessage("Schedule deleted.");
      onRefresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  async function createSchedule() {
    if (!createTarget.trim()) {
      onMessage("Enter a target domain for the schedule.");
      return;
    }
    setCreating(true);
    try {
      await postDashboardJson("/tenant/schedules", {
        scenarioId: "production-baseline",
        target: createTarget.trim(),
        cadenceHours,
        notifyEmail: notifyEmail || null,
        jobType: "scan",
      });
      onMessage("Schedule created.");
      setCreateTarget("");
      onRefresh();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Create failed.");
    } finally {
      setCreating(false);
    }
  }

  if (!schedules.length) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--muted)]">No active schedules yet.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={createTarget}
            onChange={(e) => setCreateTarget(e.target.value)}
            placeholder="Target domain"
            className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white sm:col-span-2"
          />
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
            placeholder="Alert email (optional)"
            className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white sm:col-span-2"
          />
          <button
            type="button"
            disabled={creating}
            onClick={() => void createSchedule()}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black disabled:opacity-50"
          >
            Create schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour="schedule-manager">
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
      <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-4">
        <p className="text-xs text-[var(--muted)]">Create schedule</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={createTarget}
            onChange={(e) => setCreateTarget(e.target.value)}
            placeholder="Target domain"
            className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white sm:col-span-2"
          />
          <input
            type="number"
            min={1}
            value={cadenceHours}
            onChange={(e) => setCadenceHours(Number(e.target.value))}
            className="rounded-full border border-[var(--border-strong)] bg-black px-3 py-1.5 text-sm text-white"
          />
          <button
            type="button"
            disabled={creating}
            onClick={() => void createSchedule()}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black disabled:opacity-50 sm:col-span-3 sm:w-fit"
          >
            Add schedule
          </button>
        </div>
      </div>
    </div>
  );
}
