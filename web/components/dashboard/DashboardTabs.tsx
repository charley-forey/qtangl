"use client";

import { useEffect, useState } from "react";

import type { RolePolicy } from "@/lib/dashboard-role-policies";
import { tabAllowed } from "@/lib/dashboard-role-policies";

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
  rolePolicy,
}: {
  active: DashboardTabId;
  onChange: (tab: DashboardTabId) => void;
  showPortfolio?: boolean;
  persona?: string;
  rolePolicy?: RolePolicy;
}) {
  const tabs = showPortfolio
    ? [...TABS, { id: "portfolio" as const, label: "Portfolio" }]
    : TABS;

  let visibleTabs =
    persona === "executive"
      ? tabs.filter((t) => ["overview", "scans", "settings", "portfolio"].includes(t.id))
      : tabs;

  if (rolePolicy) {
    visibleTabs = visibleTabs.filter((tab) => tabAllowed(rolePolicy, tab.id));
  }

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
        <span className="sr-only">Command Center section</span>
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
      aria-label="Command Center sections"
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
