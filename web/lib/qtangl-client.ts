import { QtanglClient, type QtanglClientOptions } from "@qtangl/sdk";

import { qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";

export function createQtanglClient(apiKey: string): QtanglClient {
  return new QtanglClient({
    baseUrl: qtanglApiBaseUrl,
    apiKey,
  });
}

export function createBffFetchImpl(): NonNullable<QtanglClientOptions["fetchImpl"]> {
  return async (input, init) => {
    const raw =
      typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    const parsed = new URL(raw);
    const dashboardPath = `/api/dashboard${parsed.pathname}${parsed.search}`;
    return fetch(dashboardPath, init);
  };
}

export function createBffQtanglClient(): QtanglClient {
  return new QtanglClient({
    baseUrl: qtanglApiBaseUrl,
    apiKey: "bff",
    fetchImpl: createBffFetchImpl(),
  });
}

export function createSandboxQtanglClient(): QtanglClient {
  return createQtanglClient(qtanglSandboxApiKey);
}

export function createPublicQtanglClient(): QtanglClient {
  return new QtanglClient({
    baseUrl: qtanglApiBaseUrl,
    apiKey: "public",
  });
}
