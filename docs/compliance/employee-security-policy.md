# Employee security policy (v0.1 draft)

**Status:** Draft — founder-signed pending counsel review  
**Effective:** 2026-06-10  
**Owner:** Founder / CEO

## Purpose

Protect Qtangl customer data, platform integrity, and company assets.

## Acceptable use

- Use company systems for authorized business purposes only.
- Do not store production secrets in personal notes, chat, or unapproved tools.
- Report suspected incidents to charley@qtangl.com with subject `[SECURITY]` within 24 hours.

## Access control

- MFA required on GitHub, Railway, Vercel, Stripe, and email.
- Production access limited to named individuals in `docs/compliance/access-control-matrix.md`.
- Unique credentials per environment; no shared admin keys with tenant API keys.

## Device and endpoint

- Full-disk encryption on devices accessing production.
- OS and browser kept current; no jailbroken/rooted devices for prod access.

## Data handling

- Customer scan data is confidential; no copying to personal accounts.
- Follow log redaction policy (`docs/compliance/log-redaction-policy.md`).

## Training

- Annual review of this policy and incident response runbook.

## Acknowledgment

| Name | Role | Date |
|------|------|------|
| | Founder | |

See also: `docs/compliance/soc2-type1-kickoff.md`, `roadmap/optimization_OLD_FUTURE/security/secrets-runbook.md`.
