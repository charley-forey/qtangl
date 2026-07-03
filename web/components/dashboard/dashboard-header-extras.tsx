"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { DashboardAlert } from "@/components/dashboard/NotificationCenter";
import type { DashboardCommandAction } from "@/hooks/useDashboardCommandActions";
import type { DashboardPersona } from "@/components/dashboard/DashboardPersonaToggle";
import type { DashboardTabId } from "@/components/dashboard/DashboardTabs";
import type { DashboardSession } from "@/lib/dashboard-bff";

export type DashboardHeaderExtras = {
  tier?: string;
  membershipHealth?: Array<{ tenantId: string; latestReadinessBand?: string | null }>;
  alerts: DashboardAlert[];
  commandActions: DashboardCommandAction[];
  density: "comfortable" | "compact";
  persona: DashboardPersona;
  sessionRole?: string;
  notificationReadIds: string[];
  onSessionChange: (session: DashboardSession) => void;
  onTabChange: (tab: DashboardTabId) => void;
  onMarkAlertsRead: (ids: string[]) => void;
  onRefreshAlerts?: () => void;
  onDensityToggle: () => void;
};

type ContextValue = {
  extras: DashboardHeaderExtras | null;
  setExtras: (extras: DashboardHeaderExtras | null) => void;
};

const DashboardHeaderExtrasContext = createContext<ContextValue | null>(null);

export function DashboardHeaderExtrasProvider({ children }: { children: ReactNode }) {
  const [extras, setExtras] = useState<DashboardHeaderExtras | null>(null);
  const value = useMemo(() => ({ extras, setExtras }), [extras]);
  return (
    <DashboardHeaderExtrasContext.Provider value={value}>
      {children}
    </DashboardHeaderExtrasContext.Provider>
  );
}

/** Read the extra header content (tenant/tier/actions) published by the active dashboard page, if any. */
export function useDashboardHeaderExtras(): DashboardHeaderExtras | null {
  const ctx = useContext(DashboardHeaderExtrasContext);
  if (!ctx) return null;
  return ctx.extras;
}

/** Publish this page's header content so the global DashboardAppHeader can render it. Clears on unmount. */
export function usePublishDashboardHeaderExtras(extras: DashboardHeaderExtras) {
  const ctx = useContext(DashboardHeaderExtrasContext);
  const setExtras = ctx?.setExtras;

  useEffect(() => {
    setExtras?.(extras);
    return () => setExtras?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setExtras,
    extras.tier,
    extras.membershipHealth,
    extras.alerts,
    extras.commandActions,
    extras.density,
    extras.persona,
    extras.sessionRole,
    extras.notificationReadIds,
    extras.onSessionChange,
    extras.onTabChange,
    extras.onMarkAlertsRead,
    extras.onRefreshAlerts,
    extras.onDensityToggle,
  ]);
}
