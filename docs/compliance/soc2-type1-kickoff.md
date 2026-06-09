# SOC 2 Type I — kickoff checklist

**Status:** Pre-observation — not certified.  
**Scope reference:** [soc2-type1-scope.md](../../roadmap/optimization_OLD_FUTURE/security/soc2-type1-scope.md)  
**Platform controls:** [12-platform-security-and-trust.md](../../roadmap/quantum-readiness/12-platform-security-and-trust.md)

Use this checklist before engaging Vanta, Drata, or a CPA firm for a Type I observation window.

---

## 1. Vendor & timeline

- [ ] Select compliance automation vendor or auditor
- [ ] Confirm trust service criteria in scope: **Security (CC)**, **Availability (A1)**, **Confidentiality (C1)** per scope doc
- [ ] Schedule **90-day observation window** start date
- [ ] Assign internal owner (founder or fractional vCISO)
- [ ] Create shared evidence folder (Google Drive / Vanta)

---

## 2. Existing controls — map to evidence

| Control area | Qtangl implementation | Evidence to collect |
|--------------|----------------------|---------------------|
| **Tenant isolation (RLS)** | Postgres RLS on tenant tables via `app/db/rls.py`; queries scoped by `tenant_id` in `app/store/scan_jobs.py`, sessions, vault | RLS policy SQL export; cross-tenant test output (`test_g3_d2_h.py`) |
| **API key hashing** | SHA-256 hashed keys in `api_keys` table; admin separation via `QTANGL_ADMIN_API_KEY` | `app/auth.py`, `app/tenants/service.py`; admin route tests |
| **Audit log** | Append-only `audit_log` table; `GET /tenant/audit`, `GET /tenant/audit/export` (NDJSON) | Sample export; `app/audit/service.py` |
| **Change management** | GitHub PR workflow, Alembic migrations, required CI on `main`/`develop` | `.github/workflows/ci.yml` green runs; migration history |
| **Secret scanning** | gitleaks CI job + `.gitleaks.toml` | Recent gitleaks workflow passes |
| **Monitoring** | `/health/ready`, worker scheduler logs, webhook DLQ | Railway/Vercel uptime screenshots; `test_scheduler.py` |
| **Vendor management** | Sub-processors list at `/trust/subprocessors` | Published trust center URL |

---

## 3. Access control checklist

- [ ] Document who has Railway, Vercel, Stripe, and GitHub admin access
- [ ] Confirm `QTANGL_ADMIN_API_KEY` is unique per environment (not shared with tenant keys)
- [ ] Confirm production secrets are in platform stores only (no committed `.env`)
- [ ] Review [secrets-runbook.md](../../roadmap/optimization_OLD_FUTURE/security/secrets-runbook.md) rotation dates
- [ ] Enable MFA on GitHub, Railway, Vercel, Stripe for all admins

---

## 4. Logging & retention

- [ ] Audit log retention policy documented (default 12 months per platform security doc)
- [ ] Application log redaction policy drafted (TH-005 in [threat-model.md](../../roadmap/optimization_OLD_FUTURE/security/threat-model.md))
- [ ] Evidence vault retention (`QTANGL_EVIDENCE_RETENTION_MONTHS`) documented in DPA
- [ ] Transparency log retention exemption noted (hash-only, no PII)

---

## 5. CI / SDLC evidence

- [ ] CI runs pytest on every PR (`.github/workflows/ci.yml` → `backend` job)
- [ ] CodeQL analysis enabled for Python + JavaScript
- [ ] Benchmark regression tests in CI (`test_benchmark_regression.py`)
- [ ] PQC dogfood weekly scan workflow (`pqc-dogfood.yml`)
- [ ] Staging conversion smoke (`staging-smoke.yml`) — non-blocking signal
- [ ] Alembic `upgrade head` exercised in CI before deploy

---

## 6. Gaps to close before observation

| Gap | Epic | Owner | Target |
|-----|------|-------|--------|
| Log redaction for PHI/PII | G9 | Eng | Phase 1 |
| Upload size limits | H2 | Eng | Phase 2 |
| Backup/restore runbook | G4 | Ops | Before observation |
| Employee security policy | F5 | Ops | Before observation |

---

## 7. Kickoff meeting agenda

1. Walk through [soc2-type1-scope.md](../../roadmap/optimization_OLD_FUTURE/security/soc2-type1-scope.md) TSC selection
2. Map controls in §2 above to auditor control library
3. Agree evidence request cadence (weekly during observation)
4. Set Type I report target date (observation end + 4–6 weeks)
5. Schedule quarterly threat model review ([threat-model.md](../../roadmap/optimization_OLD_FUTURE/security/threat-model.md))

---

## 8. Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Founder / CEO | | | |
| Engineering lead | | | |
| Compliance advisor | | | |

---

*Checklist version: 2026-06-08 — aligns with G5 / K9-005 backlog items.*
