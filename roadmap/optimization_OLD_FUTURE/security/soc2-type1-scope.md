# SOC 2 Type I — observation scope (starter)

**Status:** observation planning — not certified.

## Trust service criteria in scope

- Security (CC series)
- Availability (A1) — API + worker uptime
- Confidentiality (C1) — tenant isolation, encrypted credentials

## Evidence collection

- Access control: API keys hashed, admin separation
- Change management: GitHub CI, Alembic migrations
- Monitoring: `/health/ready`, worker scheduler logs, webhook DLQ
- Vendor management: sub-processors list at `/trust/subprocessors`

## Next steps

1. Select auditor / compliance automation (Vanta, Drata)
2. Map controls to [12-platform-security-and-trust.md](../../quantum-readiness/12-platform-security-and-trust.md)
3. 90-day observation window before Type I report
