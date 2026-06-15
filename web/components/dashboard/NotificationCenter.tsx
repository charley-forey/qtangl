"use client";

import { useEffect, useState } from "react";

export type DashboardAlert = {
  type: string;
  message: string;
  severity?: string;
  actionUrl?: string;
};

export default function NotificationCenter({ alerts }: { alerts: DashboardAlert[] }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const unread = alerts.filter((a) => !read.has(`${a.type}-${a.message}`)).length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
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
          {alerts.length === 0 ? (
            <p className="text-xs text-[var(--color-gray-500)]">No alerts</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {alerts.map((alert) => {
                const key = `${alert.type}-${alert.message}`;
                return (
                  <li key={key} className="rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs">
                    <p className="font-medium text-white">{alert.type}</p>
                    <p className="mt-1 text-[var(--color-gray-400)]">{alert.message}</p>
                    <button
                      type="button"
                      className="mt-2 text-sky-400 underline"
                      onClick={() => setRead((prev) => new Set(prev).add(key))}
                    >
                      Dismiss
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
