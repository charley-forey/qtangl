import { defineEndpoint, ROLE_ADMIN, ROLE_PUBLIC } from "@/lib/docs/endpoint-factory";
import type { DocsEndpoint } from "@/lib/docs/types";

export const adminEndpoints: Record<string, DocsEndpoint> = {
  "admin-platform-summary": defineEndpoint("admin-platform-summary", {
    method: "GET",
    path: "/admin/platform/summary",
    summary: "Platform-wide tenant, user, and scan totals for ops dashboards.",
    role: ROLE_ADMIN,
    examples: [
      {
        label: "Platform summary",
        response: {
          status: "success",
          totals: { tenants: 42, users: 128, scansLast30Days: 310, signupsLast7Days: 3, signupsLast30Days: 11 },
          tierBreakdown: { monitor: 30, convert: 8, enterprise: 4 },
          schedulerEnabled: true,
        },
      },
    ],
  }),
  "admin-tenants-list": defineEndpoint("admin-tenants-list", {
    method: "GET",
    path: "/admin/tenants",
    summary: "Paginated tenant directory with usage signals for ops search and export.",
    role: ROLE_ADMIN,
    queryParams: [
      { name: "search", type: "string", required: false, description: "Filter by tenant ID or name." },
      { name: "tier", type: "string", required: false, description: "Filter by subscription tier." },
      { name: "limit", type: "number", required: false, default: "50", description: "Page size (1–200)." },
      { name: "offset", type: "number", required: false, default: "0", description: "Pagination offset." },
    ],
    pagination: true,
    examples: [
      {
        label: "List tenants",
        response: {
          status: "success",
          total: 2,
          limit: 50,
          offset: 0,
          tenants: [
            {
              tenantId: "acme-bank",
              name: "Acme Bank",
              tier: "monitor",
              memberCount: 5,
              scansThisMonth: 12,
              scheduleCount: 1,
              assessPaid: false,
              orgType: "customer",
              lastScanAt: "2026-06-18T14:22:00Z",
              createdAt: "2026-05-01T09:00:00Z",
            },
          ],
        },
      },
    ],
  }),
  "admin-tenants-get": defineEndpoint("admin-tenants-get", {
    method: "GET",
    path: "/admin/tenants/{tenant_id}",
    summary: "Full tenant detail: subscription, settings, memberships, keys, and recent scans.",
    role: ROLE_ADMIN,
    examples: [
      {
        label: "Tenant detail",
        response: {
          status: "success",
          tenantId: "acme-bank",
          name: "Acme Bank",
          subscription: { tier: "monitor" },
          settings: { scanAllowlist: ["acmebank.com"], orgType: "customer", msspParentTenantId: null },
          memberships: [{ email: "security@acmebank.com", role: "admin" }],
          apiKeys: [{ keyId: "key_01", label: "automation", revoked: false }],
        },
      },
    ],
  }),
  "admin-tenants-patch": defineEndpoint("admin-tenants-patch", {
    method: "PATCH",
    path: "/admin/tenants/{tenant_id}",
    summary: "Update tenant subscription tier (free, monitor, convert, enterprise).",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "tier",
        type: '"free" | "monitor" | "convert" | "enterprise"',
        required: true,
        description: "New subscription tier.",
        example: "convert",
      },
    ],
    examples: [
      {
        label: "Upgrade tier",
        request: { tier: "convert" },
        response: { status: "success", tenantId: "acme-bank", tier: "convert" },
      },
    ],
  }),
  "admin-tenants-create": defineEndpoint("admin-tenants-create", {
    method: "POST",
    path: "/admin/tenants",
    summary: "Create a tenant workspace with default billing, policy, and key management settings.",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Display name for the tenant organization.",
        example: "Acme Bank - EMEA",
      },
      {
        name: "tenantId",
        type: "string",
        required: false,
        description: "Optional stable tenant ID slug; auto-generated if omitted.",
        example: "acme-bank-emea",
      },
      {
        name: "tier",
        type: '"free" | "monitor" | "convert" | "enterprise"',
        required: false,
        default: "monitor",
        description: "Initial subscription tier.",
      },
    ],
    examples: [
      {
        label: "Create tenant",
        request: { name: "Acme Bank - EMEA", tenantId: "acme-bank-emea", tier: "monitor" },
        response: {
          tenantId: "acme-bank-emea",
          name: "Acme Bank - EMEA",
          subscription: { tier: "monitor" },
        },
      },
    ],
  }),
  "admin-authorized-domains": defineEndpoint("admin-authorized-domains", {
    method: "PUT",
    path: "/admin/tenants/{tenant_id}/authorized-domains",
    summary: "Replace tenant scan allowlist (authorized domains) with audit attestation.",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "domains",
        type: "string[]",
        required: true,
        description: "Domain names permitted for scanning.",
        example: '["acmebank.com", "acmebank.eu"]',
      },
      {
        name: "attestation",
        type: "string",
        required: false,
        default: "Sales-led provisioning",
        description: "Ops attestation recorded in audit log.",
      },
    ],
    examples: [
      {
        label: "Set authorized domains",
        request: { domains: ["acmebank.com"], attestation: "Customer contract signed 2026-06-01" },
        response: { status: "success", tenantId: "acme-bank", domains: ["acmebank.com"] },
      },
    ],
  }),
  "admin-mssp-parent": defineEndpoint("admin-mssp-parent", {
    method: "PUT",
    path: "/admin/tenants/{tenant_id}/mssp-parent",
    summary: "Link a child tenant to an MSSP/enterprise parent for portfolio views.",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "parentTenantId",
        type: "string",
        required: true,
        description: "Parent tenant ID to link under.",
        example: "mssp-partner-01",
      },
    ],
    examples: [
      {
        label: "Link MSSP parent",
        request: { parentTenantId: "mssp-partner-01" },
        response: { status: "success", tenantId: "acme-bank", msspParentTenantId: "mssp-partner-01" },
      },
    ],
  }),
  "admin-tenant-settings": defineEndpoint("admin-tenant-settings", {
    method: "PUT",
    path: "/admin/tenants/{tenant_id}/settings",
    summary: "Merge tenant settings JSON (orgType, salesLed, remediation flags, etc.).",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "settings",
        type: "object",
        required: true,
        description: "Partial settings object merged into existing tenant settings.",
        example: '{ "orgType": "mssp", "salesLed": true }',
      },
    ],
    examples: [
      {
        label: "Merge settings",
        request: { settings: { orgType: "mssp", remediationProgramEnabled: true } },
        response: {
          status: "success",
          tenantId: "acme-bank",
          settings: { orgType: "mssp", remediationProgramEnabled: true },
        },
      },
    ],
  }),
  "admin-users-list": defineEndpoint("admin-users-list", {
    method: "GET",
    path: "/admin/users",
    summary: "Cross-tenant user directory with membership counts for ops support.",
    role: ROLE_ADMIN,
    queryParams: [
      { name: "search", type: "string", required: false, description: "Filter by email." },
      { name: "limit", type: "number", required: false, default: "50", description: "Page size (1–200)." },
      { name: "offset", type: "number", required: false, default: "0", description: "Pagination offset." },
    ],
    pagination: true,
    examples: [
      {
        label: "List users",
        response: {
          status: "success",
          total: 1,
          users: [{ userId: "usr_01", email: "security@acmebank.com", membershipCount: 1 }],
        },
      },
    ],
  }),
  "admin-analytics-funnel": defineEndpoint("admin-analytics-funnel", {
    method: "GET",
    path: "/admin/analytics/funnel",
    summary: "Golden-path funnel snapshot (signup → scan → paid → schedule → verify → board export).",
    role: ROLE_ADMIN,
    queryParams: [
      { name: "days", type: "number", required: false, default: "30", description: "Lookback window (1–365 days)." },
    ],
    examples: [
      {
        label: "30-day funnel",
        response: {
          status: "success",
          days: 30,
          funnel: [
            { stage: "signup", count: 20, conversionPct: null },
            { stage: "first_scan", count: 15, conversionPct: 75.0 },
          ],
          totals: { tenants: 20 },
        },
      },
    ],
  }),
  "admin-keys-issue": defineEndpoint("admin-keys-issue", {
    method: "POST",
    path: "/admin/tenants/{tenant_id}/keys",
    summary: "Issue a new API key for a tenant with scoped role and optional expiry.",
    role: ROLE_ADMIN,
    requestFields: [
      {
        name: "label",
        type: "string",
        required: true,
        description: "Human-readable key label for inventory and audits.",
        example: "staging-ci",
      },
      {
        name: "role",
        type: '"viewer" | "operator" | "admin"',
        required: false,
        default: "operator",
        description: "Role bound to the issued API key.",
      },
    ],
    examples: [
      {
        label: "Issue operator key",
        request: { label: "staging-ci", role: "operator" },
        response: {
          status: "success",
          key_id: "key_01J9W7T8EJ",
          api_key: "qt_live_****************",
          role: "operator",
        },
      },
    ],
  }),
  "admin-keys-list": defineEndpoint("admin-keys-list", {
    method: "GET",
    path: "/admin/tenants/{tenant_id}/keys",
    summary: "List active and revoked API keys for a tenant.",
    role: ROLE_ADMIN,
    examples: [
      {
        label: "List tenant keys",
        response: {
          status: "success",
          total: 2,
          keys: [{ key_id: "key_01J9W7T8EJ", label: "staging-ci", role: "operator", revoked: false }],
        },
      },
    ],
  }),
  "admin-keys-revoke": defineEndpoint("admin-keys-revoke", {
    method: "DELETE",
    path: "/admin/keys/{key_id}",
    summary: "Revoke an API key immediately and invalidate future requests.",
    role: ROLE_ADMIN,
    examples: [
      {
        label: "Revoke key",
        response: { status: "success", key_id: "key_01J9W7T8EJ", revoked: true },
      },
    ],
  }),
};

