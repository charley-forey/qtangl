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

export default function CloudIntegrationPanel({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage?: (message: string) => void;
}) {
  const [awsRegion, setAwsRegion] = useState("us-east-1");
  const [awsRoleArn, setAwsRoleArn] = useState("");
  const [azureVaultName, setAzureVaultName] = useState("");
  const [gcpProjectId, setGcpProjectId] = useState("");
  const [integrations, setIntegrations] = useState<CloudIntegration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      const payload = await fetchTenantJson<{ integrations: CloudIntegration[] }>(
        "/tenant/integrations/cloud",
        apiKey
      );
      setIntegrations(payload.integrations);
      const aws = payload.integrations.find((row) => row.provider === "aws");
      const azure = payload.integrations.find((row) => row.provider === "azure");
      if (aws?.config) {
        setAwsRegion(aws.config.region ?? "us-east-1");
        setAwsRoleArn(aws.config.roleArn ?? "");
      }
      if (azure?.config) {
        setAzureVaultName(azure.config.vaultName ?? "");
      }
      const gcp = payload.integrations.find((row) => row.provider === "gcp");
      if (gcp?.config) {
        setGcpProjectId(gcp.config.projectId ?? "");
      }
      setLoaded(true);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Failed to load cloud integrations.");
    }
  }, [apiKey, onMessage]);

  async function saveProvider(provider: "aws" | "azure" | "gcp") {
    setBusy(`save-${provider}`);
    try {
      const body =
        provider === "aws"
          ? { region: awsRegion, roleArn: awsRoleArn || undefined }
          : provider === "azure"
            ? { vaultName: azureVaultName }
            : { projectId: gcpProjectId };
      await postTenantJson(`/tenant/integrations/${provider}`, apiKey, body);
      onMessage?.(`${provider.toUpperCase()} integration saved.`);
      await loadIntegrations();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(null);
    }
  }

  async function testProvider(provider: "aws" | "azure" | "gcp") {
    setBusy(`test-${provider}`);
    try {
      const result = await postTenantJson<{ ok?: boolean; previewCount?: number; message?: string }>(
        `/tenant/integrations/${provider}/test`,
        apiKey,
        {}
      );
      onMessage?.(
        result.ok
          ? `${provider.toUpperCase()} connection OK — ${result.previewCount ?? 0} assets previewed.`
          : `${provider.toUpperCase()} test failed: ${result.message ?? "unknown"}`
      );
      await loadIntegrations();
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Test failed.");
    } finally {
      setBusy(null);
    }
  }

  async function pullProvider(provider: "aws" | "azure" | "gcp") {
    setBusy(`pull-${provider}`);
    try {
      const response = await fetch(`${qtanglApiBaseUrl}/pqc/cbom/pull/${provider}`, {
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
      onMessage?.(`${provider.toUpperCase()} pull complete — ${count} components ingested.`);
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
        Load cloud integrations
      </button>
    );
  }

  function statusLine(provider: string) {
    const row = integrations.find((item) => item.provider === provider);
    if (!row?.configured) return null;
    const roadmap = row.lastPullStatus === "roadmap";
    return (
      <p className={`mt-2 text-xs ${roadmap ? "text-amber-300" : "text-emerald-300"}`}>
        {roadmap ? "Roadmap — configure credentials and save to enable live pull" : "Configured"}
        {row.lastPullStatus && row.lastPullStatus !== "ok" && !roadmap
          ? ` · last pull ${row.lastPullStatus}`
          : ""}
        {row.lastTestAt ? ` · last test ${new Date(row.lastTestAt).toLocaleString()}` : ""}
        {row.lastPullAt ? ` · last pull ${new Date(row.lastPullAt).toLocaleString()}` : ""}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border-subtle)] p-4">
        <Eyebrow>AWS ACM</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Read-only certificate inventory via cross-account IAM role (ACM ListCertificates).
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={awsRegion}
            onChange={(event) => setAwsRegion(event.target.value)}
            placeholder="Region (e.g. us-east-1)"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
          <input
            type="text"
            value={awsRoleArn}
            onChange={(event) => setAwsRoleArn(event.target.value)}
            placeholder="Role ARN (optional)"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            onClick={() => void saveProvider("aws")}
          >
            {busy === "save-aws" ? "Saving…" : "Save AWS"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void testProvider("aws")}
          >
            {busy === "test-aws" ? "Testing…" : "Test"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void pullProvider("aws")}
          >
            {busy === "pull-aws" ? "Pulling…" : "Pull CBOM"}
          </Button>
        </div>
        {statusLine("aws")}
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] p-4">
        <Eyebrow>Azure Key Vault</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Read-only certificate metadata from Azure Key Vault.
        </p>
        <input
          type="text"
          value={azureVaultName}
          onChange={(event) => setAzureVaultName(event.target.value)}
          placeholder="Vault name"
          className="mt-3 w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            onClick={() => void saveProvider("azure")}
          >
            {busy === "save-azure" ? "Saving…" : "Save Azure"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void testProvider("azure")}
          >
            {busy === "test-azure" ? "Testing…" : "Test"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy !== null}
            onClick={() => void pullProvider("azure")}
          >
            {busy === "pull-azure" ? "Pulling…" : "Pull CBOM"}
          </Button>
        </div>
        {statusLine("azure")}
      </div>

      <div className="rounded-xl border border-[var(--border-subtle)] p-4">
        <Eyebrow>GCP Certificate Manager</Eyebrow>
        <p className="mt-2 text-sm text-[var(--color-gray-400)]">
          Read-only certificate inventory from Google Cloud Certificate Manager.
        </p>
        <input
          type="text"
          value={gcpProjectId}
          onChange={(event) => setGcpProjectId(event.target.value)}
          placeholder="GCP project ID"
          className="mt-3 w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={busy !== null} onClick={() => void saveProvider("gcp")}>
            {busy === "save-gcp" ? "Saving…" : "Save GCP"}
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={busy !== null} onClick={() => void testProvider("gcp")}>
            {busy === "test-gcp" ? "Testing…" : "Test"}
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={busy !== null} onClick={() => void pullProvider("gcp")}>
            {busy === "pull-gcp" ? "Pulling…" : "Pull CBOM"}
          </Button>
        </div>
        {statusLine("gcp")}
      </div>
    </div>
  );
}
