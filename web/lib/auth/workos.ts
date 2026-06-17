export function workosAuthEnabled(): boolean {
  return (
    process.env.QTANGL_DASHBOARD_AUTH_WORKOS === "true" &&
    Boolean(process.env.WORKOS_API_KEY && process.env.WORKOS_CLIENT_ID)
  );
}

/** All env vars AuthKit middleware needs — missing any one causes MIDDLEWARE_INVOCATION_FAILED. */
export function workosAuthKitReady(): boolean {
  if (!workosAuthEnabled()) {
    return false;
  }
  const cookiePassword = process.env.WORKOS_COOKIE_PASSWORD ?? "";
  if (cookiePassword.length < 32) {
    return false;
  }
  return Boolean(process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim());
}

export function workosAuthKitMissing(): string[] {
  const missing: string[] = [];
  if (process.env.QTANGL_DASHBOARD_AUTH_WORKOS !== "true") {
    missing.push("QTANGL_DASHBOARD_AUTH_WORKOS");
  }
  if (!process.env.WORKOS_API_KEY) {
    missing.push("WORKOS_API_KEY");
  }
  if (!process.env.WORKOS_CLIENT_ID) {
    missing.push("WORKOS_CLIENT_ID");
  }
  if ((process.env.WORKOS_COOKIE_PASSWORD ?? "").length < 32) {
    missing.push("WORKOS_COOKIE_PASSWORD");
  }
  if (!process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI?.trim()) {
    missing.push("NEXT_PUBLIC_WORKOS_REDIRECT_URI");
  }
  return missing;
}

export function legacyKeyAuthEnabled(): boolean {
  return process.env.QTANGL_DASHBOARD_AUTH_LEGACY_KEY !== "false";
}

export function dashboardRequireSso(): boolean {
  return process.env.QTANGL_DASHBOARD_REQUIRE_SSO === "true";
}

export function appBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.QTANGL_PUBLIC_URL || "http://localhost:3000";
}

export function workosRedirectUri(): string {
  return `${appBaseUrl().replace(/\/$/, "")}/auth/callback`;
}

export function bffSessionSecret(): string | undefined {
  return process.env.QTANGL_BFF_SESSION_SECRET;
}

export function qtanglApiBaseUrlServer(): string {
  const raw = process.env.NEXT_PUBLIC_QTANGL_API_BASE_URL || "http://127.0.0.1:8000";
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\/+$/, "");
}

/** @deprecated Use WorkOS org mapping instead of env tenant map. */
export function oidcConfigured(): boolean {
  return Boolean(
    process.env.AUTH_OIDC_ISSUER &&
      process.env.AUTH_OIDC_CLIENT_ID &&
      process.env.AUTH_OIDC_CLIENT_SECRET
  );
}

/** @deprecated Migrate to WorkOS per-tenant auth_mode. */
export function mapEmailToTenant(email: string): { tenantId: string; role: string } {
  const defaultTenant = process.env.AUTH_OIDC_DEFAULT_TENANT_ID || "sandbox";
  const defaultRole = process.env.AUTH_OIDC_DEFAULT_ROLE || "viewer";
  const raw = process.env.AUTH_OIDC_TENANT_MAP;
  if (raw) {
    try {
      const map = JSON.parse(raw) as Record<string, { tenantId: string; role?: string }>;
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && map[domain]) {
        return {
          tenantId: map[domain].tenantId,
          role: map[domain].role || defaultRole,
        };
      }
      if (map[email]) {
        return { tenantId: map[email].tenantId, role: map[email].role || defaultRole };
      }
    } catch {
      /* ignore malformed map */
    }
  }
  return { tenantId: defaultTenant, role: defaultRole };
}

export const SESSION_ASSERTION_COOKIE = "qtangl_session_assertion";
/** Short-lived dashboard API credential minted at bootstrap (fallback when assertion cookie absent). */
export const SESSION_KEY_COOKIE = "qtangl_session_key";
export const ACTIVE_TENANT_COOKIE = "qtangl_active_tenant";
