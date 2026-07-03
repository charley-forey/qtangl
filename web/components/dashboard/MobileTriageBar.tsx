"use client";

import { useEffect, useState } from "react";

import { fetchDashboardJson, patchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type InboxItem = {
  id: string;
  kind: "remediation" | "alert" | "scan";
  title: string;
  severity?: string | null;
  deepLink?: string | null;
};

type InboxResponse = { owner: string; items: InboxItem[]; total: number };

export default function MobileTriageBar({ onAssign }: { onAssign?: (item: InboxItem) => void }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    void fetchDashboardJson<InboxResponse>("/tenant/inbox")
      .then((data) => setItems((data.items ?? []).filter((i) => i.kind === "alert")))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;
  const current = items[Math.min(index, items.length - 1)];
  if (!current) return null;

  function advance() {
    setItems((prev) => prev.filter((i) => i.id !== current!.id));
    setIndex(0);
  }

  async function ack() {
    trackDashboardEvent({ event: "cc_mobile_triage_action", properties: { action: "ack", id: current!.id } });
    try {
      await patchDashboardJson(`/tenant/alerts/${encodeURIComponent(current!.id)}/read`, {});
    } catch {
      /* best-effort */
    }
    advance();
  }

  function assign() {
    trackDashboardEvent({ event: "cc_mobile_triage_action", properties: { action: "assign", id: current!.id } });
    onAssign?.(current!);
    advance();
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-strong)] bg-black/95 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white">{current.title}</p>
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">
            {current.severity ?? "alert"} · {items.length} to triage
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-white"
            onClick={assign}
          >
            Assign
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black"
            onClick={() => void ack()}
          >
            Ack
          </button>
        </div>
      </div>
    </div>
  );
}