export const publicEndpoints: Record<string, DocsEndpoint> = {
  "public-monitor-signup": defineEndpoint("public-monitor-signup", {
    method: "POST",
    path: "/public/monitor-signup",
    summary: "Capture initial monitor waitlist intent and contact details.",
    auth: false,
    role: ROLE_PUBLIC,
    requestFields: [
      {
        name: "email",
        type: "string",
        required: true,
        description: "Work email used for launch communications.",
        example: "security@acmebank.com",
      },
    ],
    examples: [
      {
        label: "Signup capture",
        request: { email: "security@acmebank.com", company: "Acme Bank" },
        response: { status: "success", queued: true },
      },
    ],
  }),
  "public-monitor-provision": defineEndpoint("public-monitor-provision", {
    method: "POST",
    path: "/public/monitor-provision",
    summary: "Provision a starter monitor profile from a validated signup.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Provision monitor profile",
        request: { email: "security@acmebank.com", domains: ["acmebank.com"] },
        response: { status: "success", monitor_id: "mon_01J9W80Y0C", provisioned: true },
      },
    ],
  }),
  "public-lead-capture": defineEndpoint("public-lead-capture", {
    method: "POST",
    path: "/public/lead-capture",
    summary: "Record marketing lead submissions from product and campaign forms.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Capture lead",
        request: { email: "platform@acme.com", source: "docs-cta", interest: "pqc-readiness" },
        response: { status: "success", lead_id: "lead_01J9W84F6X" },
      },
    ],
  }),
  "public-unsubscribe": defineEndpoint("public-unsubscribe", {
    method: "POST",
    path: "/public/unsubscribe",
    summary: "Unsubscribe an email address from monitor and GTM mailing flows.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Unsubscribe email",
        request: { email: "security@acmebank.com", reason: "no-longer-relevant" },
        response: { status: "success", unsubscribed: true },
      },
    ],
  }),
  "public-onboarding-key": defineEndpoint("public-onboarding-key", {
    method: "GET",
    path: "/public/onboarding-key/{token}",
    summary: "Validate onboarding token and return key bootstrap metadata.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Resolve token",
        response: {
          status: "success",
          token_valid: true,
          tenant_id: "ten_01J9W7Q9N4",
          expires_at: "2026-06-16T17:00:00Z",
        },
      },
    ],
  }),
  "public-assess-signup": defineEndpoint("public-assess-signup", {
    method: "POST",
    path: "/public/assess-signup",
    summary: "Self-serve assess signup: capture email and provision starter tenant access.",
    auth: false,
    role: ROLE_PUBLIC,
    requestFields: [
      { name: "email", type: "string", required: true, description: "Work email for tenant provisioning." },
      { name: "company", type: "string", required: false, description: "Organization name." },
    ],
    examples: [
      {
        label: "Assess signup",
        request: { email: "security@acme.com", company: "Acme Corp" },
        response: { status: "success", provisioned: true },
      },
    ],
  }),
  "public-workos-webhook": defineEndpoint("public-workos-webhook", {
    method: "POST",
    path: "/public/workos/webhook",
    summary: "Receive WorkOS directory-sync and SSO lifecycle webhook events.",
    auth: false,
    role: ROLE_PUBLIC,
    notes: ["Requires WorkOS webhook signature verification."],
    examples: [{ label: "Webhook event", response: { status: "success", accepted: true } }],
  }),
  "public-stripe-webhook": defineEndpoint("public-stripe-webhook", {
    method: "POST",
    path: "/public/stripe-webhook",
    summary: "Receive Stripe webhook events for billing lifecycle synchronization.",
    auth: false,
    role: ROLE_PUBLIC,
    notes: ["Requires Stripe signature verification via the Stripe-Signature header."],
    examples: [
      {
        label: "Invoice paid event",
        request: { id: "evt_1Q...", type: "invoice.paid", data: { object: { customer: "cus_123" } } },
        response: { status: "success", accepted: true },
      },
    ],
  }),
};

