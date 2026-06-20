# Assess enterprise hardening gate

Sign-off checklist before GA. Run after `assess.spec.ts` passes on preview and production smoke is green.

| Item | Verification | Status |
|------|--------------|--------|
| SSRF guards | `backend/tests/test_pqc_safety.py` | [x] |
| Scan rate limits | `QTANGL_PQC_MAX_ENDPOINTS`, timeout env documented | [x] |
| PEM 24h deletion | SOW + cron documented in FAQ | [x] |
| Report signing + verify | e2e verify link + signature valid | [x] |
| Transparency log | `/trust` linked from assess FAQ | [x] |
| Data retention messaging | FAQ + Terms link on assess | [x] |
| WCAG 2.2 AA | axe on `/assess` post-scan (`assess.spec.ts`) | [x] |
| Scan completion rate >95% | Monitor `pqc_scan_completed` / `pqc_scan_started` | [x] |
| Honest scope claims | External-only discovery; extended surfaces locked | [x] |
| scanId hydration scope | Sandbox/public-verify store only | [x] |
| Live scan legal copy | Authorization checkbox on assess wizard | [x] |

**Owner:** Product + Eng  
**Last reviewed:** 2026-06-19
