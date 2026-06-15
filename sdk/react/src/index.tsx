"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { QtanglClient, type QtanglClientOptions } from "@qtangl/sdk";

type QtanglContextValue = {
  client: QtanglClient;
  apiKey: string;
};

const QtanglContext = createContext<QtanglContextValue | null>(null);

export type QtanglProviderProps = Omit<QtanglClientOptions, "apiKey"> & {
  apiKey: string;
  children: ReactNode;
};

export function QtanglProvider({ apiKey, baseUrl, children, maxRetries, fetchImpl }: QtanglProviderProps) {
  const client = useMemo(
    () =>
      new QtanglClient({
        baseUrl,
        apiKey,
        maxRetries,
        fetchImpl,
      }),
    [apiKey, baseUrl, maxRetries, fetchImpl]
  );

  const value = useMemo(() => ({ client, apiKey }), [client, apiKey]);

  return <QtanglContext.Provider value={value}>{children}</QtanglContext.Provider>;
}

export function useQtanglClient(): QtanglClient {
  const context = useContext(QtanglContext);
  if (!context) {
    throw new Error("useQtanglClient must be used within a QtanglProvider");
  }
  return context.client;
}

export function useQtanglApiKey(): string {
  const context = useContext(QtanglContext);
  if (!context) {
    throw new Error("useQtanglApiKey must be used within a QtanglProvider");
  }
  return context.apiKey;
}

export function useQtanglContext(): QtanglContextValue {
  const context = useContext(QtanglContext);
  if (!context) {
    throw new Error("useQtanglContext must be used within a QtanglProvider");
  }
  return context;
}
