"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";

type PortalBranding = {
  headerText?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  partnerDisplayName?: string;
};

export default function PortalAppearancePanel({
  onMessage,
  onSettingsChange,
}: {
  onMessage: (message: string) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
}) {
  const [branding, setBranding] = useState<PortalBranding>({
    headerText: "",
    logoUrl: "",
    primaryColor: "",
    accentColor: "",
    partnerDisplayName: "",
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetchDashboardJson<{ settings: Record<string, unknown> }>("/tenant/settings")
      .then((payload) => {
        const current = (payload.settings?.portalBranding as PortalBranding | undefined) ?? {};
        setBranding({
          headerText: current.headerText ?? "",
          logoUrl: current.logoUrl ?? "",
          primaryColor: current.primaryColor ?? "",
          accentColor: current.accentColor ?? "",
          partnerDisplayName: current.partnerDisplayName ?? "",
        });
        setLoaded(true);
      })
      .catch(() => onMessage("Failed to load portal appearance."));
  }, [onMessage]);

  async function saveBranding() {
    setSaving(true);
    try {
      const payload = await fetchDashboardJson<{ settings: Record<string, unknown> }>("/tenant/settings");
      const next = {
        ...payload.settings,
        portalBranding: {
          headerText: branding.headerText?.trim() ?? "",
          logoUrl: branding.logoUrl?.trim() ?? "",
          primaryColor: branding.primaryColor?.trim() ?? "",
          accentColor: branding.accentColor?.trim() ?? "",
          partnerDisplayName: branding.partnerDisplayName?.trim() ?? "",
        },
      };
      await putDashboardJson("/tenant/settings", { settings: next });
      onSettingsChange(next);
      onMessage("Portal appearance saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Failed to save portal appearance.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return null;
  }

  return (
    <Card tone="panel">
      <Eyebrow>Portal appearance</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        White-label the dashboard with partner colors and header text. Applies as CSS variables across the workspace.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={branding.headerText ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, headerText: event.target.value }))}
          placeholder="Header text"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white sm:col-span-2"
        />
        <input
          type="text"
          value={branding.partnerDisplayName ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, partnerDisplayName: event.target.value }))}
          placeholder="Partner display name"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <input
          type="url"
          value={branding.logoUrl ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, logoUrl: event.target.value }))}
          placeholder="Logo URL (HTTPS)"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <input
          type="text"
          value={branding.primaryColor ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, primaryColor: event.target.value }))}
          placeholder="Primary color (#hex)"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <input
          type="text"
          value={branding.accentColor ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, accentColor: event.target.value }))}
          placeholder="Accent color (#hex)"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
      </div>
      <button
        type="button"
        disabled={saving}
        className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        onClick={() => void saveBranding()}
      >
        {saving ? "Saving…" : "Save portal appearance"}
      </button>
    </Card>
  );
}
