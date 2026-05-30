# 12 — Track H: Product & Customer Onboarding

Bridge from fixture demos to real multi-tenant SaaS — accounts, data ingestion, dashboards, and demo → pilot → production lifecycle.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| H1 | Tenant accounts & auth UX | `in-progress` | M | G3 |
| H2 | Customer data ingestion (all verticals) | `not-started` | M | H1 |
| H3 | Tenant dashboards | `done` | L | H1, D1 |
| H4 | Demo → pilot → production lifecycle | `not-started` | S | H1 |
| H5 | Self-serve PQC signup (v1) | `not-started` | M | B1, H1, G4 |

---

## H1 — Tenant accounts & auth UX

### Current state

- Single API key: `QTANGL_API_KEY` / `qtangl-demo-key`
- Access request form: [web/app/access/](../web/app/access/), [web/components/marketing/AccessRequestForm.tsx](../web/components/marketing/AccessRequestForm.tsx)
- No tenant model in backend

### Target state

1. **Signup flow:** Email → verify → tenant created → API key issued
2. **Login:** Dashboard access to keys, usage, scans
3. **Roles:** `admin` | `developer` | `viewer`
4. **API:** Bearer token or `X-API-Key` header (backward compatible)

### Files to touch

| File | Change |
|------|--------|
| [web/app/access/actions.ts](../web/app/access/actions.ts) | Wire to tenant creation |
| [backend/app/auth.py](../backend/app/auth.py) | Multi-tenant validation |
| New: `web/app/dashboard/` | Tenant home |
| [web/lib/api.ts](../web/lib/api.ts) | Tenant-scoped client |

### Acceptance criteria

- [ ] New tenant receives API key within 5 minutes of signup *(admin-provisioned via `POST /admin/tenants` for pilots; self-serve email → H5)*
- [x] Demo key remains for public sandbox ([web/app/sandbox/page.tsx](../web/app/sandbox/page.tsx))
- [x] Tenant cannot access other tenant's resources

---

## H2 — Customer data ingestion

### Existing upload endpoints

| Vertical | Upload | File |
|----------|--------|------|
| Hospital | Roster CSV | [backend/app/api/hospital.py](../backend/app/api/hospital.py) |
| Airline | Crew CSV | [backend/app/api/airline.py](../backend/app/api/airline.py) |
| EV fleet | Fleet + stops CSV | [backend/app/api/ev_fleet.py](../backend/app/api/ev_fleet.py) |
| PQC | PEM/CSV bundle | [backend/app/api/pqc.py](../backend/app/api/pqc.py) `upload-bundle` |

### Templates (public)

- [web/public/demos/hospital/roster_template.csv](../web/public/demos/hospital/roster_template.csv)
- [web/public/demos/airline/crew_template.csv](../web/public/demos/airline/crew_template.csv)
- [web/public/demos/ev-fleet/](../web/public/demos/ev-fleet/)
- [web/public/demos/pqc/bundle_template.csv](../web/public/demos/pqc/bundle_template.csv)

### Improvements needed

1. **Validation UX:** Inline errors referencing row/column (components: `RosterUploader`, `StopsUploader`)
2. **Session persistence:** Move from in-memory to Postgres (Track D1)
3. **PHI handling:** De-identification guide for hospital pilot; optional field mapping
4. **Large file support:** Chunked upload for 10MB+ rosters

### Acceptance criteria

- [ ] Customer roster upload → solve completes without manual backend intervention
- [ ] Validation errors shown in UI with row numbers
- [ ] Upload session ID persists 24h across API restarts (Postgres)

---

## H3 — Tenant dashboards

### Dashboard views (MVP)

| View | Content |
|------|---------|
| **Overview** | API usage, last scan, last solve |
| **PQC** | Scan history, remediation backlog status, download reports |
| **Optimization** | Solve history, scoreboard snapshots, audit pack downloads |
| **Settings** | API keys, team members, billing (Stripe later) |
| **Docs** | Quick links to relevant guides |

### Approach

- New route group: `web/app/dashboard/`
- Reuse demo components in "production mode" (real data, no fixture badge)
- Backend: list endpoints for scan/solve history per tenant

### Acceptance criteria

- [x] Tenant sees last 10 scans and solves → [web/app/dashboard/](../web/app/dashboard/) + `GET /tenant/scans`
- [x] One-click PDF/CBOM download from dashboard → `GET /tenant/scans/{id}/report`
- [ ] Fixture mode clearly labeled vs live mode *(dashboard shows persisted scans; demo pages unchanged)*

---

## H4 — Demo → pilot → production lifecycle

### Stage definitions

| Stage | Access | Data | Support | Price |
|-------|--------|------|---------|-------|
| **Demo** | Public demo key / sandbox | Fixture only | Self-serve | Free |
| **Pilot** | Dedicated tenant key | Customer data (BAA if PHI) | Weekly call | Paid pilot fee |
| **Production** | Production tenant | Customer data | SLA | Subscription |

### Pilot success criteria (by product)

**PQC pilot:**
- Live scan completes on customer domain
- ≥1 net-new critical finding vs their prior knowledge
- Customer assigns remediation owner to ≥3 backlog items

**Hospital pilot:**
- ≥10 real call-out solves in 60 days
- Nurse manager rates audit pack "useful" (survey)
- Measurable OT or agency cost delta (customer-reported)

### Pilot → production conversion

- 30-day pre-expiry review
- Production SOW with annual commit
- Data migration: pilot tenant → production tenant (same ID)

### Deliverable

New: `roadmap/templates/pilot-playbook.md` — checklist per vertical

---

## H5 — Self-serve PQC signup (v1)

### Minimum self-serve flow

1. Sign up → verify email
2. Enter domain → run fixture scan (free tier) OR live scan (paid tier)
3. View report in dashboard
4. Upgrade to Monitor for scheduled scans

### Free tier limits

- 1 domain, fixture scan unlimited, live scan 1/month
- Report watermark on free PDF

### Acceptance criteria

- [ ] Signup to first fixture scan report in <10 minutes
- [ ] Stripe checkout for Monitor tier (or manual invoice v1)
- [ ] Terms of service acceptance recorded

---

## Related docs

- Security: [11-track-G-security-trust-compliance.md](./11-track-G-security-trust-compliance.md)
- GTM: [09-track-E-gtm.md](./09-track-E-gtm.md)
- Enterprise: [08-track-D-enterprise-scale.md](./08-track-D-enterprise-scale.md)
