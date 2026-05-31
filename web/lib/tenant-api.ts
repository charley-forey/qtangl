import { qtanglApiBaseUrl } from "@/lib/api";

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
  notifyEmail: string | null;
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

export async function fetchTenantJson<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${qtanglApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed (${response.status})`);
  }
  const payload = (await response.json()) as T & { status?: string };
  return payload;
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
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export function tenantReportUrl(scanId: string, apiKey: string, format: "pdf" | "json" | "bundle" = "pdf"): string {
  const url = new URL(`${qtanglApiBaseUrl}/tenant/scans/${scanId}/report`);
  url.searchParams.set("format", format);
  url.searchParams.set("api_key", apiKey);
  return url.toString();
}
