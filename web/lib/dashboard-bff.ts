"use client";

import { QtanglApiError } from "@qtangl/sdk";

export type DashboardSession = {
  email: string;
  tenantId: string;
  tenantName?: string;
  role: string;
  userId?: string;
  authMode?: string;
  memberships?: Array<{ tenantId: string; tenantName: string; role: string }>;
};

export type DashboardCapabilities = {
  canAdmin: boolean;
  canWrite: boolean;
  canViewCompliance: boolean;
  canManageKeys: boolean;
  canInvite: boolean;
};

export type DashboardOnboarding = {
  complete: boolean;
  nextStep: "baseline" | "schedule" | "invite" | "done";
};

export type DashboardMeResponse = {
  authenticated: boolean;
  authMethod?: "workos" | "legacy_oidc";
  session?: DashboardSession;
  capabilities?: DashboardCapabilities;
  onboarding?: DashboardOnboarding;
  reason?: "no_membership" | "bff_secret_missing" | "database_unavailable" | "workos_user_missing";
  workosSignedIn?: boolean;
};

let inferredWorkosAuth = false;

/** Client WorkOS mode: NEXT_PUBLIC flag or inferred from successful /api/dashboard/me. */
export function workosClientAuthEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_WORKOS === "true") {
    return true;
  }
  return inferredWorkosAuth;
}

export function setInferredWorkosAuth(enabled: boolean) {
  inferredWorkosAuth = enabled;
}

export function legacyKeyClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_QTANGL_DASHBOARD_AUTH_LEGACY_KEY !== "false";
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    let message = detail || `Dashboard request failed (${response.status})`;
    try {
      const parsed = JSON.parse(detail) as { detail?: string; message?: string; error?: string };
      message = parsed.detail ?? parsed.message ?? parsed.error ?? message;
    } catch {
      /* keep raw */
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function fetchDashboardMe(onboardingToken?: string | null): Promise<DashboardMeResponse> {
  const params = new URLSearchParams();
  const token =
    onboardingToken ||
    (typeof window !== "undefined" ? sessionStorage.getItem("qtangl_onboarding_token") : null);
  if (token) {
    params.set("onboarding", token);
  }
  const url = params.toString() ? `/api/dashboard/me?${params.toString()}` : "/api/dashboard/me";
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return { authenticated: false, reason: "workos_user_missing" };
  }
  const payload = (await response.json()) as DashboardMeResponse;
  if (payload.authenticated && payload.authMethod === "workos") {
    setInferredWorkosAuth(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("qtangl_onboarding_token");
    }
  }
  return payload;
}

export async function fetchDashboardSession(): Promise<DashboardSession | null> {
  const payload = await fetchDashboardMe();
  if (!payload.authenticated || !payload.session) {
    return null;
  }
  return payload.session;
}

export async function fetchDashboardJson<T>(path: string, init?: RequestInit): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`/api/dashboard${normalized}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  try {
    return await parseJson<T>(response);
  } catch (error) {
    if (error instanceof QtanglApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function postDashboardJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return fetchDashboardJson<T>(path, {
    method: "POST",
    ...init,
    body: JSON.stringify(body),
  });
}

export async function putDashboardJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return fetchDashboardJson<T>(path, {
    method: "PUT",
    ...init,
    body: JSON.stringify(body),
  });
}

export async function patchDashboardJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return fetchDashboardJson<T>(path, {
    method: "PATCH",
    ...init,
    body: JSON.stringify(body),
  });
}

export async function deleteDashboardJson<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchDashboardJson<T>(path, { method: "DELETE", ...init });
}

export function dashboardReportUrl(
  scanId: string,
  format: "pdf" | "json" | "bundle" | "executive" | "board" | "auditor" = "pdf"
): string {
  return `/api/dashboard/tenant/scans/${encodeURIComponent(scanId)}/report?format=${format}`;
}

export async function switchActiveTenant(tenantId: string): Promise<DashboardSession | null> {
  const response = await fetch("/api/dashboard/me", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenantId }),
  });
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as DashboardMeResponse;
  return payload.session ?? null;
}
