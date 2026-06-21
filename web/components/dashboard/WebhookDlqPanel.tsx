"use client";

import { useCallback, useEffect, useState } from "react";

import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson, postDashboardJson } from "@/lib/dashboard-bff";

type DlqItem = {
  id: string;
  url: string;
  reason: string;
  event?: string;
  scanId?: string;
  createdAt?: string;
};

type Props = {
  onMessage?: (message: string) => void;
};

export default function WebhookDlqPanel({ onMessage }: Props) {
  const [items, setItems] = useState<DlqItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDlq = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchDashboardJson<{ items?: DlqItem[] }>("/tenant/webhooks/dlq");
      setItems(payload.items ?? []);
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Failed to load webhook DLQ.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadDlq();
  }, [loadDlq]);

  if (loading) {
    return <p className="text-xs text-[var(--color-gray-500)]">Loading failed deliveries…</p>;
  }

  if (!items.length) {
    return <p className="text-xs text-[var(--color-gray-500)]">No failed webhook deliveries.</p>;
  }

  return (
    <div>
      <Eyebrow>Webhook dead letter queue</Eyebrow>
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
                  await postDashboardJson("/tenant/webhooks/replay", { deadLetterId: item.id });
                  onMessage?.(`Replayed ${item.id}`);
                  await loadDlq();
                } catch (error) {
                  onMessage?.(error instanceof Error ? error.message : "Replay failed.");
                }
              }}
            >
              Replay
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
