# E1 — First PQC pilot launch checklist

Use this after deploying the hardened backend + web (Horizon 0).

## Deploy verification

- [x] Railway: `DATABASE_URL`, `QTANGL_API_KEY`, `QTANGL_RATE_LIMIT_PER_MINUTE=300`, `QTANGL_ADMIN_API_KEY`
- [ ] Railway: `QTANGL_PUBLIC_URL=https://www.qtangl.com`, stable `QTANGL_REPORT_SIGNING_KEY_B64`
- [ ] Railway worker: Redis + `python -m app.worker` + `QTANGL_ENABLE_SCHEDULER=true`
- [ ] Vercel: `NEXT_PUBLIC_QTANGL_API_BASE_URL=https://api.qtangl.com` + matching `NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY`
- [x] Run: `python backend/scripts/production_smoke.py --health-only` (health/ready green)
- [ ] Run full smoke with production `QTANGL_API_KEY`
- [ ] Demo: fixture scan → PDF → `/verify?scanId=…` on https://www.qtangl.com/assess
- [ ] Revoke any leaked tenant keys via `DELETE /admin/keys/{id}`

See [backend/docs/RAILWAY_DEPLOY.md](../../backend/docs/RAILWAY_DEPLOY.md) and [e1-week1-playbook.md](./e1-week1-playbook.md).

## Outbound (week 1)

- [ ] Send 10 emails using [outreach/cold_email.md](./outreach/cold_email.md) — log in [outreach/crm-log.md](./outreach/crm-log.md)
- [ ] Target: regional banks, CMMC contractors, healthcare payers (see scenarios)

## Demos (week 1–2)

- [ ] Complete demo #1: fixture scan + CBOM/PDF + verify QR + Monitor diff story (two scans)
- [ ] Complete demo #2: live scan on authorized domain OR cloud JSON upload
- [ ] Record Loom per [script.md](./script.md) (E3-002)

### Persona script validation (target &lt;15s autorun)

| Script | URL | Timing target | Recorded |
|--------|-----|---------------|----------|
| Sales demo (bank autorun) | `/assess?scenario=bank-tls-inventory&autorun=1` | &lt;15s to Executive tab | [ ] |
| CISO board readout | Executive → Evidence → board PDF | 15 min flow | [ ] |
| Gov contractor | `/assess?scenario=gov-contractor-cmmc&autorun=1` | &lt;30s | [ ] |
| Healthcare HNDL | `/assess?scenario=healthcare-insurer-hndl&autorun=1` | &lt;30s | [ ] |

Automated gate: `web/tests/e2e/assess.spec.ts` asserts bank autorun &lt;15s and axe on intent picker + post-scan.

## Close

- [ ] Customize [roadmap/templates/pqc-pilot-sow.md](../../roadmap/templates/pqc-pilot-sow.md)
- [ ] Provision tenant: `POST /admin/tenants` + `POST /admin/tenants/{id}/keys`
- [ ] Deliver baseline PDF + evidence ZIP within one session
- [ ] **Sign first pilot SOW (E1-004 — first revenue)**

## Monitor tier upsell talking points

- Scheduled re-scans with **scan diff** (new quantum-vulnerable assets, readiness delta)
- Regression **alerts** via email + Slack webhook
- Remediation board + Jira/ServiceNow ticket push
- Signed verify link for auditors
