# PQC assessment pilot — sales & delivery playbook

Follow this doc for Track **E1** (first PQC pilot): sell, demo, run the assessment, and deliver artifacts.

**Related files**

| File | Purpose |
|------|---------|
| [script.md](./script.md) | 3–5 min demo talk track |
| [../../roadmap/templates/pqc-pilot-sow.md](../../roadmap/templates/pqc-pilot-sow.md) | Contract template |
| [outreach/cold_email.md](./outreach/cold_email.md) | Outbound email |
| [outreach/crm-log.md](./outreach/crm-log.md) | Pipeline log |
| [data/sample-cbom-bank-tls-inventory.json](./data/sample-cbom-bank-tls-inventory.json) | Sample deliverable to send prospects |
| [data/bundle_template.csv](./data/bundle_template.csv) | CSV upload template |

**Live product**

- Demo: https://www.qtangl.com/assess
- Customer dashboard: https://www.qtangl.com/dashboard
- Methodology: https://www.qtangl.com/assess/methodology

### Demo URLs vs customer URLs (do not mix)

| Audience | URL | Key / auth |
|----------|-----|------------|
| Prospect / marketing | `/assess`, `/assess?scenario=…&autorun=1` | Sandbox — fixture only |
| Paying customer (primary) | `/dashboard` or `/dashboard?onboarding=TOKEN` | **WorkOS sign-in** (email / SSO); onboarding token redirects to login |
| Paying customer (automation) | Settings → Advanced | Tenant API key for CI only |
| Self-serve Assess (R2) | `/assess/start` → email link | Free tier tenant |

**Never** send fixture autorun links to paying customers.

### Admin: provision tenant + allowlist

```bash
python backend/scripts/provision_tenant.py \
  --name "Acme Bank Pilot" \
  --tenant-id acme-bank \
  --tier monitor \
  --domains api.acme.com,auth.acme.com
```

Or `PUT /admin/tenants/{id}/authorized-domains` with sales attestation.

Customer runbook: [customer-first-baseline-runbook.md](./customer-first-baseline-runbook.md)

---

## 1. What you are selling

**One sentence:** A **Q-Day readiness assessment** that inventories quantum-vulnerable cryptography, scores harvest-now-decrypt-later (HNDL) risk with Mosca’s inequality, and delivers auditor-ready **PDF + CycloneDX CBOM** — in days, not an 8-week spreadsheet project.

| Buyer | Pain | Hook |
|-------|------|------|
| CISO | Board asks for RSA exposure before 2030 | Readiness score + asset inventory in one session |
| GRC / compliance | NSM-10, NIST IR 8547, CMMC migration | Framework mapping in PDF report pack |
| Platform / infra | JWKS, SSH, email STARTTLS often missed | Scanner finds more than “we checked the website” |
| Procurement | Vendor crypto inventory | CycloneDX CBOM (`qtangl-cbom-v1`) |

**In scope:** crypto inventory, Mosca HNDL assessment, remediation backlog, PQ TLS handshake proof, CBOM export.

**Out of scope:** penetration testing, code review, HSM inventory, formal CMMC/HIPAA attestation.

**Pricing anchor (SOW):** $25K–50K one-time assessment; optional Monitor $75K–150K/yr (scheduled re-scans — roadmap B3).

---

## 2. How to show it works (proof stack)

Use in this order on sales calls:

1. **Live demo** — https://www.qtangl.com/assess (confirm “backend connected”)
2. **Fixture scan** — predictable results every time (best for recordings)
3. **Sample CBOM** — attach `data/sample-cbom-bank-tls-inventory.json`
4. **Honesty blog** — https://www.qtangl.com/blog/when-classical-wins
5. **Production persistence** — tenant dashboard with real scan history (see §6)
6. **Methodology** — https://www.qtangl.com/assess/methodology

**Skeptic line:** *“This is an inventory and prioritization tool with honest disclaimers — not a formal audit. Here is the sample CBOM and PDF you would get on your authorized targets.”*

