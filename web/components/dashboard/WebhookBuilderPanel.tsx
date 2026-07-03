"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { postDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

const EVENT_OPTIONS = [
  { id: "scan.complete", label: "Scan complete", sample: { scanId: "scan_123", readinessScore: 72 } },
  { id: "report.verified", label: "Report verified", sample: { scanId: "scan_123", verified: true } },
  { id: "alert.fired", label: "Alert fired", sample: { alertId: "alert_9", severity: "high" } },
  { id: "drift.detected", label: "Drift detected", sample: { scanId: "scan_123", delta: -4.2 } },
] as const;

export default function WebhookBuilderPanel({
  canWrite = true,
  onMessage,
}: {
  canWrite?: boolean;
  onMessage?: (message: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["scan.complete"]);
  const [busy, setBusy] = useState(false);

  const samplePayload = useMemo(() => {
    const merged = EVENT_OPTIONS.filter((e) => events.includes(e.id)).reduce<Record<string, unknown>>(
      (acc, e) => ({ ...acc, ...e.sample }),
      {}
    );
    return JSON.stringify({ event: events[0] ?? "scan.complete", data: merged }, null, 2);
  }, [events]);

  function toggle(eventId: string) {
    setEvents((prev) => (prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]));
  }

  async function create() {
    if (!url.trim() || events.length === 0) return;
    setBusy(true);
    try {
      await postDashboardJson("/tenant/webhooks", { url: url.trim(), events });
      trackDashboardEvent({ event: "cc_webhook_saved", properties: { eventCount: events.length } });
      onMessage?.("Webhook created — a test delivery is queued.");
      setUrl("");
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Could not create webhook.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card tone="panel" className="space-y-4">
      <Eyebrow>Webhook builder</Eyebrow>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-xs text-[var(--color-gray-400)]">
            Endpoint URL
            <input
              type="url"
              disabled={!canWrite}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://hooks.example.com/qtangl"
              className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-black/60 px-3 py-2 text-white"
            />
          </label>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Trigger events</p>
            <div className="mt-2 space-y-1">
              {EVENT_OPTIONS.map((event) => (
                <label key={event.id} className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    disabled={!canWrite}
                    checked={events.includes(event.id)}
                    onChange={() => toggle(event.id)}
                  />
                  {event.label}
                  <span className="text-[10px] text-[var(--color-gray-500)]">{event.id}</span>
                </label>
              ))}
            </div>
          </div>
          {canWrite ? (
            <Button type="button" size="sm" disabled={busy || !url.trim() || events.length === 0} onClick={() => void create()}>
              {busy ? "Creating…" : "Create webhook"}
            </Button>
          ) : null}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">Sample payload</p>
          <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-[var(--border-subtle)] bg-black/60 p-3 font-mono text-[10px] text-emerald-200">
            {samplePayload}
          </pre>
        </div>
      </div>
    </Card>
  );
}
