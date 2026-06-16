"use client";

import { useEffect, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, postDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";
import { fetchTenantJson, putTenantJson } from "@/lib/tenant-api";

type TenantSettings = {
  readinessDropThreshold: number;
  alertOnNewQuantumVulnerable: boolean;
  certExpiryDays: number;
  webhookSigningSecret: string;
  benchmarkOptIn?: boolean;
  industry?: string;
  weeklyDigestEnabled?: boolean;
  weeklyDigestRecipients?: string[] | string;
  weeklyDigestDayOfWeek?: number;
};

export default function AlertSettings({
  apiKey,
  onMessage,
  bffMode = false,
}: {
  apiKey: string;
  onMessage: (msg: string) => void;
  bffMode?: boolean;
}) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [digestPreview, setDigestPreview] = useState<string | null>(null);
  const [digestHtml, setDigestHtml] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = bffMode
      ? fetchDashboardJson<{ settings: TenantSettings }>("/tenant/settings")
      : fetchTenantJson<{ settings: TenantSettings }>("/tenant/settings", apiKey);
    loadSettings
      .then((payload) => setSettings(payload.settings))
      .catch(() => setSettings(null));

    const loadPreview = bffMode
      ? postDashboardJson<{ digest?: { headline?: string; narrative?: string }; html?: string }>(
          "/tenant/dashboard/digest/preview",
          {}
        )
      : Promise.resolve(null);
    loadPreview
      .then((payload) => {
        if (!payload) return;
        setDigestPreview(payload.digest?.headline ?? payload.digest?.narrative ?? null);
        setDigestHtml(payload.html ?? null);
      })
      .catch(() => {
        setDigestPreview(null);
        setDigestHtml(null);
      });
  }, [apiKey, bffMode]);

  if (!settings) {
    return <p className="text-sm text-[var(--muted)]">Loading alert thresholds…</p>;
  }

  const recipientsValue = Array.isArray(settings.weeklyDigestRecipients)
    ? settings.weeklyDigestRecipients.join(", ")
    : (settings.weeklyDigestRecipients ?? "");

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        weeklyDigestRecipients: recipientsValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (bffMode) {
        await putDashboardJson("/tenant/settings", { settings: payload });
      } else {
        await putTenantJson("/tenant/settings", apiKey, payload);
      }
      onMessage("Alert settings saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function sendTestDigest() {
    const recipients = recipientsValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!recipients.length) {
      onMessage("Add digest recipients first.");
      return;
    }
    try {
      await postDashboardJson("/tenant/dashboard/digest/send-test", { recipients });
      onMessage("Test digest sent.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Test send failed.");
    }
  }

  return (
    <div className="space-y-4">
      <Eyebrow>Alert thresholds</Eyebrow>
      <label className="flex flex-col gap-1 text-sm text-white">
        Readiness drop threshold (points)
        <input
          type="number"
          min={1}
          max={50}
          value={settings.readinessDropThreshold}
          onChange={(e) => setSettings({ ...settings, readinessDropThreshold: Number(e.target.value) })}
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-white">
        <input
          type="checkbox"
          checked={settings.alertOnNewQuantumVulnerable}
          onChange={(e) => setSettings({ ...settings, alertOnNewQuantumVulnerable: e.target.checked })}
        />
        Alert on new quantum-vulnerable assets
      </label>
      <label className="flex flex-col gap-1 text-sm text-white">
        Certificate expiry warning (days)
        <input
          type="number"
          min={7}
          max={365}
          value={settings.certExpiryDays}
          onChange={(e) => setSettings({ ...settings, certExpiryDays: Number(e.target.value) })}
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2"
        />
      </label>
      <div className="border-t border-[var(--border-subtle)] pt-4">
        <Eyebrow>Weekly executive digest</Eyebrow>
        <label className="mt-3 flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={Boolean(settings.weeklyDigestEnabled)}
            onChange={(e) => setSettings({ ...settings, weeklyDigestEnabled: e.target.checked })}
          />
          Enable weekly digest email
        </label>
        <label className="mt-3 flex flex-col gap-1 text-sm text-white">
          Digest recipients (comma-separated emails)
          <input
            type="text"
            value={recipientsValue}
            onChange={(e) => setSettings({ ...settings, weeklyDigestRecipients: e.target.value })}
            placeholder="ciso@company.com, security@company.com"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2"
          />
        </label>
        {digestPreview ? (
          <p className="mt-3 text-xs text-[var(--color-gray-400)]">
            Preview: <span className="text-white">{digestPreview}</span>
          </p>
        ) : null}
        {digestHtml ? (
          <details className="mt-2 text-xs text-[var(--color-gray-500)]">
            <summary>HTML preview</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">{digestHtml.slice(0, 500)}…</pre>
          </details>
        ) : null}
        {bffMode ? (
          <button type="button" className="mt-3 text-xs text-sky-400 underline" onClick={() => void sendTestDigest()}>
            Send test digest
          </button>
        ) : null}
      </div>
      <div className="border-t border-[var(--border-subtle)] pt-4">
        <Eyebrow>Readiness Index (peer benchmarks)</Eyebrow>
        <label className="mt-3 flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={Boolean(settings.benchmarkOptIn)}
            onChange={(e) => setSettings({ ...settings, benchmarkOptIn: e.target.checked })}
          />
          Opt in to anonymized aggregate benchmarks (no PII)
        </label>
        <label className="mt-3 flex flex-col gap-1 text-sm text-white">
          Industry cohort
          <select
            value={settings.industry ?? "financial"}
            onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2"
          >
            <option value="financial">Financial services</option>
            <option value="healthcare">Healthcare</option>
            <option value="technology">Technology</option>
            <option value="government">Government</option>
            <option value="general">General</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm text-white">
        Webhook HMAC signing secret
        <input
          type="password"
          value={settings.webhookSigningSecret}
          onChange={(e) => setSettings({ ...settings, webhookSigningSecret: e.target.value })}
          placeholder="Optional — sent as X-Qtangl-Signature"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2"
        />
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
