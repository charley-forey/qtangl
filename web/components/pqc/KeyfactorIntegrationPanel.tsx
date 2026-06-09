"use client";

import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";
import { fetchTenantJson, postTenantJson } from "@/lib/tenant-api";

type Integration = {
  id: string;
  provider: string;
  configured: boolean;
  config: Record<string, string>;
};

export default function KeyfactorIntegrationPanel({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage?: (message: string) => void;
}) {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const loadIntegration = useCallback(async () => {
    try {
      const payload = await fetchTenantJson<{ integrations: Integration[] }>("/tenant/integrations", apiKey);
      const keyfactor = payload.integrations.find((row) => row.provider === "keyfactor") ?? null;
      setIntegration(keyfactor);
      if (keyfactor?.config) {
        setBaseUrl(keyfactor.config.baseUrl ?? "");
        setCollectionId(keyfactor.config.collectionId ?? "");
      }
      setLoaded(true);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Failed to load Keyfactor integration.");
    }
  }, [apiKey, onMessage]);

  async function save() {
    setBusy("save");
    try {
      await postTenantJson("/tenant/integrations/keyfactor", apiKey, {
        baseUrl,
        apiToken,
        collectionId: collectionId || undefined,
      });
      onMessage?.("Keyfactor integration saved.");
      await loadIntegration();
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
        "/tenant/integrations/keyfactor/test",
        apiKey,
        {}
      );
      onMessage?.(
        result.ok
          ? `Keyfactor connection OK — ${result.previewCount ?? 0} certificates previewed.`
          : `Keyfactor test failed: ${result.message ?? "unknown"}`
      );
      await loadIntegration();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Test failed.");
    } finally {
      setBusy(null);
    }
  }

  async function pull() {
    setBusy("pull");
    try {
      const response = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/pull/keyfactor`, {
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
      onMessage?.(`Keyfactor pull complete — ${count} components ingested.`);
      await loadIntegration();
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
        onClick={() => void loadIntegration()}
      >
        Load Keyfactor integration
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-4">
      <Eyebrow>Keyfactor</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Read-only certificate inventory from Keyfactor CipherInsights.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          type="url"
          value={baseUrl}
          onChange={(event) => setBaseUrl(event.target.value)}
          placeholder="Base URL (e.g. https://keyfactor.example.com)"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white sm:col-span-2"
        />
        <input
          type="password"
          value={apiToken}
          onChange={(event) => setApiToken(event.target.value)}
          placeholder="API token"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <input
          type="text"
          value={collectionId}
          onChange={(event) => setCollectionId(event.target.value)}
          placeholder="Collection ID (optional)"
          className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
      </div>
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
