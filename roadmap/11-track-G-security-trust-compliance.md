# 11 — Track G: Security, Trust & Compliance

Internal security posture and compliance roadmap. **Gate:** No regulated-data pilots until G1–G3 minimum complete.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| G1 | Secrets management & hygiene | `in-progress` | S | — |
| G2 | Product threat model | `not-started` | M | — |
| G3 | Per-tenant auth & data isolation | `not-started` | M | D1 |
| G4 | Data governance & retention | `not-started` | M | G3 |
| G5 | SOC 2 Type I → Type II | `not-started` | L | G1–G4 |
| G6 | Vertical compliance (HIPAA, CMMC, FedRAMP path) | `not-started` | L | G5 |
| G7 | Dogfood PQC (Qtangl secures Qtangl) | `not-started` | S | B1 |
| G8 | Responsible disclosure program | `not-started` | S | — |

---

## G1 — Secrets management & hygiene

### Immediate actions

| Item | Status | Action |
|------|--------|--------|
| `.env` at repo root | Gitignored ✅ | Rotate tokens if real/shared; never commit |
| `QTANGL_API_KEY` in production | Single shared key | Replace with per-tenant keys (G3) |
| Railway/Vercel secrets | Manual | Document in runbook; use platform secret stores |
| IBM token `QISKIT_IBM_TOKEN` | Optional | Scope to offline trace capture only |

### Target state

- **Local dev:** `.env` + `.env.example` (no secrets in example)
- **Staging/prod:** Railway/Vercel env vars or AWS Secrets Manager
- **Rotation policy:** API keys 90 days; QPU tokens 30 days
- **Scanning:** `gitleaks` or GitHub secret scanning in CI (Track I)

### Acceptance criteria

- [x] `.env.example` committed with placeholder values only
- [x] gitleaks CI job passes (with `.gitleaks.toml` for doc placeholders)
- [x] Runbook: secret rotation procedure documented → [security/secrets-runbook.md](./security/secrets-runbook.md)
- [ ] Live-looking tokens in local `.env` rotated if they were ever shared (G1-001 — manual)

---

## G2 — Product threat model

### Scope

Document threats for:
1. PQC live scanner (SSRF, port scan abuse, data exfil)
2. File upload endpoints (roster, PEM bundle, crew CSV)
3. API authentication bypass
4. Multi-tenant data leakage

### Existing controls

| Control | Location |
|---------|----------|
| SSRF allowlist | [backend/app/pqc/safety.py](../backend/app/pqc/safety.py) — `assert_scannable` |
| Scan timeout | `QTANGL_PQC_SCAN_TIMEOUT` |
| Max endpoints | `QTANGL_PQC_MAX_ENDPOINTS` |
| API key auth | [backend/app/auth.py](../backend/app/auth.py) |
| Live scan gate | `QTANGL_PQC_ENABLE_LIVE_SCAN` |
| CORS | [backend/app/main.py](../backend/app/main.py) |

### Threat model deliverable

New doc: `roadmap/security/threat-model.md` (or section in this track)

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| SSRF to internal network | Medium | High | assert_scannable + isolated workers |
| Tenant A reads Tenant B scan | Medium | Critical | Row-level isolation (G3) |
| Malicious PEM upload | Low | Medium | Size limits, parse sandbox |
| API key brute force | Medium | Medium | Rate limit + key rotation |
| PHI in logs | Medium | Critical | Redact roster fields in structured logs |

### Acceptance criteria

- [ ] Threat model document reviewed
- [ ] All High threats have implemented mitigations or tracked epics
- [ ] Pen test scoped for pre-Series A

---

## G3 — Per-tenant auth & data isolation

### Approach

1. Replace single `QTANGL_API_KEY` with `tenant_id` + hashed key table in Postgres
2. Every query scoped: `WHERE tenant_id = :current_tenant`
3. Admin API for key issuance/revocation
4. Web: tenant login (Track H) maps to API key

