"use client";

import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";
import { fetchTenantJson, postTenantJson } from "@/lib/tenant-api";

type ClmProvider = "digicert" | "appviewx" | "entrust";

type Integration = {
  id: string;
  provider: string;
  configured: boolean;
  config: Record<string, string>;
};

const CLM_PROVIDERS: { value: ClmProvider; label: string }[] = [
  { value: "digicert", label: "DigiCert" },
  { value: "appviewx", label: "AppViewX" },
  { value: "entrust", label: "Entrust" },
];

function clmIntegrationProvider(provider: ClmProvider): string {
  return `clm-${provider}`;
}

function clmPullPath(provider: ClmProvider): string {
  return provider === "digicert"
    ? `${qtanglApiBaseUrl}/pqc/cbom/pull/digicert`
    : `${qtanglApiBaseUrl}/pqc/cbom/pull/clm-${provider}`;
}

export default function ClmIntegrationPanel({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage?: (message: string) => void;
}) {
  const [provider, setProvider] = useState<ClmProvider>("digicert");
  const [apiKeyField, setApiKeyField] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      const payload = await fetchTenantJson<{ integrations: Integration[] }>("/tenant/integrations", apiKey);
      setIntegrations(payload.integrations);
      setLoaded(true);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Failed to load CLM integrations.");
    }
  }, [apiKey, onMessage]);

  function currentIntegration(): Integration | null {
    return integrations.find((row) => row.provider === clmIntegrationProvider(provider)) ?? null;
  }

  async function save() {
    setBusy("save");
    try {
      await postTenantJson(`/tenant/integrations/clm/${provider}`, apiKey, {
        apiKey: apiKeyField || undefined,
      });
      onMessage?.(`${provider} CLM integration saved.`);
      await loadIntegrations();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    setBusy("test");
    try {
      const result = await postTenantJson<{ ok?: boolean; previewCount?: number; message?: string }>(
        `/tenant/integrations/clm/${provider}/test`,
        apiKey,
        {}
      );
      onMessage?.(
        result.ok
          ? `${provider} connection OK — ${result.previewCount ?? 0} certificates previewed.`
          : `${provider} test failed: ${result.message ?? "unknown"}`
      );
      await loadIntegrations();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Test failed.");
    } finally {
      setBusy(null);
    }
  }

  async function pull() {
    setBusy("pull");
    try {
      const response = await fetch(clmPullPath(provider), {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Pull failed.");
      }
      const payload = (await response.json()) as {
        ingest?: { componentCount?: number };
        pull?: { componentCount?: number };
      };
      const count = payload.ingest?.componentCount ?? payload.pull?.componentCount ?? 0;
      onMessage?.(`${provider} pull complete — ${count} components ingested.`);
      await loadIntegrations();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Pull failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!loaded) {
    return (
      <button
        type="button"
        className="text-sm text-white underline underline-offset-4"
        onClick={() => void loadIntegrations()}
      >
        Load CLM integrations
      </button>
    );
  }

  const integration = currentIntegration();

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-4">
      <Eyebrow>Certificate Lifecycle Management</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Read-only certificate inventory from enterprise CLM platforms.
      </p>
      <select
        value={provider}
        onChange={(event) => setProvider(event.target.value as ClmProvider)}
        className="mt-3 w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
      >
        {CLM_PROVIDERS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="password"
        value={apiKeyField}
        onChange={(event) => setApiKeyField(event.target.value)}
        placeholder="API key"
        className="mt-3 w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy !== null} onClick={() => void save()}>
          {busy === "save" ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy !== null} onClick={() => void test()}>
          {busy === "test" ? "Testing…" : "Test"}
        </Button>
        <Button type="button" size="sm" variant="secondary" disabled={busy !== null} onClick={() => void pull()}>
          {busy === "pull" ? "Pulling…" : "Pull CBOM"}
        </Button>
      </div>
      {integration?.configured ? (
        <p className="mt-2 text-xs text-emerald-300">Configured</p>
      ) : null}
    </div>
  );
}
