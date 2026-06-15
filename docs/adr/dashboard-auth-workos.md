# ADR: Dashboard human auth via WorkOS

## Status

Accepted — 2026-06

## Context

Qtangl dashboard access today relies on pasting long-lived tenant API keys into browser `sessionStorage`, plus an optional env-mapped OIDC flow. This does not support org invites, role-based human access, enterprise SSO, or MSSP multi-org switching without sharing secrets.

## Decision

Adopt **WorkOS** (AuthKit + Organizations + User Management + SSO) for **human** dashboard authentication. Keep **long-lived API keys** (`ApiKey` table) for automation/CI only.

### Two auth planes

1. **Human** — WorkOS session → Next.js BFF → short-lived session key or BFF HMAC → FastAPI
2. **Machine** — `qtangl_…` API keys unchanged

### Mapping

- WorkOS Organization ↔ Qtangl `Tenant` (`workos_org_id`)
- WorkOS membership ↔ `TenantMembership` cache (roles: admin / operator / viewer)
- Onboarding emails → login/invite URL (not raw API key in email when `QTANGL_ONBOARDING_V2=true`)

## Consequences

- Deprecate env-based `AUTH_OIDC_*` and `AUTH_OIDC_TENANT_MAP` (one release overlap)
- Deprecate `TenantOidcConfig` for new customers; migrate to WorkOS Admin Portal
- `QTANGL_DASHBOARD_AUTH_LEGACY_KEY=true` allows key paste during migration
- SCIM deferred to post-R1
- Password auth out of scope

## Alternatives considered

- Native magic link + SMTP only — rejected for enterprise SSO/MSSP invite burden
- Clerk/Auth0 — rejected; WorkOS chosen for B2B org + SSO focus
