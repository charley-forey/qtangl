"use client";

import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import { qtanglApiBaseUrl } from "@/lib/api";
import { fetchTenantJson, postTenantJson } from "@/lib/tenant-api";

type CloudIntegration = {
  id: string;
  provider: string;
  configured: boolean;
  config: Record<string, string>;
  lastTestAt?: string | null;
  lastPullAt?: string | null;
  lastPullStatus?: string | null;
};

export default function K8sIntegrationPanel({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage?: (message: string) => void;
}) {
  const [kubeconfigJson, setKubeconfigJson] = useState("");
  const [namespace, setNamespace] = useState("");
  const [integration, setIntegration] = useState<CloudIntegration | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const loadIntegration = useCallback(async () => {
    try {
      const payload = await fetchTenantJson<{ integrations: CloudIntegration[] }>(
        "/tenant/integrations/cloud",
        apiKey
      );
      const k8s = payload.integrations.find((row) => row.provider === "kubernetes") ?? null;
      setIntegration(k8s);
      if (k8s?.config) {
        setKubeconfigJson(k8s.config.kubeconfigJson ?? "");
        setNamespace(k8s.config.namespace ?? "");
      }
      setLoaded(true);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Failed to load Kubernetes integration.");
    }
  }, [apiKey, onMessage]);

  async function save() {
    setBusy("save");
    try {
      await postTenantJson("/tenant/integrations/cloud/kubernetes", apiKey, {
        kubeconfigJson: kubeconfigJson || undefined,
        namespace: namespace || undefined,
      });
      onMessage?.("Kubernetes integration saved.");
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
        "/tenant/integrations/cloud/kubernetes/test",
        apiKey,
        {}
      );
      onMessage?.(
        result.ok
          ? `Kubernetes connection OK — ${result.previewCount ?? 0} certificates previewed.`
          : `Kubernetes test failed: ${result.message ?? "unknown"}`
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
      const response = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/pull/kubernetes`, {
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
      onMessage?.(`Kubernetes pull complete — ${count} components ingested.`);
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
        Load Kubernetes integration
      </button>
    );
  }

  function statusLine() {
    if (!integration?.configured) return null;
    const roadmap = integration.lastPullStatus === "roadmap";
    return (
      <p className={`mt-2 text-xs ${roadmap ? "text-amber-300" : "text-emerald-300"}`}>
        {roadmap ? "Roadmap — configure kubeconfig and save to enable live pull" : "Configured"}
        {integration.lastPullStatus && integration.lastPullStatus !== "ok" && !roadmap
          ? ` · last pull ${integration.lastPullStatus}`
          : ""}
        {integration.lastTestAt ? ` · last test ${new Date(integration.lastTestAt).toLocaleString()}` : ""}
        {integration.lastPullAt ? ` · last pull ${new Date(integration.lastPullAt).toLocaleString()}` : ""}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] p-4">
      <Eyebrow>Kubernetes / cert-manager</Eyebrow>
      <p className="mt-2 text-sm text-[var(--color-gray-400)]">
        Read-only TLS certificate inventory from Kubernetes secrets (cert-manager).
      </p>
      <textarea
        value={kubeconfigJson}
        onChange={(event) => setKubeconfigJson(event.target.value)}
        placeholder="Kubeconfig JSON"
        rows={6}
        className="mt-3 w-full rounded-xl border border-[var(--border-strong)] bg-black px-4 py-2 font-mono text-xs text-white"
      />
      <input
        type="text"
        value={namespace}
        onChange={(event) => setNamespace(event.target.value)}
        placeholder="Namespace (optional, all if empty)"
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
      {statusLine()}
    </div>
  );
}
