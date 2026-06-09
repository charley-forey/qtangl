# Penetration test scope — TH-001 and related

**Source:** [threat-model.md](../../roadmap/optimization_OLD_FUTURE/security/threat-model.md) §5 (TH-001), §9 (pre-Series A scope)  
**Status:** Scoped — execute after B1 live-scan hardening + G9 safe logging, or on dedicated single-tenant prod instance  
**Deliverable:** Written report + remediation tickets linked to threat IDs

---

## 1. Primary threat: TH-001 (SSRF / internal network scan)

| Field | Value |
|-------|-------|
| **Threat ID** | TH-001 |
| **Component** | `app/pqc/scanner.py` → `scan_live()` → `assert_scannable()` |
| **Residual risk** | **High** (partial mitigation) |
| **Goal** | Confirm attackers cannot pivot from live PQC scan to RFC1918, loopback, metadata, or DNS-rebinding targets |

### In-scope test cases (TH-001)

| # | Test case | Expected result |
|---|-----------|-----------------|
| 1 | Scan `127.0.0.1`, `localhost`, `0.0.0.0` | Blocked by `safety.py` `_is_blocked_ip` |
| 2 | Scan `10.x`, `172.16–31.x`, `192.168.x` after DNS resolve | Blocked |
| 3 | Scan cloud metadata IPs (`169.254.169.254`, GCP/Azure equivalents) | Blocked |
| 4 | Hostname resolving to private IP (DNS rebinding) | Blocked or documented gap |
| 5 | Non-allowlisted ports (e.g. 80, 3306, 6379) | Blocked by `DEFAULT_ALLOWED_PORTS` |
| 6 | `QTANGL_PQC_SCAN_ALLOWLIST` bypass attempts | Only listed hosts scannable when allowlist set |
| 7 | Timeout bypass (`QTANGL_PQC_SCAN_TIMEOUT`) | Request terminates ≤ configured timeout |
| 8 | Endpoint flood beyond `QTANGL_PQC_MAX_ENDPOINTS` | Truncated or rejected |
| 9 | Live scan with `QTANGL_PQC_ENABLE_LIVE_SCAN=false` | Fixture-only or 403 |

### Existing regression coverage

- `backend/tests/test_pqc_safety.py` — loopback, metadata IP (C-14)
- `backend/tests/test_pqc_scanner.py` — fixture path

---

## 2. Extended scope (threat model §9)

### PQC live scanner (TH-001, TH-009)

- Port sweep at scale; rate-limit effectiveness across instances
- Async job queue abuse (`POST /pqc/scan` with `useFixture: false`)

### Upload endpoints (TH-003)

| Route | Tests |
|-------|-------|
| `POST /hospital/upload-roster` | Oversized CSV, malformed encoding |
| `POST /airline/upload-crew` | Oversized CSV |
| `POST /pqc/upload-bundle` | Oversized PEM, malformed PEM, content-type mismatch |

### Authentication (TH-004, TH-011)

- Missing / invalid API key on protected routes
- Rate limit exhaustion and recovery
- IDOR on `sessionId` / `scanId` across tenants (TH-002)

### API errors (TH-007)

- Trigger 500s; verify no stack traces or internal paths in JSON response

### CORS (TH-010)

- Unauthorized origin with credentials

---

## 3. Out of scope

| Area | Reason |
|------|--------|
| Vercel / Railway platform | Shared responsibility |
| IBM Quantum cloud | Optional offline path |
| Social engineering | Not in product scope |
| CDN-edge DDoS | Vercel-managed |
| Customer internal networks | Out of product boundary |

---

## 4. Test environment

| Option | Notes |
|--------|-------|
| **Staging** | `QTANGL_PQC_ENABLE_LIVE_SCAN=true`; isolated scan worker network preferred |
| **Dedicated pilot instance** | Single-tenant; customer authorization for scan targets |
| **Production** | Only with written customer consent; no PHI in test payloads |

Credentials: per-tenant API key + admin key (`QTANGL_ADMIN_API_KEY`) issued for test window only.

---

## 5. Reporting requirements

- Map each finding to threat ID (TH-xxx) and control ID (C-xxx) from threat model §6
- Severity: Critical / High / Medium / Low with CVSS where applicable
- Retest window for High+ findings before Series A data room
- Store report under NDA; summary on trust center after remediation

---

## 6. Pre-engagement checklist

- [ ] B1 live-scan hardening merged or exceptions documented
- [ ] G9 error sanitization deployed (no `str(exc)` in client responses)
- [ ] TH-002 cross-tenant tests green (`test_g3_d2_h.py`)
- [ ] Auditor NDA signed ([MNDA-outline.md](../legal/MNDA-outline.md))
- [ ] Emergency contact and rollback owner assigned

---

*Scope version: 2026-06-08 — derived from threat model v1.1*
