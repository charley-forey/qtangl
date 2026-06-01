export function oidcConfigured(): boolean {
  return Boolean(
    process.env.AUTH_OIDC_ISSUER &&
      process.env.AUTH_OIDC_CLIENT_ID &&
      process.env.AUTH_OIDC_CLIENT_SECRET
  );
}

export function dashboardRequireSso(): boolean {
  return process.env.QTANGL_DASHBOARD_REQUIRE_SSO === "true";
}

export function appBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.QTANGL_PUBLIC_URL || "http://localhost:3000";
}

export function oidcRedirectUri(): string {
  return `${appBaseUrl().replace(/\/$/, "")}/api/auth/oidc/callback`;
}

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
