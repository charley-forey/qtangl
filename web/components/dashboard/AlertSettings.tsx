"use client";

import { useEffect, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { fetchTenantJson, putTenantJson } from "@/lib/tenant-api";

type TenantSettings = {
  readinessDropThreshold: number;
  alertOnNewQuantumVulnerable: boolean;
  certExpiryDays: number;
  webhookSigningSecret: string;
};

export default function AlertSettings({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage: (msg: string) => void;
}) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTenantJson<{ settings: TenantSettings }>("/tenant/settings", apiKey)
      .then((payload) => setSettings(payload.settings))
      .catch(() => setSettings(null));
  }, [apiKey]);

  if (!settings) {
    return <p className="text-sm text-[var(--muted)]">Loading alert thresholds…</p>;
  }

  async function save() {
    setSaving(true);
    try {
      await putTenantJson("/tenant/settings", apiKey, settings);
      onMessage("Alert settings saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
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
          onChange={(e) =>
            setSettings({ ...settings, readinessDropThreshold: Number(e.target.value) })
          }
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-white">
        <input
          type="checkbox"
          checked={settings.alertOnNewQuantumVulnerable}
          onChange={(e) =>
            setSettings({ ...settings, alertOnNewQuantumVulnerable: e.target.checked })
          }
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
        onClick={save}
        className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
