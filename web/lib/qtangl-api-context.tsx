"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { qtanglSandboxApiKey } from "@/lib/api";
import { createBffQtanglClient, createQtanglClient } from "@/lib/qtangl-client";
import { getStoredTenantApiKey, setStoredTenantApiKey } from "@/lib/tenant-api";

export type AssessApiMode = "demo" | "production";

type QtanglApiContextValue = {
  mode: AssessApiMode;
  apiKey: string;
  client: ReturnType<typeof createQtanglClient>;
  tenantApiKey: string | null;
  useBff: boolean;
  setTenantApiKey: (key: string | null) => void;
  setMode: (mode: AssessApiMode) => void;
};

const QtanglApiContext = createContext<QtanglApiContextValue | null>(null);

export function QtanglApiProvider({
  children,
  initialMode = "demo",
  initialTenantKey,
  useBff = false,
}: {
  children: ReactNode;
  initialMode?: AssessApiMode;
  initialTenantKey?: string | null;
  useBff?: boolean;
}) {
  const [mode, setModeState] = useState<AssessApiMode>(initialMode);
  const [bffMode] = useState(useBff);
  const [tenantApiKey, setTenantApiKeyState] = useState<string | null>(
    () => (useBff ? "bff" : initialTenantKey ?? getStoredTenantApiKey())
  );

  const setTenantApiKey = useCallback((key: string | null) => {
    if (key) {
      setStoredTenantApiKey(key);
    }
    setTenantApiKeyState(key);
    if (key) {
      setModeState("production");
    }
  }, []);

  const setMode = useCallback((next: AssessApiMode) => {
    setModeState(next);
  }, []);

  const apiKey =
    mode === "production" && (bffMode || tenantApiKey)
      ? bffMode
        ? "bff"
        : (tenantApiKey as string)
      : qtanglSandboxApiKey;

  const value = useMemo(
    () => ({
      mode,
      apiKey,
      client: bffMode && mode === "production" ? createBffQtanglClient() : createQtanglClient(apiKey),
      tenantApiKey: bffMode ? "bff" : tenantApiKey,
      useBff: bffMode,
      setTenantApiKey,
      setMode,
    }),
    [mode, apiKey, bffMode, tenantApiKey, setTenantApiKey, setMode]
  );

  return <QtanglApiContext.Provider value={value}>{children}</QtanglApiContext.Provider>;
}

export function useQtanglApi(): QtanglApiContextValue {
  const ctx = useContext(QtanglApiContext);
  if (!ctx) {
    return {
      mode: "demo",
      apiKey: qtanglSandboxApiKey,
      client: createQtanglClient(qtanglSandboxApiKey),
      tenantApiKey: getStoredTenantApiKey(),
      useBff: false,
      setTenantApiKey: (key) => {
        if (key) setStoredTenantApiKey(key);
      },
      setMode: () => {},
    };
  }
  return ctx;
}

export function assessAnalyticsMode(mode: AssessApiMode): "demo" | "production" {
  return mode;
}