### Files

| File | Change |
|------|--------|
| [backend/app/auth.py](../backend/app/auth.py) | Multi-key validation |
| New: `backend/app/tenants/` | Tenant model + CRUD |
| All `sessions.py`, `jobs.py` | Add tenant_id |

### Acceptance criteria

- [ ] Two tenants cannot read each other's scan results
- [ ] Key revocation effective within 60 seconds
- [ ] Audit log of key usage per tenant

---

## G4 — Data governance & retention

### Data classes

| Class | Examples | Retention | Encryption |
|-------|----------|-----------|------------|
| **Public** | Marketing, docs | Indefinite | TLS in transit |
| **Customer config** | API keys, scan targets | Life of contract + 90d | At rest AES-256 |
| **Scan results** | Crypto assets, CBOM | 1 year default | At rest |
| **PHI** | Hospital rosters | Pilot term + 30d | At rest + BAA |
| **Upload sessions** | CSV/PEM uploads | 24h TTL | At rest |

### Deliverables

- Data retention policy (align [web/app/docs/operations/data-retention/page.tsx](../web/app/docs/operations/data-retention/page.tsx))
- Customer DPA template
- Right-to-deletion procedure

### Acceptance criteria

- [ ] Automated purge job for expired upload sessions
- [ ] Customer can request full data export + deletion
- [ ] Privacy policy published before self-serve (Track H)

---

## G5 — SOC 2 Type I → Type II

### Phase 1 (Type I — month 6–9 target)

- Select auditor (Vanta/Drata + firm, or direct)
- Implement controls: access, change management, logging, backup
- Policy pack: info sec, acceptable use, incident response

### Phase 2 (Type II — month 12–18)

- 6-month observation window
- Required for enterprise PQC contracts >$150K

### Map to customer-facing standards

[backend/app/pqc/standards.py](../backend/app/pqc/standards.py) — internal controls should satisfy what we sell externally.

---

## G6 — Vertical compliance

### HIPAA (hospital)

- BAA with customer before PHI
- De-identified roster option for pilot
- Minimum necessary PHI in API payloads
- Workforce training (brief)

### CMMC / FedRAMP (gov PQC)

- CMMC Level 2 mapping for `gov-contractor-cmmc` scenario
- FedRAMP: **path only** at 18 months — full auth is 12–24 month program
- Start with "CMMC-ready report" not "FedRAMP authorized"

### Acceptance criteria

- [ ] BAA template legal-reviewed
- [ ] Hospital pilot can run on de-identified data without BAA
- [ ] CMMC control mapping appendix in PQC report

---

## G7 — Dogfood PQC

**Qtangl must scan itself.**

1. Run PQC scan on `qtangl.com`, `www.qtangl.com`, API host
2. Remediate any RSA/ECDSA exposure on our own stack
3. Enable PQ TLS on API endpoint when hosting supports (OQS provider)
4. Publish: "We scanned ourselves" blog post

### Acceptance criteria

- [ ] qtangl.com scan in CI weekly
- [ ] Zero critical findings on owned infrastructure OR documented remediation plan

---

## G8 — Responsible disclosure

1. Publish `security@qtangl.com` (or security.txt)
2. 90-day coordinated disclosure policy
3. Bug bounty: not required pre-seed; consider post-Series A

---

## Compliance gate checklist (before regulated pilot)

- [ ] G1 secrets hygiene complete
- [ ] G2 threat model reviewed
- [ ] G3 tenant isolation OR single-tenant dedicated instance
- [ ] G4 retention policy + DPA/BAA signed
- [ ] G7 self-scan clean

---

## Related docs

- Enterprise scale: [08-track-D-enterprise-scale.md](./08-track-D-enterprise-scale.md)
- Product onboarding: [12-track-H-product-and-onboarding.md](./12-track-H-product-and-onboarding.md)
- Risks: [backlog/risk-register.md](./backlog/risk-register.md)
