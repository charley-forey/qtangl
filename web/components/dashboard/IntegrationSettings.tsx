"use client";

import { useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { useQtanglClient } from "@qtangl/sdk-react";

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

const WEBHOOK_EVENT_OPTIONS = [
  "scan.complete",
  "report.verified",
  "passport.viewed",
  "cbom.ingested",
] as const;

export default function IntegrationSettings({
  onMessage,
}: {
  onMessage: (message: string) => void;
}) {
  const client = useQtanglClient();
  const [jiraBase, setJiraBase] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraProject, setJiraProject] = useState("SEC");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["scan.complete"]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function loadSettings() {
    try {
      const intPayload = await client.monitor.listIntegrations();
      const hookPayload = await client.monitor.listWebhooks();
      const integrationsList = (intPayload.integrations as Integration[] | undefined) ?? [];
      const webhooksList = (hookPayload.webhooks as Webhook[] | undefined) ?? [];
      setIntegrations(integrationsList);
      setWebhooks(webhooksList);
      const jira = integrationsList.find((row) => row.provider === "jira");
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
            await client.monitor.saveIntegration("jira", {
              baseUrl: jiraBase,
              email: jiraEmail,
              apiToken: jiraToken,
              projectKey: jiraProject,
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
        <div className="mt-3 flex flex-wrap gap-2">
          {WEBHOOK_EVENT_OPTIONS.map((event) => (
            <label key={event} className="flex items-center gap-2 text-xs text-[var(--color-gray-400)]">
              <input
                type="checkbox"
                checked={webhookEvents.includes(event)}
                onChange={(e) => {
                  setWebhookEvents((prev) =>
                    e.target.checked ? [...prev, event] : prev.filter((item) => item !== event)
                  );
                }}
              />
              {event}
            </label>
          ))}
        </div>
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
              await client.monitor.createWebhook({
                url: webhookUrl,
                events: webhookEvents,
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
          <ul className="mt-3 space-y-2 text-xs text-[var(--color-gray-400)]">
            {webhooks.map((hook) => (
              <li key={hook.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono break-all">
                  {hook.url}
                  <span className="ml-2 text-[var(--color-gray-500)]">({hook.events})</span>
                </span>
                <button
                  type="button"
                  className="shrink-0 text-white underline underline-offset-4"
                  onClick={async () => {
                    try {
                      await client.monitor.deleteWebhook(hook.id);
                      onMessage("Webhook removed.");
                      await loadSettings();
                    } catch {
                      onMessage("Failed to remove webhook.");
                    }
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <DlqPanel onMessage={onMessage} />
    </div>
  );
}

type DlqItem = {
  id: string;
  url: string;
  reason: string;
  event?: string;
  scanId?: string;
  createdAt?: string;
};

function DlqPanel({ onMessage }: { onMessage: (message: string) => void }) {
  const client = useQtanglClient();
  const [items, setItems] = useState<DlqItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function loadDlq() {
    try {
      const payload = await client.monitor.listWebhookDlq();
      setItems((payload.items as DlqItem[] | undefined) ?? []);
      setLoaded(true);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Failed to load DLQ.");
    }
  }

  return (
    <div>
      <Eyebrow>Webhook dead letter queue</Eyebrow>
      {!loaded ? (
        <button type="button" className="mt-2 text-sm text-white underline" onClick={loadDlq}>
          Load failed deliveries
        </button>
      ) : items.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--color-gray-500)]">No failed webhook deliveries.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-xs text-[var(--color-gray-400)]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-[var(--border-subtle)] p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-white">{item.id}</p>
                <p>{item.reason}</p>
                <p className="break-all">{item.url}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-white underline"
                onClick={async () => {
                  try {
                    await client.monitor.replayWebhook(item.id);
                    onMessage(`Replayed ${item.id}`);
                    await loadDlq();
                  } catch (error) {
                    onMessage(error instanceof Error ? error.message : "Replay failed.");
                  }
                }}
              >
                Replay
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
