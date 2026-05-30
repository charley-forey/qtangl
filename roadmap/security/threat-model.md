# Threat Model v1 (Stub)

**Status:** Draft — complete as part of epic G2  
**Owner:** Security track  
**Related:** [11-track-G-security-trust-compliance.md](../11-track-G-security-trust-compliance.md)

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| FastAPI backend (all routers) | Customer internal networks |
| PQC live scanner | Physical data center security |
| File upload endpoints | Employee endpoint devices |
| Multi-tenant data stores (target) | DDoS at CDN edge (Vercel) |

---

## Assets

| Asset | Sensitivity |
|-------|-------------|
| API keys / tenant credentials | Critical |
| PQC scan results / CBOM | High |
| Hospital rosters (PHI) | Critical |
| QUBO snapshots / audit packs | High |
| QPU traces / fixtures | Low |

---

## Trust boundaries

See diagram in [04-architecture-blueprint.md](../04-architecture-blueprint.md).

---

## Threat inventory (to complete in G2)

| ID | Threat | Component | Existing control | Gap |
|----|--------|-----------|------------------|-----|
| TH-001 | SSRF via live scan | PQC scanner | `assert_scannable` in `backend/app/pqc/safety.py` | Worker isolation |
| TH-002 | Cross-tenant data read | API + DB | Single shared key today | G3 tenant isolation |
| TH-003 | Malicious PEM/CSV upload | Upload endpoints | Size limits partial | Formal sandbox |
| TH-004 | API key brute force | Auth | Rate limit partial | Per-tenant limits |
| TH-005 | PHI in application logs | All verticals | Not formalized | Log redaction |
| TH-006 | Secrets in git | Dev process | .gitignore | gitleaks CI (I1) |

---

## Action: complete G2-001 through G2-003 in [action-items.md](../backlog/action-items.md)
