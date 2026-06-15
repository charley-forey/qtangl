"use client";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { legacyKeyClientEnabled } from "@/lib/dashboard-bff";
import { qtanglApiBaseUrl } from "@/lib/api";

export default function DashboardAdvancedKeyPanel({
  apiKey,
  loading,
  onConnect,
  onChange,
  hidden,
}: {
  apiKey: string;
  loading: boolean;
  onConnect: () => void;
  onChange: (value: string) => void;
  hidden?: boolean;
}) {
  if (hidden || !legacyKeyClientEnabled()) {
    return null;
  }

  return (
    <Card tone="ghost" className="border border-[var(--border-subtle)]" id="dashboard-advanced-key">
      <Eyebrow>Advanced — automation API key</Eyebrow>
      <p className="mt-3 text-sm text-[var(--color-gray-400)]">
        For CI/CD and automation only. Human access should use Sign in above. Stored in this browser
        session only.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={apiKey}
          onChange={(event) => onChange(event.target.value)}
          placeholder="qtangl_..."
          className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <button
          type="button"
          disabled={!apiKey || loading}
          onClick={onConnect}
          className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? "Connecting…" : "Connect key"}
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--color-gray-500)]">API base: {qtanglApiBaseUrl}</p>
    </Card>
  );
}
