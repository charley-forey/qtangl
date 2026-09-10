"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

import {
  DASHBOARD_SIGN_OUT_URL,
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
  credentialsReady: boolean;
  workosEnabled: boolean;
  sessionReason?: DashboardMeResponse["reason"];
  capabilities: DashboardCapabilities | null;
  onboarding: DashboardOnboarding | null;
  refreshSession: () => Promise<DashboardMeResponse>;
  signOut: () => void;
};

const DashboardSessionContext = createContext<DashboardSessionContextValue | null>(null);

function DashboardSessionUrlSync({
  refreshSession,
  setChecked,
}: {
  refreshSession: () => Promise<DashboardMeResponse>;
  setChecked: (checked: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    void refreshSession().finally(() => {
      setChecked(true);
      if (searchParams.get("session") === "refresh") {
        const url = new URL(window.location.href);
        url.searchParams.delete("session");
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      }
    });
  }, [searchParams, refreshSession, setChecked]);

  return null;
}

export function DashboardSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionReason, setSessionReason] = useState<DashboardMeResponse["reason"]>();
  const [capabilities, setCapabilities] = useState<DashboardCapabilities | null>(null);
  const [onboarding, setOnboarding] = useState<DashboardOnboarding | null>(null);
  const [credentialsReady, setCredentialsReady] = useState(false);
  const [workosEnabled, setWorkosEnabled] = useState(workosClientAuthEnabled());

  const refreshSession = useCallback(async (): Promise<DashboardMeResponse> => {
    const onboardingFromUrl = typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("onboarding");
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
        setCredentialsReady(Boolean(legacySession));
        setWorkosEnabled(false);
        setSessionReady(true);
        return { authenticated: Boolean(legacySession), session: legacySession ?? undefined };
      } catch {
        setSession(null);
        setSessionReason("workos_user_missing");
        setCredentialsReady(false);
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
    setCredentialsReady(payload.authenticated && payload.credentialsReady === true);
    setSessionReady(true);
    return payload;
  }, []);

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("qtangl_onboarding_token");
    }
    if (workosEnabled || workosClientAuthEnabled()) {
      window.location.href = DASHBOARD_SIGN_OUT_URL;
      return;
    }
    void fetch("/api/auth/session", { method: "DELETE" }).finally(() => {
      window.location.href = "/command-center/login";
    });
  }, [workosEnabled]);

  useEffect(() => {
    if (!session?.userId || typeof window === "undefined") return;
    const posthog = (
      window as Window & {
        posthog?: { identify: (id: string, props?: Record<string, unknown>) => void };
      }
    ).posthog;
    posthog?.identify?.(session.userId, {
      tenantId: session.tenantId,
      role: session.role,
      email: session.email,
    });
  }, [session?.userId, session?.tenantId, session?.role, session?.email]);

  const value = useMemo(
    () => ({
      session,
      checked,
      sessionReady,
      credentialsReady,
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
      credentialsReady,
      workosEnabled,
      sessionReason,
      capabilities,
      onboarding,
      refreshSession,
      signOut,
    ]
  );

  return (
    <DashboardSessionContext.Provider value={value}>
      <Suspense fallback={null}>
        <DashboardSessionUrlSync refreshSession={refreshSession} setChecked={setChecked} />
      </Suspense>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const ctx = useContext(DashboardSessionContext);
  if (!ctx) {
    throw new Error("useDashboardSession must be used within DashboardSessionProvider");
  }
  return ctx;
}
