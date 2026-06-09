import { defineEndpoint, ROLE_ADMIN, ROLE_PUBLIC } from "@/lib/docs/endpoint-factory";
import type { DocsEndpoint } from "@/lib/docs/types";

export const adminEndpoints: Record<string, DocsEndpoint> = {
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
        name: "slug",
        type: "string",
        required: true,
        description: "Unique tenant slug used in internal routing and auditing.",
        example: "acme-bank-emea",
      },
    ],
    examples: [
      {
        label: "Create tenant",
        request: { name: "Acme Bank - EMEA", slug: "acme-bank-emea" },
        response: { status: "success", tenant_id: "ten_01J9W7Q9N4", created: true },
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
