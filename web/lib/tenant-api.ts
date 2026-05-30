import { qtanglApiBaseUrl } from "@/lib/api";

const STORAGE_KEY = "qtangl-dashboard-api-key";

export type TenantScanSummary = {
  scanId: string;
  status: string;
  error: string | null;
  scenarioId: string | null;
  createdAt: string;
  updatedAt: string;
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

export function tenantReportUrl(scanId: string, apiKey: string, format: "pdf" | "json" = "pdf"): string {
  const url = new URL(`${qtanglApiBaseUrl}/tenant/scans/${scanId}/report`);
  url.searchParams.set("format", format);
  url.searchParams.set("api_key", apiKey);
  return url.toString();
}