---

## 3. Demo modes — which to use when

**Enterprise / procurement calls:** Open [`/trust/dogfood`](https://www.qtangl.com/trust/dogfood) first — live signed scans of Qtangl production domains before the fixture demo. Verify link: `GET /pqc/dogfood/latest`.

| Mode | When | How |
|------|------|-----|
| **Fixture** | First calls, recordings, no legal paperwork | `/assess` → select scenario → check authorization → **Run scan** with fixture enabled (default) |
| **Live (public test host)** | Prove real scanning before customer signs | Railway: enable live scan + allowlist → scan `test.openquantumsafe.org` (see §4) |
| **Live (customer)** | Paid pilot week 1 | Written authorization + allowlist their domains OR PEM/CSV bundle upload |
| **Live (your own site)** | Dogfood / credibility | Scan `qtangl.com` (weekly CI already does this — G7) |

---

## 4. Real URLs you can scan (live mode)

Live scanning is **off by default** on Railway. To enable for a demo or pilot:

```env
QTANGL_PQC_ENABLE_LIVE_SCAN=true
QTANGL_PQC_SCAN_ALLOWLIST=test.openquantumsafe.org,qtangl.com
```

Redeploy backend after changing env vars.

### Safe public targets (no customer contract needed)

| Target | Port | Why |
|--------|------|-----|
| **`test.openquantumsafe.org`** | `443` | Open Quantum Safe project test server; used in Qtangl CI integration tests. Designed for PQ TLS experimentation. |
| **`test.openquantumsafe.org`** | `4433` | OQS demo / hybrid TLS handshake (handshake proof panel) |
| **`qtangl.com`** | `443` | Your own site — dogfood scan |

**Best “real scan” demo for clients:** Run fixture first (predictable story), then offer to run **live scan on `test.openquantumsafe.org`** in the same call to prove the engine hits real endpoints. Say clearly: *“For your pilot we scan your authorized domains; this is a public PQ test server.”*

### Customer pilot targets

After signed authorization letter / SOW:

- Add their domains to `QTANGL_PQC_SCAN_ALLOWLIST`, e.g. `api.customer.com,auth.customer.com`
- Or use **bundle upload** (CSV/PEM) — no live network scan of those hosts required for the first pass if they prefer to export certs themselves

**Never scan** a customer domain without written permission. UI checkbox alone is not legal consent for production pilots.

---

## 5. How to run the 15-minute sales demo

Follow [script.md](./script.md). Short version:

| Step | Action |
|------|--------|
| 1 | Open `/assess` → **Regional bank TLS inventory** (or gov / healthcare scenario) |
| 2 | Confirm authorization checkbox → **Run Q-Day scan** (fixture) |
| 3 | Walk scoreboard: assets, quantum-vulnerable count, readiness score |
| 4 | **Mosca panel:** data shelf life, migration time, years to Q-Day |
| 5 | Top remediation item (e.g. RSA-2048 → ML-KEM-768 hybrid) |
| 6 | **Handshake proof** panel |
| 7 | Click **Migration report** → export **PDF** and **CBOM** |
| 8 | Close: *“Week 1 of the pilot delivers this on your authorized targets.”* |

**Scenarios**

| ID | Use for |
|----|---------|
| `bank-tls-inventory` | Financial services / board mandate |
| `gov-contractor-cmmc` | Defense contractor / CMMC |
| `healthcare-insurer-hndl` | Insurer / long data retention |

---

## 6. Dashboard & API keys — who uses what

There are **three different keys**. Do not confuse them.

| Key | Who has it | Used for |
|-----|------------|----------|
| **`QTANGL_ADMIN_API_KEY`** | You only (Railway secret) | Create tenants, issue/revoke customer keys (`POST /admin/*`) |
| **`QTANGL_API_KEY`** (demo / sandbox) | Public demo, Vercel `NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY` | `/assess` sandbox scans → stored under **`sandbox`** tenant |
| **Tenant API key** (`qtangl_…`) | Each pilot customer | Their scans only; `/dashboard` + API |

### Test the dashboard yourself (sandbox)

1. Run a **fixture scan** on https://www.qtangl.com/assess
2. Open https://www.qtangl.com/dashboard
3. Paste your **sandbox API key** (same value as Railway `QTANGL_API_KEY` and Vercel `NEXT_PUBLIC_QTANGL_SANDBOX_API_KEY`)
4. Click **Connect** → you should see the scan with status `done`
5. Click **PDF** to download the report

If the list is empty, confirm Railway has `DATABASE_URL` set and `/health/ready` shows `"database": true`.

### Provision a pilot customer (production flow)

Replace `<RAILWAY_HOST>` and `<ADMIN_KEY>`:

```bash
# 1. Create tenant
curl -X POST "https://<RAILWAY_HOST>/admin/tenants" \
  -H "Authorization: Bearer <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Bank","tenantId":"acme-bank"}'

# 2. Issue API key (save apiKey from response — shown once!)
curl -X POST "https://<RAILWAY_HOST>/admin/tenants/acme-bank/keys" \
  -H "Authorization: Bearer <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"label":"pilot-primary"}'
```

Send the customer:

- Their **`qtangl_…` API key** (secure channel)
- Link: https://www.qtangl.com/dashboard
- Optional: run scans for them via API using their key, or they use API directly

**Do not give customers the admin key or the public sandbox key.**

### MSSP portfolio demo (multi-customer)

For partners managing multiple child tenants:

1. Sign in at `/dashboard` with a user that has portfolio memberships.
2. Open the **Portfolio** tab — show aggregate readiness and customers below threshold.
3. Click a customer row to switch tenant without reload.
4. Return to Portfolio after a child baseline scan to show updated rollup.
5. Optional: enable **weekly digest** in Settings and send a test email (requires SMTP on worker).

See [dashboard-mssp-portfolio.md](../../docs/guides/dashboard-mssp-portfolio.md).

**Key rotation:** If a tenant API key is pasted into chat, email, or a shared doc, revoke it immediately (`DELETE /admin/keys/{id}`) and issue a replacement. Report download URLs with `api_key=` query params are convenient for pilots but must not be shared publicly.

---

## 7. How to run the assessment (paid pilot)

### Week 0 — Kickoff

- [ ] Sign SOW ([pqc-pilot-sow.md](../../roadmap/templates/pqc-pilot-sow.md))
- [ ] Customer provides **authorized domain list** OR **PEM/CSV bundle**
- [ ] Create tenant + issue API key (§6)
- [ ] Enable live scan + allowlist if using their domains (§4)

### Input option A — Authorized domain list

Customer emails: *“We authorize Qtangl to scan api.acme.com and auth.acme.com on ports 443, 8443.”*

You add to Railway:

```env
QTANGL_PQC_SCAN_ALLOWLIST=api.acme.com,auth.acme.com
```

Run scan (with **customer tenant key**):

```bash
curl -X POST "https://<RAILWAY_HOST>/pqc/scan" \
  -H "Authorization: Bearer <CUSTOMER_TENANT_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "bank-tls-inventory",
    "useFixture": false,
    "target": "api.acme.com",
    "seed": 1234
  }'
```

Response includes `"scanId"`. Poll until done:

```bash
curl "https://<RAILWAY_HOST>/pqc/scan/<scanId>" \
  -H "Authorization: Bearer <CUSTOMER_TENANT_KEY>"
```

### Input option B — PEM / CSV bundle upload

Use when customer will not allow live network scan yet, or for internal cert inventory.

**CSV template:** [data/bundle_template.csv](./data/bundle_template.csv) (also at `/demos/pqc/bundle_template.csv` on the site)

```csv
host,port,kind,label
api.example.com,443,tls,API gateway
auth.example.com,443,jwks,OIDC issuer
bastion.example.com,22,ssh,Ops bastion
mx.example.com,25,email,Inbound SMTP
```

**Steps:**

```bash
# Upload bundle
curl -X POST "https://<RAILWAY_HOST>/pqc/upload-bundle" \
  -H "Authorization: Bearer <CUSTOMER_TENANT_KEY>" \
  -F "file=@customer-bundle.csv"

# Response: { "sessionId": "..." }

# Scan using session
curl -X POST "https://<RAILWAY_HOST>/pqc/scan" \
  -H "Authorization: Bearer <CUSTOMER_TENANT_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "bank-tls-inventory",
    "useFixture": false,
    "bundleSessionId": "<sessionId>"
  }'
```

Upload sessions expire after **24 hours**.

**PEM:** Upload a `.pem` file or certificate bundle; same `upload-bundle` endpoint.

### Week 1 — Deliver baseline

Download deliverables (§8) and email to customer + show on dashboard.

### Week 2 — Remediation workshop

Walk PDF backlog; success = **≥1 net-new critical finding** vs their prior inventory.

### Week 4 — Executive readout

Present readiness score, Mosca assessment, top 5 remediations, CBOM for GRC.

---

## 8. Deliverables — what they get and where they come from

After any scan completes, the backend builds a **scan bundle** and stores it in **Postgres** (tenant-scoped). Reports are generated from that bundle on download — not a separate manual step.

### Formats

| Format | API | Best for |
|--------|-----|----------|
| **PDF** | `GET /pqc/report/{scanId}?format=pdf` | Board, CISO, exec readout |
| **CBOM** | `GET /pqc/report/{scanId}?format=cbom` | GRC, procurement (CycloneDX 1.6, `qtangl-cbom-v1`) |
| **JSON** | `?format=json` | Integrations, your review |
| **CSV** | `?format=csv` | Spreadsheet backlog |

**Dashboard PDF link:** `GET /tenant/scans/{scanId}/report?format=pdf&api_key=<tenant-key>`  
(The dashboard “PDF” button uses the tenant key automatically.)

**Demo UI:** After scan on `/assess`, use **Download PDF report** in the results panel (or **All formats** for CBOM/JSON/CSV).

### PDF contents (compliance report pack)

- Branded **cover** with scan ID, readiness band badge, Mosca verdict callout
- **Executive one-pager** with top-3 priority actions
- **How to read this report** explainer (readiness, coverage, Mosca, HNDL, severity)
- **Manual vs Qtangl scoreboard** comparison table
- Readiness score + coverage confidence + crypto-agility score
- Full **Mosca HNDL block** (X+Y>Z, variable definitions, interpretation)
- **Cryptographic inventory** (key size, Shor qubits estimate, paginated)
- Top **HNDL-exposed asset deep-dive** (TLS cipher/group, SANs, validity)
- **Standards summary** table with authoritative URLs + gap findings
- Prioritized **remediation backlog** (severity, PQC algorithm, completion % when tracked)
- **Handshake proof appendix** (fixture/replayed caveat)
- **Glossary** + numbered **references** appendices
- **Report integrity** appendix (SHA-256 hash, signature fingerprint, verify QR)
- Honesty notes (*inventory aid, not formal audit*)

### Evidence audit ZIP

`GET /tenant/scans/{scanId}/report?format=bundle` — PDF + CBOM + JSON + CSV + methodology + signature in one ZIP.

### Continuous monitoring (B3)

- `POST /tenant/schedules` — weekly (or custom) re-scans; requires Postgres + Redis worker + `QTANGL_ENABLE_SCHEDULER=true`
- Dashboard: **Scheduled monitoring** panel when persistence is enabled

### Email delivery

- `POST /tenant/scans/{scanId}/email` with `{ "email": "..." }`
- Configure `QTANGL_SMTP_*` on Railway; safe no-op + log when unset
- Optional `notifyEmail` on schedules for completion alerts

### Remediation tracking (B4)

- `GET/POST /tenant/scans/{scanId}/remediation` — status: open / in_progress / done / accepted_risk
- Surfaces in JSON report and PDF completion %

### Report verification

- Public: `GET /pqc/verify/{scanId}` or https://www.qtangl.com/verify?scanId=…
- Signed with ML-DSA-65 when `oqs-python`/liboqs available; **Ed25519 fallback** always

### Security: revoke leaked tenant keys

If a tenant API key is exposed in chat or email, revoke immediately:

```bash
curl -X DELETE "https://<RAILWAY_HOST>/admin/keys/<key-id>" \
  -H "Authorization: Bearer $QTANGL_ADMIN_API_KEY"
```

Re-issue a replacement key for the customer dashboard.

### CBOM contents

- CycloneDX 1.6, profile `qtangl-cbom-v1`
- Per component: algorithm, key size, severity, Mosca priority, remediation deadline

**Sample to send before they buy:** [sample-cbom-bank-tls-inventory.json](./data/sample-cbom-bank-tls-inventory.json)

### How to deliver to the customer

| Channel | What to send |
|---------|--------------|
| **Email (week 1)** | PDF + CBOM JSON attachments from API download |
| **Dashboard** | Tenant API key + https://www.qtangl.com/dashboard — they see scan history and download PDF |
| **API** | Document `GET /pqc/report/{scanId}` for their SIEM/GRC team |

**Example download (your machine):**

```bash
curl -o acme-report.pdf \
  "https://<RAILWAY_HOST>/pqc/report/<scanId>?format=pdf" \
  -H "Authorization: Bearer <CUSTOMER_TENANT_KEY>"

curl -o acme-cbom.json \
  "https://<RAILWAY_HOST>/pqc/report/<scanId>?format=cbom" \
  -H "Authorization: Bearer <CUSTOMER_TENANT_KEY>"
```

---

## 9. Outbound & close

**Email template:** [outreach/cold_email.md](./outreach/cold_email.md)

**15-min call agenda**

1. Their deadline / board ask (2 min)
2. Fixture demo (5 min)
3. CBOM + PDF export (3 min)
4. Pilot scope + SOW (3 min)
5. Next step: authorization + kickoff (2 min)

**Close:** *“90-day assessment: week 1 CBOM + PDF on authorized targets, week 2 workshop, week 4 exec readout. $[35K] — 50% on signature, 50% on final report.”*

---

## 10. First pilot checklist

```
□ 10 outbound emails sent (crm-log.md)
□ 2 demo calls (fixture + CBOM/PDF shown)
□ SOW customized and sent
□ Tenant provisioned; customer has dashboard key
□ Live scan authorized OR bundle uploaded
□ Baseline scan → PDF + CBOM delivered
□ Customer confirms ≥1 net-new critical finding
□ Signed / invoiced (E1-004 — first revenue)
```

---

## 11. Quick troubleshooting

| Problem | Fix |
|---------|-----|
| Dashboard empty | Railway `DATABASE_URL` + redeploy; use tenant key that ran the scan |
| Live scan 403 | Set `QTANGL_PQC_ENABLE_LIVE_SCAN=true` |
| Live scan “not in allowlist” | Add host to `QTANGL_PQC_SCAN_ALLOWLIST` |
| Admin API 503 | Set `QTANGL_ADMIN_API_KEY` on Railway |
| Rate limit 429 on demo/dashboard | Set Railway `QTANGL_RATE_LIMIT_PER_MINUTE=300` (was often set to `10`; PQC polling uses many requests) |
| Demo “backend disconnected” | Check Vercel `NEXT_PUBLIC_QTANGL_API_BASE_URL=https://api.qtangl.com` |

**Health check:**

```bash
curl https://<RAILWAY_HOST>/health/ready
```

Expect: `"database": true`, `"persistenceEnabled": true`.
