"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import { fetchDashboardJson } from "@/lib/dashboard-bff";
import { navigateDashboardDeepLink } from "@/lib/dashboard-deep-links";
import { trackDashboardEvent } from "@/lib/dashboard-analytics";
import InfoTip from "@/components/pqc/InfoTip";
import { glossaryIdForAlertRule } from "@/lib/pqc-glossary";

export type DashboardAlert = {
  id?: string;
  type: string;
  message?: string;
  severity?: string;
  actionUrl?: string;
  source?: string;
  delta?: number;
  rule?: string;
  firedAt?: string;
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  info: "text-sky-400",
};

export default function NotificationCenter({
  alerts,
  onMarkRead,
  onNavigateTab,
  onRefresh,
}: {
  alerts: DashboardAlert[];
  onMarkRead?: (ids: string[]) => void;
  onNavigateTab?: (tab: DashboardTabId) => void;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function alertKey(alert: DashboardAlert) {
    return alert.id ?? `${alert.type}-${alert.message}`;
  }

  const unread = alerts.filter((a) => !read.has(alertKey(a))).length;

  async function dismiss(key: string, alert: DashboardAlert) {
    setRead((prev) => new Set(prev).add(key));
    onMarkRead?.([key]);
    if (alert.id) {
      try {
        await fetchDashboardJson(`/tenant/alerts/${encodeURIComponent(alert.id)}/read`, {
          method: "PATCH",
        });
        onRefresh?.();
      } catch {
        /* optional */
      }
    }
    trackDashboardEvent("alert_clicked", { rule: alert.rule ?? alert.type });
    const url = alert.actionUrl ?? "";
    if (url) {
      navigateDashboardDeepLink(url, router, onNavigateTab);
      setOpen(false);
    }
  }

  async function markAllRead() {
    const keys = alerts.map(alertKey);
    setRead(new Set(keys));
    onMarkRead?.(keys);
    try {
      await fetchDashboardJson("/tenant/alerts/read-all", { method: "POST" });
      onRefresh?.();
    } catch {
      /* optional */
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        data-tour="alert-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs text-white"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      >
        Alerts
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-[var(--border-strong)] bg-black p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-white">Alert inbox</p>
            {alerts.length > 0 ? (
              <button type="button" className="text-[10px] text-sky-400 underline" onClick={() => void markAllRead()}>
                Mark all read
              </button>
            ) : null}
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-[var(--color-gray-500)]">No alerts</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {alerts.map((alert) => {
                const key = alertKey(alert);
                const sev = String(alert.severity ?? "info").toLowerCase();
                return (
                  <li key={key} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs">
                    <p className={`font-medium ${SEVERITY_CLASS[sev] ?? "text-white"}`}>
                      <span className="inline-flex items-center gap-1">
                        {alert.rule ?? alert.type}
                        {glossaryIdForAlertRule(String(alert.rule ?? alert.type)) ? (
                          <InfoTip termId={glossaryIdForAlertRule(String(alert.rule ?? alert.type))!} />
                        ) : null}
                      </span>
                      {alert.severity ? ` · ${alert.severity}` : ""}
                    </p>
                    <p className="mt-1 text-[var(--color-gray-400)]">{alert.message}</p>
                    <button
                      type="button"
                      className="mt-2 text-sky-400 underline"
                      onClick={() => void dismiss(key, alert)}
                    >
                      View & dismiss
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
