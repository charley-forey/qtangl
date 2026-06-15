# Changelog

All notable changes to the Qtangl platform. Public-facing release notes also appear at [/docs/resources/changelog](https://www.qtangl.com/docs/resources/changelog).

## [0.9.0] — 2026-06-08

### Added

- Multi-tenant Postgres persistence with row-level security (RLS) and cross-tenant isolation tests
- Admin API (`/admin/*`) for tenant and API key lifecycle (`QTANGL_ADMIN_API_KEY`)
- Stripe Monitor self-serve provisioning with one-time onboarding key tokens (24h TTL)
- Evidence vault retention, list, purge lifecycle, and tenant `/tenant/evidence` API
- OIDC SSO configuration per tenant (`GET/PUT /tenant/oidc`)
- Transparency log, signed reports, and `qtangl-verify` PyPI package for offline verification
- Compliance kickoff docs: SOC 2 Type I, legal review, contracts/insurance, pen-test scope
- Staging conversion smoke workflow (`staging-smoke.yml`)
- GTM templates: `demos/pqc_migration/crm-log.md`, `docs/gtm/weekly-kpi-review.md`

### Changed

- API version bumped to `0.9.0` in OpenAPI metadata
- Primary assessment UI at `/assess` (legacy `/demo/pqc` redirects)
- PDF report footer includes `pip install qtangl-verify` verification instructions
- CI runs dashboard Playwright e2e when `dashboard.spec.ts` exists

### Security

- Welcome email uses secure onboarding link only — no plaintext API key in email body
- Expanded test coverage: admin API, onboarding tokens, OIDC smoke, evidence vault lifecycle

## [0.2.0-pilot] — 2026-05-28

- PQC migration endpoints under `/pqc/*` with fixture and live scan modes
- Mosca HNDL risk scoring, CycloneDX CBOM export, ML-KEM handshake proof
- Interactive `/demo/pqc` command center and API reference docs

## [0.1.0] — 2026-05-27

- Full-platform documentation with grouped navigation, search, and per-endpoint reference
- JSON Schema viewer sourced from backend contracts
- Roadmap and changelog pages
