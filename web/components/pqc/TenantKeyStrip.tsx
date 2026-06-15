"use client";

import { useEffect, useState } from "react";

import { qtanglApiBaseUrl } from "@/lib/api";
import { getStoredTenantApiKey, setStoredTenantApiKey } from "@/lib/tenant-api";

import { PqcCollapsibleSection } from "./ui";

type TenantKeyStripProps = {
  onKeyChange: (apiKey: string | null) => void;
};

export default function TenantKeyStrip({ onKeyChange }: TenantKeyStripProps) {
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredTenantApiKey();
    if (stored) {
      setSaved(stored);
      setDraft(stored);
      onKeyChange(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once from session storage
  }, []);

  function saveKey() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setStoredTenantApiKey(trimmed);
    setSaved(trimmed);
    onKeyChange(trimmed);
    window.dispatchEvent(new Event("qtangl-api-key-updated"));
  }

  function clearKey() {
    window.sessionStorage.removeItem("qtangl-dashboard-api-key");
    setDraft("");
    setSaved(null);
    onKeyChange(null);
    window.dispatchEvent(new Event("qtangl-api-key-updated"));
  }

  return (
    <PqcCollapsibleSection title={saved ? "Tenant API key connected" : "Connect tenant API key (optional)"}>
      <p className="text-sm text-[var(--color-gray-400)]">
        Paste the key from your pilot welcome email to load scan history on the dashboard. Stored in this
        browser session only.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="qtangl_..."
          className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={saveKey}
          className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          Save key
        </button>
        {saved ? (
          <button
            type="button"
            onClick={clearKey}
            className="rounded-full border border-[var(--border)] px-5 py-2 text-sm text-[var(--color-gray-300)] hover:border-[var(--border-strong)]"
          >
            Clear
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-[var(--color-gray-500)]">API base: {qtanglApiBaseUrl}</p>
    </PqcCollapsibleSection>
  );
}
