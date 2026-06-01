"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import {
  monitorPreviewSlackMessage,
  monitorPreviewWebhookV2,
} from "@/lib/copy/readiness-demos";

type Tab = "slack" | "json" | "siem";

export default function MonitorAlertPreview() {
  const [tab, setTab] = useState<Tab>("slack");

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)]">
      <Eyebrow>Alert preview — Monitor tier</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        When a scheduled scan completes, Qtangl posts to Slack webhooks and sends structured{" "}
        <code className="text-white">qtangl-webhook-v2</code> payloads for SIEM/GRC ingestion.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["slack", "Slack message"],
            ["json", "Webhook v2 JSON"],
            ["siem", "SIEM field map"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              tab === id
                ? "border-white/30 bg-white/10 text-white"
                : "border-[var(--border)] text-[var(--color-gray-400)] hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-black/60 p-4">
        {tab === "slack" ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Incoming webhook</p>
            <div className="rounded-lg border border-[var(--border)] bg-[#1a1d21] p-4 font-sans text-sm text-[#d1d2d3]">
              <p className="font-semibold text-[#e8e8e8]">Qtangl Monitor</p>
              <p className="mt-2">{monitorPreviewSlackMessage}</p>
              <p className="mt-3 text-xs text-[var(--color-gray-500)]">
                api.example.com · score 61.8 · 2 new Q-vulnerable endpoints
              </p>
            </div>
          </div>
        ) : null}

        {tab === "json" ? (
          <pre className="text-xs leading-6 text-emerald-200/90">
            {JSON.stringify(monitorPreviewWebhookV2, null, 2)}
          </pre>
        ) : null}

        {tab === "siem" ? (
          <dl className="grid gap-3 text-sm">
            {[
              ["event", monitorPreviewWebhookV2.event],
              ["scanId", monitorPreviewWebhookV2.scanId],
              ["targetDomain", monitorPreviewWebhookV2.targetDomain],
              ["readinessScore", String(monitorPreviewWebhookV2.readinessScore)],
              ["readinessBand", monitorPreviewWebhookV2.readinessBand],
              ["alert.severity", monitorPreviewWebhookV2.alerts[0]?.severity ?? ""],
              ["alert.code", monitorPreviewWebhookV2.alerts[0]?.code ?? ""],
              ["scanDiff.readinessDelta", String(monitorPreviewWebhookV2.scanDiff.readinessDelta)],
            ].map(([field, value]) => (
              <div key={field} className="grid grid-cols-[1fr_1.2fr] gap-2 border-b border-[var(--border-subtle)] pb-2">
                <dt className="font-mono text-xs text-[var(--color-gray-500)]">{field}</dt>
                <dd className="font-mono text-xs text-white">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </Card>
  );
}
