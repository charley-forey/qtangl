# 06 — Track B: PQC Product (Lead Revenue)

Post-quantum cryptography readiness scanner — the lead commercial product. Quantum is the **threat**, not the engine.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| B1 | Harden live scan production path | `done` | M | G1 |
| B2 | CBOM export standardization | `done` | S | — |
| B3 | Continuous monitoring / scheduled re-scans | `done` | M | B1, D1 |
| B4 | Remediation workflow tracking | `done` | M | B2 |
| B5 | Compliance mapping + report packs | `not-started` | M | B2 |
| B6 | Design-partner pilot package | `not-started` | S | B1–B5, H1 |

---

## B1 — Harden live scan production path

### Current state

[backend/app/pqc/scanner.py](../backend/app/pqc/scanner.py) implements live TLS, CT enumeration, SSH, JWKS, SMTP STARTTLS. Gated by `QTANGL_PQC_ENABLE_LIVE_SCAN`. SSRF guards in [backend/app/pqc/safety.py](../backend/app/pqc/safety.py).

Async jobs via [backend/app/pqc/jobs.py](../backend/app/pqc/jobs.py) — in-memory.

### Approach

1. **Production checklist:**
   - Enable live scan only with explicit env + UI authorization toggle
   - Rate limit per tenant (coordinate Track D/G)
   - Timeout and max endpoint enforcement (existing: `QTANGL_PQC_MAX_ENDPOINTS`, `QTANGL_PQC_SCAN_TIMEOUT`)
   - Scan worker isolation (Track D async workers)

2. **Error handling:** Graceful `_error_asset` for unreachable hosts; partial scan success

3. **Observability:** Structured log per endpoint scan; timeline events for UI

### Files to touch

| File | Change |
|------|--------|
| [backend/app/pqc/scanner.py](../backend/app/pqc/scanner.py) | Harden edge cases |
| [backend/app/pqc/safety.py](../backend/app/pqc/safety.py) | Expand allowlist docs |
| [backend/app/api/pqc.py](../backend/app/api/pqc.py) | Tenant rate limits |
| [backend/tests/test_pqc_safety.py](../backend/tests/test_pqc_safety.py) | SSRF regression tests |
| [web/app/demo/pqc/](../web/app/demo/pqc/) | Live scan UX + authorization |

### Acceptance criteria

- [x] Live scan completes for `test.openquantumsafe.org` without fixture (opt-in integration test)
- [x] SSRF attempts to `169.254.169.254`, `localhost`, private RFC1918 blocked
- [x] Scan timeout enforced; no hung workers in timeout regression test
- [x] `GET /pqc/scan/{id}` poll works for async live scans (existing job path)
- [x] Production runbook in [backend/README.md](../backend/README.md)

---

## B2 — CBOM export standardization

### Current state

[backend/app/pqc/report.py](../backend/app/pqc/report.py) exports JSON, CSV, CBOM, PDF via `GET /pqc/report/{scan_id}?format=`.

### Approach

1. Align CBOM JSON schema with CycloneDX / industry CBOM conventions
2. Include: algorithm, key size, vulnerability class, Mosca priority, remediation SLA
3. Validate against sample auditor checklist
4. Sample export in `demos/pqc_migration/data/`

### Acceptance criteria

- [x] CBOM export validates against published schema (document version used)
- [x] PDF report includes executive summary + prioritized backlog
- [x] Demo script references CBOM handoff step ([demos/pqc_migration/script.md](../demos/pqc_migration/script.md))

---

## B3 — Continuous monitoring / scheduled re-scans

### Approach

1. Tenant configures: target domain(s), frequency (weekly/monthly), alert threshold
2. Cron/worker triggers `run_pqc_scan(use_fixture=false)`
3. Diff vs previous scan: new assets, degraded algorithms, expired certs
4. Webhook or email alert on critical findings

### Depends on

- Postgres job store (Track D1)
- Tenant model (Track H1)

### Acceptance criteria

- [ ] Scheduled scan runs without manual trigger
- [ ] Diff report shows delta from previous scan
- [ ] Alert fires on new `quantum_vulnerable` asset

---

## B4 — Remediation workflow tracking

### Approach

1. Each backlog item gets: status (`open` | `in_progress` | `mitigated` | `accepted_risk`), owner, target date
2. Link to standards refs from [backend/app/pqc/standards.py](../backend/app/pqc/standards.py)
3. UI: [web/components/pqc/RemediationBacklog.tsx](../web/components/pqc/RemediationBacklog.tsx) — add status editing for pilot tenants

### Acceptance criteria

- [ ] Remediation items persist across sessions (Postgres)
- [ ] Export includes remediation status
- [ ] Maps to NIST/NSM deadline tiers in [demos/pqc_migration/data/deadlines.json](../demos/pqc_migration/data/deadlines.json)

---

## B5 — Compliance mapping + report packs

### Approach

1. Map scan results to frameworks: NIST CSF, CMMC, HIPAA (crypto controls), EU CRA
2. Pre-built report packs per scenario:
   - `bank-tls-inventory`
   - `gov-contractor-cmmc`
   - `healthcare-insurer-hndl`
   (fixtures in [backend/app/pqc/fixtures/scenarios/](../backend/app/pqc/fixtures/scenarios/))

3. Mosca HNDL assessment from [backend/app/pqc/risk.py](../backend/app/pqc/risk.py) — surface prominently in PDF

4. Live PQ handshake proof: [backend/app/pqc/handshake.py](../backend/app/pqc/handshake.py) — `test.openquantumsafe.org` default

### Acceptance criteria

- [x] Each scenario produces framework-mapped report section
- [x] Handshake proof captured in report appendix
- [x] Sales leave-behind updated ([demos/pqc_migration/outreach/](../demos/pqc_migration/outreach/))

---

## B6 — Design-partner pilot package

### Deliverables

| Asset | Location |
|-------|----------|
| Demo script | [demos/pqc_migration/script.md](../demos/pqc_migration/script.md) |
| Demo specs | [demos/pqc_migration/demo_specs.md](../demos/pqc_migration/demo_specs.md) |
| Cold email | [demos/pqc_migration/outreach/cold_email.md](../demos/pqc_migration/outreach/cold_email.md) |
| Pilot SOW template | [roadmap/templates/pqc-pilot-sow.md](../roadmap/templates/pqc-pilot-sow.md) |

### Pilot success criteria

- Customer runs live scan on their domain (or uploads PEM bundle)
- Receives CBOM + PDF within one session
- Identifies ≥1 critical remediation item they didn't know about
- Willing to provide quote for case study within 90 days

---

## Pricing hypothesis (see 17-financial-model.md)

| Tier | Price | Includes |
|------|-------|----------|
| **Assessment** | $25K–$50K one-time | Single domain scan + report + handshake proof |
| **Monitor** | $75K–$150K/yr | Scheduled scans + diff alerts + remediation tracking |
| **Enterprise** | $150K–$250K/yr | Multi-domain, CMMC mapping, dedicated support |

---

## Related docs

- Security: [11-track-G-security-trust-compliance.md](./11-track-G-security-trust-compliance.md)
- GTM: [09-track-E-gtm.md](./09-track-E-gtm.md)
- Validation: [07-track-C-validation.md](./07-track-C-validation.md)
