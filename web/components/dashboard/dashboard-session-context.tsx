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
import { useSearchParams } from "next/navigation";

import {
  fetchDashboardMe,
  setInferredWorkosAuth,
  workosClientAuthEnabled,
  type DashboardCapabilities,
  type DashboardMeResponse,
  type DashboardOnboarding,
  type DashboardSession,
} from "@/lib/dashboard-bff";

type DashboardSessionContextValue = {
  session: DashboardSession | null;
  checked: boolean;
  sessionReady: boolean;
  workosEnabled: boolean;
  sessionReason?: DashboardMeResponse["reason"];
  capabilities: DashboardCapabilities | null;
  onboarding: DashboardOnboarding | null;
  refreshSession: () => Promise<DashboardMeResponse>;
  signOut: () => Promise<void>;
};

const DashboardSessionContext = createContext<DashboardSessionContextValue | null>(null);

export function DashboardSessionProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionReason, setSessionReason] = useState<DashboardMeResponse["reason"]>();
  const [capabilities, setCapabilities] = useState<DashboardCapabilities | null>(null);
  const [onboarding, setOnboarding] = useState<DashboardOnboarding | null>(null);
  const [workosEnabled, setWorkosEnabled] = useState(workosClientAuthEnabled());

  const refreshSession = useCallback(async (): Promise<DashboardMeResponse> => {
    const onboardingFromUrl = searchParams.get("onboarding");
    if (onboardingFromUrl && typeof window !== "undefined") {
      sessionStorage.setItem("qtangl_onboarding_token", onboardingFromUrl);
    }
    const serverWorkos = process.env.NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_WORKOS === "true";
    if (!workosClientAuthEnabled() && !serverWorkos) {
      try {
        const legacy = await fetch("/api/auth/session").then((r) => r.json());
        const legacySession =
          legacy.authenticated && legacy.session ? (legacy.session as DashboardSession) : null;
        setSession(legacySession);
        setSessionReason(legacySession ? undefined : "workos_user_missing");
        setCapabilities(null);
        setOnboarding(null);
        setWorkosEnabled(false);
        setSessionReady(true);
        return { authenticated: Boolean(legacySession), session: legacySession ?? undefined };
      } catch {
        setSession(null);
        setSessionReason("workos_user_missing");
        setSessionReady(true);
        return { authenticated: false, reason: "workos_user_missing" };
      }
    }

    const payload = await fetchDashboardMe(onboardingFromUrl);
    if (payload.authenticated && payload.authMethod === "workos") {
      setInferredWorkosAuth(true);
      setWorkosEnabled(true);
    }
    setSession(payload.session ?? null);
    setSessionReason(payload.authenticated ? undefined : payload.reason);
    setCapabilities(payload.capabilities ?? null);
    setOnboarding(payload.onboarding ?? null);
    setSessionReady(true);
    return payload;
  }, [searchParams]);

  const signOut = useCallback(async () => {
    if (workosEnabled || workosClientAuthEnabled()) {
      await fetch("/api/dashboard/me", { method: "DELETE" });
    } else {
      await fetch("/api/auth/session", { method: "DELETE" });
    }
    setSession(null);
    setCapabilities(null);
    setOnboarding(null);
    window.location.href = "/dashboard";
  }, [workosEnabled]);

  useEffect(() => {
    refreshSession().finally(() => setChecked(true));
  }, [refreshSession]);

  useEffect(() => {
    if (searchParams.get("session") === "refresh") {
      refreshSession().finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("session");
        window.history.replaceState({}, "", url.pathname + url.search);
      });
    }
  }, [searchParams, refreshSession]);

  const value = useMemo(
    () => ({
      session,
      checked,
      sessionReady,
      workosEnabled,
      sessionReason,
      capabilities,
      onboarding,
      refreshSession,
      signOut,
    }),
    [
      session,
      checked,
      sessionReady,
      workosEnabled,
      sessionReason,
      capabilities,
      onboarding,
      refreshSession,
      signOut,
    ]
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
