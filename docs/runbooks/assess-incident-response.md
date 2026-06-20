# Assess incident response runbook

## P1 — Public assess unavailable

**Symptoms:** `/assess` 5xx, scanner shows persistent offline fallback, autorun never completes.

1. Check `https://www.qtangl.com/status` and Railway/backend health.
2. Run `python backend/scripts/assess_web_smoke.py` (or `scripts/assess_web_smoke.py` against prod base).
3. Verify `QTANGL_API_BASE_URL` from web container reaches PQC API.
4. If backend up but scans fail: check worker/scanner queue and `pqc_scan_failed` events.

**Rollback:** Feature flag `NEXT_PUBLIC_ASSESS_PRODUCTION_MODE=false` only affects production mode; demo fixture scans should still work offline via fallback scenarios.

## P1 — Signup abuse / spam

**Symptoms:** Spike in `assess_signup_started`, CRM webhook flood.

1. Lower `QTANGL_ASSESS_SIGNUP_LIMIT_PER_HOUR`.
2. Block domains at WAF if needed.
3. Review `lead_capture_rate_limited` for mini-assessment (`QTANGL_LEAD_CAPTURE_LIMIT_PER_HOUR`).

## P2 — Scan completion rate drop

1. Open PostHog funnel (`docs/runbooks/assess-funnel-dashboard.md`).
2. Filter `pqc_scan_failed` by `kind` and `message`.
3. Check `domain_not_allowed` vs infrastructure errors.

## P2 — Verify / evidence broken

1. Test golden scan: `/verify?scanId=golden-bank-tls-inventory`
2. Run `qtangl-verify` against sample report JSON.
3. Check transparency log at `/trust`.

## P3 — Wrong customer data in assess hydration

`scanId` URL hydration only works for sandbox/public-verify store scans — not cross-tenant production data.

## Contacts

- Engineering: on-call rotation
- Customer comms: use `demos/pqc_migration/assess-launch-rollback.md` for user-facing messaging
