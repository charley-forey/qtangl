"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { useMonitorScenarioOptional } from "@/components/marketing/MonitorScenarioContext";
import { monitorPreviewWebhookV2 } from "@/lib/copy/readiness-demos";
import { trackEvent } from "@/lib/analytics";

type Tab = "slack" | "teams" | "json" | "siem";

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-500/20 text-red-200 border-red-500/40",
  medium: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  low: "bg-slate-500/20 text-slate-200 border-slate-500/40",
};

export default function MonitorAlertPreview() {
  const scenarioCtx = useMonitorScenarioOptional();
  const payload = scenarioCtx?.scenario.webhook ?? monitorPreviewWebhookV2;
  const slackMessage = scenarioCtx?.scenario.slackMessage ?? payload.message;
  const teamsMessage = scenarioCtx?.scenario.teamsMessage ?? payload.message;

  const [tab, setTab] = useState<Tab>("slack");
  const [copied, setCopied] = useState(false);

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    trackEvent("monitor_webhook_copied");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card tone="panel" className="rounded-[var(--radius-xl)] p-5 sm:p-6" id="alerts">
      <Eyebrow>Alert preview — Monitor tier</Eyebrow>
      <p className="mt-3 text-sm leading-7 text-[var(--color-gray-400)]">
        When a scheduled scan completes, Qtangl posts to Slack/Teams webhooks and sends structured{" "}
        <code className="text-white">qtangl-webhook-v2</code> payloads for SIEM/GRC ingestion.{" "}
        <a href="/docs/integrations/siem-webhook-v2" className="text-sky-400 underline">
          Webhook docs →
        </a>
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["slack", "Slack"],
            ["teams", "Microsoft Teams"],
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
        {tab === "json" ? (
          <button
            type="button"
            onClick={() => void copyJson()}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-sky-400 hover:text-sky-300"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-black/60 p-4">
        {tab === "slack" ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-gray-500)]">Incoming webhook</p>
            <div className="rounded-lg border border-[var(--border)] bg-[#1a1d21] p-4 font-sans text-sm text-[#d1d2d3]">
              <p className="font-semibold text-[#e8e8e8]">Qtangl Monitor</p>
              <p className="mt-2">{slackMessage}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {payload.alerts.map((alert) => (
                  <span
                    key={alert.code}
                    className={[
                      "rounded-full border px-2 py-0.5 text-[10px] uppercase",
                      SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.medium,
                    ].join(" ")}
                  >
                    {alert.severity}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--color-gray-500)]">
                {payload.targetDomain} · score {payload.readinessScore} ·{" "}
                <a href={payload.verifyUrl} className="text-sky-400 underline">
                  verify
                </a>
              </p>
            </div>
          </div>
        ) : null}

        {tab === "teams" ? (
          <div className="rounded-lg border border-[var(--border)] bg-[#201f1f] p-4 text-sm text-[#d1d2d3]">
            <p className="font-semibold text-white">Qtangl Monitor</p>
            <p className="mt-2">{teamsMessage}</p>
            <p className="mt-3 font-mono text-xs text-sky-300">{payload.verifyUrl}</p>
          </div>
        ) : null}

        {tab === "json" ? (
          <pre className="text-xs leading-6 text-emerald-200/90">
            {JSON.stringify(payload, null, 2)}
          </pre>
        ) : null}

        {tab === "siem" ? (
          <dl className="grid gap-3 text-sm">
            {[
              ["event", payload.event],
              ["scanId", payload.scanId],
              ["targetDomain", payload.targetDomain],
              ["readinessScore", String(payload.readinessScore)],
              ["readinessBand", payload.readinessBand],
              ["verifyUrl", payload.verifyUrl],
              ["alert.severity", payload.alerts[0]?.severity ?? ""],
              ["alert.code", payload.alerts[0]?.code ?? ""],
              ["scanDiff.readinessDelta", String(payload.scanDiff.readinessDelta)],
            ].map(([field, value]) => (
              <div
                key={field}
                className="grid grid-cols-[1fr_1.2fr] gap-2 border-b border-[var(--border-subtle)] pb-2"
              >
                <dt className="font-mono text-xs text-[var(--color-gray-500)]">{field}</dt>
                <dd className="break-all font-mono text-xs text-white">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </Card>
  );
}
