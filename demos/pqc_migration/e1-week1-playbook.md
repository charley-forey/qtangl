# E1 Week 1 — Outbound and demo playbook

Execute after production deploy is green (`python backend/scripts/production_smoke.py --health-only`).

## Day 1–2: Pipeline

- [ ] Send 10 emails from [outreach/cold_email.md](./outreach/cold_email.md)
- [ ] Log each contact in [outreach/crm-log.md](./outreach/crm-log.md)
- [ ] Target segments: regional banks, CMMC contractors, healthcare payers

## Day 3–4: Demos

**Demo #1 — Assessment + evidence**
1. Fixture scan (`bank-tls-inventory`) on https://www.qtangl.com/assess?scenario=bank-tls-inventory&autorun=1
2. Download PDF + evidence ZIP
3. Open `/verify?scanId=…` — show signed report

**Demo #2 — Monitor drift**
1. Run second fixture scan (or live scan on authorized domain)
2. Dashboard → **Diff** — readiness delta, new Q-vulnerable assets
3. Show scheduled monitoring + Slack webhook (if Redis worker live)

## Day 5: Close

- [ ] Customize [roadmap/templates/pqc-pilot-sow.md](../../roadmap/templates/pqc-pilot-sow.md)
- [ ] Provision tenant: `POST /admin/tenants` + keys
- [ ] Deliver baseline PDF in first session
- [ ] **Sign first pilot SOW**

## Metrics (week 1)

| Metric | Target |
|--------|--------|
| Outbound emails | 10 |
| Replies | 2 |
| Demos booked | 2 |
| Pilots signed | 1 |

## Objection handling

| Objection | Response |
|-----------|----------|
| "We already have a crypto inventory tool" | Qtangl adds **signed verify links**, **scan diff**, and **Mosca timeline** — auditor-ready evidence, not another spreadsheet |
| "Quantum is years away" | HNDL risk for data encrypted today; Mosca inequality shows whether migration runway exceeds shelf life |
| "Can we self-serve?" | Monitor checkout on `/access` or manual pilot via hello@qtangl.com |
