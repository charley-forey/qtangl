"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { trackDashboardEvent } from "@/lib/dashboard-telemetry";

type InboxItem = {
  id: string;
  kind: "remediation" | "alert" | "scan";
  title: string;
  status?: string | null;
  owner?: string | null;
  dueAt?: string | null;
  deepLink?: string | null;
  severity?: string | null;
};

type InboxResponse = {
  owner: string;
  items: InboxItem[];
  total: number;
};

const KIND_LABEL: Record<InboxItem["kind"], string> = {
  remediation: "Remediation",
  alert: "Alert",
  scan: "Scan",
};

export default function AssignmentInbox({ owner }: { owner?: string }) {
  const [data, setData] = useState<InboxResponse | null>(null);

  useEffect(() => {
    const q = owner ? `?owner=${encodeURIComponent(owner)}` : "";
    void fetchDashboardJson<InboxResponse>(`/tenant/inbox${q}`)
      .then((result) => {
        setData(result);
        trackDashboardEvent({ event: "cc_inbox_opened", properties: { total: result.total } });
      })
      .catch(() => setData(null));
  }, [owner]);

  if (!data) return null;

  return (
    <Card tone="panel" className="space-y-3">
      <div className="flex items-center justify-between">
        <Eyebrow>My inbox</Eyebrow>
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">{data.total} assigned</span>
      </div>
      {data.items.length === 0 ? (
        <p className="text-xs text-[var(--color-gray-500)]">Nothing assigned to you right now.</p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((item) => {
            const content = (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left transition hover:border-[var(--border-strong)]">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{item.title}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-gray-500)]">
                    {KIND_LABEL[item.kind]}
                    {item.status ? ` · ${item.status}` : ""}
                    {item.severity ? ` · ${item.severity}` : ""}
                  </p>
                </div>
                {item.dueAt ? (
                  <span className="shrink-0 text-[10px] text-amber-200">due {item.dueAt.slice(0, 10)}</span>
                ) : null}
              </div>
            );
            return (
              <li key={`${item.kind}-${item.id}`}>
                {item.deepLink ? (
                  <a
                    href={item.deepLink}
                    onClick={() =>
                      trackDashboardEvent({
                        event: "cc_inbox_item_clicked",
                        properties: { kind: item.kind, id: item.id },
                      })
                    }
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
