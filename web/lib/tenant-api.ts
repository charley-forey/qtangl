import { QtanglApiError } from "@qtangl/sdk";

import { qtanglApiBaseUrl } from "@/lib/api";
import { createQtanglClient } from "@/lib/qtangl-client";

const STORAGE_KEY = "qtangl-dashboard-api-key";

export type TenantScanSummary = {
  scanId: string;
  status: string;
  error: string | null;
  scenarioId: string | null;
  targetDomain?: string | null;
  readinessScore?: number | null;
  readinessBand?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledScan = {
  id: string;
  scenarioId: string;
  target: string | null;
  cadenceHours: number;
  nextRunAt: string | null;
  lastRunScanId: string | null;
  lastDriftSnapshotId?: string | null;
  notifyEmail: string | null;
  jobType?: string;
  integrationProvider?: string | null;
};

export function getStoredTenantApiKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function setStoredTenantApiKey(key: string): void {
  window.sessionStorage.setItem(STORAGE_KEY, key);
}

function rethrowSdkError(error: unknown): never {
  if (error instanceof QtanglApiError) {
    throw new Error(error.message);
  }
  throw error;
}

function parseBody(body: BodyInit | null | undefined): unknown {
  if (body == null) {
    return undefined;
  }
  if (typeof body === "string") {
    return JSON.parse(body);
  }
  throw new Error("Only JSON request bodies are supported via the Qtangl SDK transport.");
}

export async function fetchTenantJson<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  const client = createQtanglClient(apiKey);
  try {
    return await client.request<T>({
      method: (init?.method ?? "GET").toUpperCase(),
      path,
      body: parseBody(init?.body),
    });
  } catch (error) {
    rethrowSdkError(error);
  }
}

export async function postTenantJson<T>(
  path: string,
  apiKey: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  return fetchTenantJson<T>(path, apiKey, {
    method: "POST",
    ...init,
    body: JSON.stringify(body),
  });
}

export async function patchTenantJson<T>(
  path: string,
  apiKey: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  return fetchTenantJson<T>(path, apiKey, {
    method: "PATCH",
    ...init,
    body: JSON.stringify(body),
  });
}

export async function putTenantJson<T>(
  path: string,
  apiKey: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  return fetchTenantJson<T>(path, apiKey, {
    method: "PUT",
    ...init,
    body: JSON.stringify(body),
  });
}

export async function deleteTenantJson<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  return fetchTenantJson<T>(path, apiKey, { method: "DELETE", ...init });
}

export function tenantReportUrl(
  scanId: string,
  apiKey: string,
  format: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor" = "pdf"
): string {
  return createQtanglClient(apiKey).tenantReportUrl(scanId, format);
}

export { qtanglApiBaseUrl };