export const healthEndpoints: Record<string, DocsEndpoint> = {
  health: defineEndpoint("health", {
    method: "GET",
    path: "/health",
    status: "ga",
    summary: "GA liveness probe for platform uptime checks.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Healthy service", response: { status: "ok" } }],
  }),
  "health-ready": defineEndpoint("health-ready", {
    method: "GET",
    path: "/health/ready",
    summary: "Readiness probe validating service dependencies before traffic routing.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [{ label: "Ready", response: { status: "ready", database: "ok", queue: "ok" } }],
  }),
  metrics: defineEndpoint("metrics", {
    method: "GET",
    path: "/metrics",
    summary: "Public Prometheus scrape endpoint for service metrics.",
    auth: false,
    role: ROLE_PUBLIC,
    contentType: "text/plain; version=0.0.4",
    examples: [
      {
        label: "Prometheus sample",
        response:
          '# HELP http_requests_total Total HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",path="/health"} 1532',
      },
    ],
  }),
};

export const sharingEndpoints: Record<string, DocsEndpoint> = {
  "sharing-read": defineEndpoint("sharing-read", {
    method: "GET",
    path: "/r/{token}",
    summary: "Read public share metadata and high-level scan readiness overview.",
    auth: false,
    role: ROLE_PUBLIC,
    examples: [
      {
        label: "Read share",
        response: { status: "success", token: "shr_01J9W8AX3X", scope: "passport", expires_at: "2026-06-20T12:00:00Z" },
      },
    ],
  }),
  "sharing-report": defineEndpoint("sharing-report", {
    method: "GET",
    path: "/r/{token}/report",
    summary: "Download shared report artifact in PDF or evidence bundle format.",
    auth: false,
    role: ROLE_PUBLIC,
    queryParams: [
      {
        name: "format",
        type: '"pdf" | "bundle"',
        required: false,
        default: "pdf",
        description: "Report artifact format.",
      },
    ],
    examples: [
      {
        label: "Shared PDF report",
        response: { status: "success", format: "pdf", url: "https://cdn.qtangl.com/reports/shr_01J9W8AX3X.pdf" },
      },
    ],
  }),
};
