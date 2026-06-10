# NIST SP 800-171 gap assessment (draft)

**Version:** 0.1 · **Last updated:** 2026-06-10  
**Status:** Gap mapping only — C3PAO assessment not completed.

## Scope boundary

Qtangl SaaS stores **cryptographic inventory metadata** for customer scan targets — not customer CUI by default. Narrow data boundary in MSA before any CUI-handling pilot.

## Existing controls mapped

| 800-171 family | Qtangl control | Status |
|----------------|----------------|--------|
| AC — Access control | Tenant API keys, RLS, MFA on admin consoles | Partial |
| AU — Audit | Tenant audit log, CI evidence export | Partial |
| CM — Configuration | GitHub PR + CI, Railway/Vercel config | Partial |
| IA — Identification | Hashed keys, admin API key separation | Partial |
| IR — Incident response | /docs/trust/incident-response, disclosure policy | Draft |
| MA — Maintenance | Dependabot, staged deploys | Partial |
| MP — Media protection | Postgres encryption at rest (Railway) | Partial |
| SC — System comms | TLS, SSRF allowlist | Implemented |
| SI — System integrity | Signed reports, transparency log | Implemented |

## Gaps (representative)

- Formal SSP (System Security Plan) document — not started
- C3PAO assessment — not scheduled
- US-only deployment default for gov tenants — policy draft needed
- PostHog/OpenAI disable for CUI tenants — product config needed

## Trust center language

> NIST 800-171 control mapping available on request. CMMC assessment not completed. Qtangl helps customers with crypto inventory evidence — we do not attest customer CMMC status.

See [government-defense.md](../quantum-readiness/vertical-playbooks/government-defense.md).
