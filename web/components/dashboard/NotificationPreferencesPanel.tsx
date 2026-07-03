"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type NotificationPreferences = {
  channels: Record<string, boolean>;
  digestCadenceHours: number;
  quietHoursStart?: number | null;
  quietHoursEnd?: number | null;
  minSeverity: string;
  pushEnabled: boolean;
};

const DEFAULTS: NotificationPreferences = {
  channels: { email: true, slack: false, webhook: false },
  digestCadenceHours: 24,
  quietHoursStart: null,
  quietHoursEnd: null,
  minSeverity: "medium",
  pushEnabled: false,
};

const CHANNELS = ["email", "slack", "webhook"] as const;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export default function NotificationPreferencesPanel({
  canWrite = true,
  onMessage,
}: {
  canWrite?: boolean;
  onMessage?: (message: string) => void;
}) {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchDashboardJson<NotificationPreferences>("/tenant/notification-preferences")
      .then((data) => setPrefs({ ...DEFAULTS, ...data, channels: { ...DEFAULTS.channels, ...(data.channels ?? {}) } }))
      .catch(() => setPrefs(DEFAULTS));
  }, []);

  if (!prefs) return null;

  function update(patch: Partial<NotificationPreferences>) {
    setPrefs((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function save() {
    if (!prefs) return;
    setBusy(true);
    try {
      await putDashboardJson("/tenant/notification-preferences", prefs);
      trackDashboardEvent({ event: "cc_notification_prefs_saved", properties: { minSeverity: prefs.minSeverity } });
      onMessage?.("Notification preferences saved.");
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Could not save preferences.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card tone="panel" className="space-y-4">
      <Eyebrow>Notification preferences</Eyebrow>
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Channels</p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((channel) => (
            <label key={channel} className="inline-flex items-center gap-2 text-xs text-white">
              <input
                type="checkbox"
                disabled={!canWrite}
                checked={Boolean(prefs.channels[channel])}
                onChange={(e) => update({ channels: { ...prefs.channels, [channel]: e.target.checked } })}
              />
              {channel}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs text-[var(--color-gray-400)]">
          Minimum severity
          <select
            disabled={!canWrite}
            value={prefs.minSeverity}
            onChange={(e) => update({ minSeverity: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-white"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[var(--color-gray-400)]">
          Digest cadence (hours)
          <input
            type="number"
            min={1}
            max={720}
            disabled={!canWrite}
            value={prefs.digestCadenceHours}
            onChange={(e) => update({ digestCadenceHours: Number(e.target.value) || 24 })}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-white"
          />
        </label>
        <label className="text-xs text-[var(--color-gray-400)]">
          Quiet hours start
          <input
            type="number"
            min={0}
            max={23}
            disabled={!canWrite}
            value={prefs.quietHoursStart ?? ""}
            onChange={(e) => update({ quietHoursStart: e.target.value === "" ? null : Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-white"
          />
        </label>
        <label className="text-xs text-[var(--color-gray-400)]">
          Quiet hours end
          <input
            type="number"
            min={0}
            max={23}
            disabled={!canWrite}
            value={prefs.quietHoursEnd ?? ""}
            onChange={(e) => update({ quietHoursEnd: e.target.value === "" ? null : Number(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-white"
          />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-xs text-white">
        <input
          type="checkbox"
          disabled={!canWrite}
          checked={prefs.pushEnabled}
          onChange={(e) => update({ pushEnabled: e.target.checked })}
        />
        Enable push notifications
      </label>
      {canWrite ? (
        <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
          {busy ? "Saving…" : "Save preferences"}
        </Button>
      ) : null}
    </Card>
  );
}
