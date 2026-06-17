"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { navigateDashboardDeepLink } from "@/lib/dashboard-deep-links";
import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";

export default function AlertTimeline({
  onNavigateTab,
}: {
  onNavigateTab?: (tab: DashboardTabId) => void;
}) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

  useEffect(() => {
    fetchDashboardJson<{ alerts?: DashboardAlert[] }>("/tenant/dashboard/summary")
      .then((payload) => setAlerts(payload.alerts ?? []))
      .catch(() => setAlerts([]));
  }, []);

  return (
    <Card tone="panel">
      <Eyebrow>Alert timeline (30d)</Eyebrow>
      {alerts.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-gray-500)]">No recent alerts.</p>
      ) : (
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs">
          {alerts.map((alert) => (
            <li key={alert.id ?? `${alert.type}-${alert.message}`} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2">
              <p className="font-medium text-white">{alert.rule ?? alert.type}</p>
              <p className="text-[var(--color-gray-400)]">{alert.message}</p>
              {alert.actionUrl ? (
                <button
                  type="button"
                  className="mt-1 text-sky-400 underline"
                  onClick={() => navigateDashboardDeepLink(alert.actionUrl!, router, onNavigateTab)}
                >
                  Open
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
