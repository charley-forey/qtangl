"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchDashboardSession,
  workosClientAuthEnabled,
  type DashboardSession,
} from "@/lib/dashboard-bff";

type DashboardSessionContextValue = {
  session: DashboardSession | null;
  checked: boolean;
  workosEnabled: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const DashboardSessionContext = createContext<DashboardSessionContextValue | null>(null);

export function DashboardSessionProvider({ children }: { children: ReactNode }) {
  const workosEnabled = workosClientAuthEnabled();
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [checked, setChecked] = useState(false);

  const refreshSession = useCallback(async () => {
    if (!workosEnabled) {
      try {
        const legacy = await fetch("/api/auth/session").then((r) => r.json());
        setSession(
          legacy.authenticated && legacy.session ? (legacy.session as DashboardSession) : null
        );
      } catch {
        setSession(null);
      }
      return;
    }
    const payload = await fetchDashboardSession();
    setSession(payload);
  }, [workosEnabled]);

  const signOut = useCallback(async () => {
    if (workosEnabled) {
      await fetch("/api/dashboard/me", { method: "DELETE" });
    } else {
      await fetch("/api/auth/session", { method: "DELETE" });
    }
    setSession(null);
    window.location.reload();
  }, [workosEnabled]);

  useEffect(() => {
    refreshSession().finally(() => setChecked(true));
  }, [refreshSession]);

  const value = useMemo(
    () => ({ session, checked, workosEnabled, refreshSession, signOut }),
    [session, checked, workosEnabled, refreshSession, signOut]
  );

  return (
    <DashboardSessionContext.Provider value={value}>{children}</DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const ctx = useContext(DashboardSessionContext);
  if (!ctx) {
    throw new Error("useDashboardSession must be used within DashboardSessionProvider");
  }
  return ctx;
}
