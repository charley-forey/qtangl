"use client";

import { useState } from "react";

import TenantSwitcher from "@/components/dashboard/TenantSwitcher";
import StatusPill from "@/components/dashboard/ui/StatusPill";
import DashboardRoleBadge from "@/components/dashboard/DashboardRoleBadge";
import ReadinessCopilotDrawer from "@/components/dashboard/ReadinessCopilotDrawer";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DashboardCommandPalette from "@/components/dashboard/DashboardCommandPalette";
import { useDashboardSession } from "@/components/dashboard/dashboard-session-context";
import type { DashboardSession } from "@/lib/dashboard-bff";
import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";
import type { DashboardCommandAction } from "@/hooks/useDashboardCommandActions";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import { isQtanglOpsFromSessionEmail } from "@/lib/ops-auth";

type Props = {
  tier?: string;
  membershipHealth?: Array<{ tenantId: string; latestReadinessBand?: string | null }>;
  onSessionChange?: (session: DashboardSession) => void;
  sessionRole?: string;
  persona: DashboardPersona;
  alerts: DashboardAlert[];
  commandActions: DashboardCommandAction[];
  density: "comfortable" | "compact";
  notificationReadIds: string[];
  onTabChange: (tab: DashboardTabId) => void;
  onMarkAlertsRead: (ids: string[]) => void;
  onRefreshAlerts?: () => void;
  onDensityToggle: () => void;
};

export default function CommandCenterHeader({
  tier,
  membershipHealth,
  onSessionChange,
  sessionRole,
  persona,
  alerts,
  commandActions,
  density,
  notificationReadIds,
  onTabChange,
  onMarkAlertsRead,
  onRefreshAlerts,
  onDensityToggle,
}: Props) {
  const { session, signOut } = useDashboardSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);

  if (!session) return null;

  const showOps = isQtanglOpsFromSessionEmail(session.email);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border-subtle)] bg-black/25 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <TenantSwitcher
          session={session}
          membershipHealth={membershipHealth}
          onSwitched={(next) => {
            if (next) onSessionChange?.(next);
          }}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-white/5 px-2 py-0.5">
          {tier ? <StatusPill label={tier} tone="info" /> : null}
          <DashboardRoleBadge role={sessionRole ?? session.role} />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <ReadinessCopilotDrawer persona={persona === "executive" ? "executive" : "operator"} />
        <NotificationCenter
          alerts={alerts}
          onMarkRead={onMarkAlertsRead}
          onNavigateTab={onTabChange}
          onRefresh={onRefreshAlerts}
          notificationReadIds={notificationReadIds}
        />
        <DashboardCommandPalette actions={commandActions} />

        <div className="relative hidden md:block">
          <button
            type="button"
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--color-gray-300)] hover:text-white"
            onClick={() => setAccountOpen((o) => !o)}
            aria-expanded={accountOpen}
          >
            Account
          </button>
          {accountOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2 min-w-[12rem] rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-2 shadow-lg">
              <p className="truncate px-2 py-1 text-xs text-[var(--color-gray-400)]">{session.email}</p>
              {showOps ? (
                <a
                  href="/ops"
                  className="block rounded-lg px-2 py-1.5 text-xs text-white hover:bg-white/5"
                  onClick={() => setAccountOpen(false)}
                >
                  Ops console
                </a>
              ) : null}
              <button
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
                onClick={() => {
                  setAccountOpen(false);
                  signOut();
                }}
              >
                Sign out
              </button>
              <button
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-[var(--color-gray-400)] hover:bg-white/5"
                onClick={() => {
                  onDensityToggle();
                  setAccountOpen(false);
                }}
              >
                {density === "compact" ? "Comfortable" : "Compact"} density
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative md:hidden">
          <button
            type="button"
            className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-xs text-white"
            onClick={() => setOverflowOpen((o) => !o)}
            aria-label="More actions"
          >
            ···
          </button>
          {overflowOpen ? (
            <div className="absolute right-0 top-full z-30 mt-2 min-w-[10rem] rounded-xl border border-[var(--border-strong)] bg-[var(--color-gray-900)] p-2 shadow-lg">
              <p className="truncate px-2 py-1 text-xs text-[var(--color-gray-400)]">{session.email}</p>
              {showOps ? (
                <a href="/ops" className="block rounded-lg px-2 py-1.5 text-xs text-white hover:bg-white/5">
                  Ops console
                </a>
              ) : null}
              <button
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
                onClick={() => {
                  setOverflowOpen(false);
                  onDensityToggle();
                }}
              >
                {density === "compact" ? "Comfortable" : "Compact"}
              </button>
              <button
                type="button"
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-white hover:bg-white/5"
                onClick={() => {
                  setOverflowOpen(false);
                  signOut();
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
