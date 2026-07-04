"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import { fetchDashboardJson } from "@/lib/dashboard-bff";

type InboxItem = {
  id: string;
  kind: string;
  title: string;
  status?: string | null;
  deepLink?: string | null;
  severity?: string | null;
};

export default function UnifiedWorkQueue() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardJson<{ items: InboxItem[] }>("/tenant/inbox")
      .then((payload) => setItems(payload.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card tone="panel" className="animate-pulse p-6">
        <div className="h-4 w-32 rounded bg-white/10" />
      </Card>
    );
  }

  if (!items.length) {
    return (
      <EmptyState title="Work queue clear" description="Alerts, assignments, and remediation items will appear here." />
    );
  }

  return (
    <Card tone="panel" className="p-5">
      <h2 className="text-sm font-semibold text-white">Unified work queue</h2>
      <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
        {items.slice(0, 8).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-xs uppercase text-[var(--color-gray-500)]">{item.kind}</p>
              <p className="text-sm text-white">{item.title}</p>
            </div>
            <button
              type="button"
              className="text-xs text-sky-300 hover:text-sky-200"
              onClick={() => item.deepLink && router.push(item.deepLink)}
            >
              Open
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
