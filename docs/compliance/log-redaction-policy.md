# Log redaction policy (G9)

**Status:** v0.1  
**Owner:** Engineering

## Principles

- Do not log API keys, bearer tokens, or raw report bodies containing customer secrets.
- Scan targets and metadata may appear in structured logs at INFO; PII/PHI fields must be redacted or omitted.

## Implementation

- Audit log stores tenant actions without raw credentials.
- Application logs: redact `Authorization` headers; truncate large payloads.
- Exception: signed report hashes and scan IDs are allowed for verify/debug.

## HIPAA / regulated tenants

When processing PHI: disable PostHog/OpenAI for tenant; ensure email alerts contain minimal metadata.

See threat model TH-005 in `roadmap/optimization_OLD_FUTURE/security/threat-model.md`.
