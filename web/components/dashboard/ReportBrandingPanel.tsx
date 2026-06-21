"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, putDashboardJson } from "@/lib/dashboard-bff";

type ReportBranding = {
  companyName?: string;
  logoUrl?: string;
  primaryColor?: string;
};

export default function ReportBrandingPanel({
  onMessage,
  onSettingsChange,
}: {
  onMessage: (message: string) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
}) {
  const [branding, setBranding] = useState<ReportBranding>({
    companyName: "",
    logoUrl: "",
    primaryColor: "",
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void fetchDashboardJson<{ settings: Record<string, unknown> }>("/tenant/settings")
      .then((payload) => {
        const current = (payload.settings?.reportBranding as ReportBranding | undefined) ?? {};
        setBranding({
          companyName: current.companyName ?? "",
          logoUrl: current.logoUrl ?? "",
          primaryColor: current.primaryColor ?? "",
        });
        setLoaded(true);
      })
      .catch(() => onMessage("Failed to load report branding."));
  }, [onMessage]);

  async function saveBranding() {
    setSaving(true);
    try {
      const payload = await fetchDashboardJson<{ settings: Record<string, unknown> }>("/tenant/settings");
      const next = {
        ...payload.settings,
        reportBranding: {
          companyName: branding.companyName?.trim() ?? "",
          logoUrl: branding.logoUrl?.trim() ?? "",
          primaryColor: branding.primaryColor?.trim() ?? "",
        },
      };
      await putDashboardJson("/tenant/settings", { settings: next });
      onSettingsChange(next);
      onMessage("Report branding saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Failed to save report branding.");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return null;
  }

  return (
    <Card tone="panel">
      <Eyebrow>Report branding</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Customize PDF exports with your company name and accent color. Logo URL support is reserved for white-label
        pilots.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={branding.companyName ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, companyName: event.target.value }))}
          placeholder="Company name on cover"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <input
          type="text"
          value={branding.primaryColor ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, primaryColor: event.target.value }))}
          placeholder="#38bdf8 accent color"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <input
          type="url"
          value={branding.logoUrl ?? ""}
          onChange={(event) => setBranding((prev) => ({ ...prev, logoUrl: event.target.value }))}
          placeholder="Logo URL (optional)"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white sm:col-span-2"
        />
      </div>
      <button
        type="button"
        disabled={saving}
        className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        onClick={() => void saveBranding()}
      >
        {saving ? "Saving…" : "Save report branding"}
      </button>
    </Card>
  );
}
