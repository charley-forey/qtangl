"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { ccFlags } from "@/lib/cc-feature-flags";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type WarRoom = {
  id: string;
  title: string;
  status: "active" | "resolved";
  alertIds: string[];
  assignees: string[];
  shareToken?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function WarRoomPanel({
  canWrite = true,
  presetAlertIds = [],
}: {
  canWrite?: boolean;
  presetAlertIds?: string[];
}) {
  const [rooms, setRooms] = useState<WarRoom[]>([]);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ccFlags.warRoom) return;
    void fetchDashboardJson<WarRoom[]>("/tenant/war-rooms")
      .then(setRooms)
      .catch(() => setRooms([]));
  }, []);

  if (!ccFlags.warRoom) return null;

  async function create() {
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    try {
      const room = await postDashboardJson<WarRoom>("/tenant/war-rooms", {
        title: t,
        alertIds: presetAlertIds,
        assignees: [],
      });
      setRooms((prev) => [room, ...prev]);
      setTitle("");
      setCreating(false);
      trackDashboardEvent({ event: "cc_war_room_created", properties: { alertCount: presetAlertIds.length } });
    } catch {
      /* best-effort */
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card tone="panel" className="space-y-3">
      <div className="flex items-center justify-between">
        <Eyebrow>War rooms</Eyebrow>
        {canWrite ? (
          <button
            type="button"
            className="text-xs text-sky-400 hover:underline"
            onClick={() => setCreating((v) => !v)}
          >
            {creating ? "Cancel" : "New war room"}
          </button>
        ) : null}
      </div>
      <p className="text-[10px] text-[var(--color-gray-500)]">
        Group related alerts into a coordinated response with shared assignees.
      </p>
      {creating ? (
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="War room title"
            className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-xs text-white"
          />
          <Button type="button" size="sm" disabled={busy || !title.trim()} onClick={() => void create()}>
            {busy ? "…" : "Create"}
          </Button>
        </div>
      ) : null}
      {rooms.length === 0 ? (
        <p className="text-xs text-[var(--color-gray-500)]">No war rooms yet.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li key={room.id} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">{room.title}</span>
                <span
                  className={`text-[10px] uppercase tracking-wide ${
                    room.status === "active" ? "text-amber-200" : "text-emerald-300"
                  }`}
                >
                  {room.status}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-[var(--color-gray-500)]">
                {room.alertIds.length} alerts
                {room.assignees.length > 0 ? ` · ${room.assignees.join(", ")}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
