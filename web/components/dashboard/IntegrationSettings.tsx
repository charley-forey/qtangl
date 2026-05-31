"use client";

import { useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { postTenantJson, fetchTenantJson } from "@/lib/tenant-api";

type Integration = {
  id: string;
  provider: string;
  configured: boolean;
  config: Record<string, string>;
};

type Webhook = {
  id: string;
  url: string;
  events: string;
};

export default function IntegrationSettings({
  apiKey,
  onMessage,
}: {
  apiKey: string;
  onMessage: (message: string) => void;
}) {
  const [jiraBase, setJiraBase] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraProject, setJiraProject] = useState("SEC");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function loadSettings() {
    try {
      const intPayload = await fetchTenantJson<{ integrations: Integration[] }>(
        "/tenant/integrations",
        apiKey
      );
      const hookPayload = await fetchTenantJson<{ webhooks: Webhook[] }>("/tenant/webhooks", apiKey);
      setIntegrations(intPayload.integrations);
      setWebhooks(hookPayload.webhooks);
      const jira = intPayload.integrations.find((row) => row.provider === "jira");
      if (jira?.config) {
        setJiraBase(jira.config.baseUrl ?? "");
        setJiraEmail(jira.config.email ?? "");
        setJiraProject(jira.config.projectKey ?? "SEC");
      }
      setLoaded(true);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Failed to load integrations.");
    }
  }

  if (!loaded) {
    return (
      <button
        type="button"
        className="text-sm text-white underline underline-offset-4"
        onClick={() => loadSettings()}
      >
        Load integration settings
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Jira</Eyebrow>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            type="url"
            value={jiraBase}
            onChange={(e) => setJiraBase(e.target.value)}
            placeholder="https://yourorg.atlassian.net"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
          <input
            type="email"
            value={jiraEmail}
            onChange={(e) => setJiraEmail(e.target.value)}
            placeholder="API user email"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
          <input
            type="password"
            value={jiraToken}
            onChange={(e) => setJiraToken(e.target.value)}
            placeholder="API token"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
          <input
            type="text"
            value={jiraProject}
            onChange={(e) => setJiraProject(e.target.value)}
            placeholder="Project key"
            className="rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
        </div>
        <button
          type="button"
          className="mt-3 rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black"
          onClick={async () => {
            await postTenantJson(`/tenant/integrations/jira`, apiKey, {
              config: {
                baseUrl: jiraBase,
                email: jiraEmail,
                apiToken: jiraToken,
                projectKey: jiraProject,
              },
            });
            onMessage("Jira integration saved.");
            await loadSettings();
          }}
        >
          Save Jira config
        </button>
        {integrations.some((row) => row.provider === "jira" && row.configured) ? (
          <p className="mt-2 text-xs text-emerald-300">Jira configured</p>
        ) : null}
      </div>
      <div>
        <Eyebrow>Slack / webhook</Eyebrow>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/..."
            className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
          />
          <button
            type="button"
            className="rounded-full border border-[var(--border-strong)] bg-white px-5 py-2 text-sm font-medium text-black"
            onClick={async () => {
              await postTenantJson("/tenant/webhooks", apiKey, {
                url: webhookUrl,
                events: "scan.complete",
              });
              onMessage("Webhook registered.");
              setWebhookUrl("");
              await loadSettings();
            }}
          >
            Add webhook
          </button>
        </div>
        {webhooks.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-[var(--color-gray-400)]">
            {webhooks.map((hook) => (
              <li key={hook.id} className="font-mono break-all">
                {hook.url}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
