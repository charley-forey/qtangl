# SIG Lite — pre-answered responses (draft)

**Version:** 0.1 · **Last updated:** 2026-06-10

## Organization

**Company legal name:** Qtangl Inc. (update when incorporated)  
**Primary contact:** charley@qtangl.com  
**Trust center:** https://www.qtangl.com/trust

## Security program

- Documented policies (v0.1): employee security, access control, log redaction, backup runbook.
- Vulnerability disclosure: /trust/disclosure, 2 business day acknowledgement SLA.
- Dependency and secret scanning in CI (pip-audit, npm audit, gitleaks, CodeQL).

## Data protection

- Tenant isolation via Postgres RLS and hashed API keys.
- Encryption in transit (TLS); integration secrets encrypted with Fernet when configured.
- Default retention 12 months; deletion via API.

## Sub-processors

- Railway, Vercel, Stripe, Resend, optional PostHog/OpenAI — see /trust/subprocessors.
- Railway SOC 2 Type II available under NDA (subprocessor evidence only).

## Certifications

- Qtangl SOC 2 Type I: observation in progress — **not certified**.
- Independent pen test: scoped; executive summary under NDA when complete.

## Availability

- Daily production-smoke.yml and /health/ready monitoring.
- Backup: evidence-backup.yml (when PROD_DATABASE_URL configured).

See also: security-questionnaire-faq.md, caiq-lite-responses.md.
