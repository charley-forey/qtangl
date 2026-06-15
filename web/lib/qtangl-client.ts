import { QtanglClient } from "@qtangl/sdk";

import { qtanglApiBaseUrl, qtanglSandboxApiKey } from "@/lib/api";

export function createQtanglClient(apiKey: string): QtanglClient {
  return new QtanglClient({
    baseUrl: qtanglApiBaseUrl,
    apiKey,
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
