"use client";

import { useEffect, useState } from "react";

export type DashboardTabId = "overview" | "scans" | "monitor" | "remediate" | "settings" | "portfolio";

const TABS: Array<{ id: DashboardTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "scans", label: "Scans" },
  { id: "monitor", label: "Monitor" },
  { id: "remediate", label: "Remediate" },
  { id: "settings", label: "Settings" },
];

export default function DashboardTabs({
  active,
  onChange,
  showPortfolio,
  persona,
}: {
  active: DashboardTabId;
  onChange: (tab: DashboardTabId) => void;
  showPortfolio?: boolean;
  persona?: string;
}) {
  const tabs = showPortfolio
    ? [...TABS, { id: "portfolio" as const, label: "Portfolio" }]
    : TABS;

  const visibleTabs =
    persona === "executive"
      ? tabs.filter((t) => ["overview", "scans", "settings", "portfolio"].includes(t.id))
      : tabs;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (isMobile) {
    return (
      <label className="block" id="dashboard-tabs">
        <span className="sr-only">Dashboard section</span>
        <select
          value={active}
          onChange={(e) => onChange(e.target.value as DashboardTabId)}
          className="w-full rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white"
        >
          {visibleTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <nav
      id="dashboard-tabs"
      className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3"
      aria-label="Dashboard sections"
    >
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "rounded-full px-4 py-2 text-sm transition",
            active === tab.id
              ? "bg-white text-black"
              : "border border-[var(--border-subtle)] text-[var(--color-gray-300)] hover:text-white",
          ].join(" ")}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
