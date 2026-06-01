# 09 — Epics & Backlog

Track K — Readiness Transformation epics register and granular action items.

**Status:** `not-started` | `in-progress` | `blocked` | `done`  
**Effort:** S (1–2 wk) | M (2–4 wk) | L (4–8 wk)

Update weekly alongside [optimization_OLD_FUTURE/backlog/epics.md](../optimization_OLD_FUTURE/backlog/epics.md).

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| K1 | Strategy & brand lock | `not-started` | S | — |
| K2 | Website transformation | `not-started` | M | K1 |
| K3 | Content & SEO engine | `not-started` | M | K1, K2 |
| K4 | Product journey UX polish | `not-started` | M | B3, B4, K2 |
| K5 | Lead magnets & self-serve funnel | `not-started` | M | K2, H5 |
| K6 | GTM execution (readiness-first) | `in-progress` | M | K2, B6 |
| K7 | Partner program (Convert delivery) | `not-started` | M | K6 |
| K8 | Public roadmap & docs sync | `not-started` | S | K2 |
| K9 | Security & trust GTM (trust center, dogfood, SOC2) | `not-started` | M | G1–G5 |
| K10 | Customer success & retention engine | `not-started` | M | K6, B3 |
| K11 | Competitive intelligence & sales enablement | `not-started` | S | K1 |
| K12 | Legal, contracts & export-control readiness | `not-started` | M | — |
| K13 | Brand identity & design system | `not-started` | M | K1, K2 |
| K14 | Data & threat-intelligence program | `not-started` | M | B3 |
| K15 | Org, hiring & governance cadence | `not-started` | S | — |

**Cross-track dependencies:** B3, B4, B6 (Track B) · H1, H5 (Track H) · E1, E5 (Track E) · D1, D2 (Track D) · G1–G6 (Track G) · F1–F5 (Track F)

### Epic → doc map

| Epic | Detail doc |
|------|------------|
| K1 | [01-positioning-and-brand.md](./01-positioning-and-brand.md) |
| K2 | [04-website-transformation.md](./04-website-transformation.md) |
| K3 | [05-content-and-seo.md](./05-content-and-seo.md) |
| K4 | [03-solution-architecture.md](./03-solution-architecture.md), [13-product-requirements.md](./13-product-requirements.md) |
| K5 | [05-content-and-seo.md](./05-content-and-seo.md), [06-gtm-and-pricing.md](./06-gtm-and-pricing.md) |
| K6 | [06-gtm-and-pricing.md](./06-gtm-and-pricing.md) |
| K7 | [15-partnerships-and-ecosystem.md](./15-partnerships-and-ecosystem.md) |
| K8 | [04-website-transformation.md](./04-website-transformation.md) |
| K9 | [12-platform-security-and-trust.md](./12-platform-security-and-trust.md) |
| K10 | [14-customer-success-and-retention.md](./14-customer-success-and-retention.md) |
| K11 | [11-competitive-intelligence.md](./11-competitive-intelligence.md), [sales-enablement/](./sales-enablement/battlecards.md) |
| K12 | [17-legal-regulatory-and-compliance.md](./17-legal-regulatory-and-compliance.md) |
| K13 | [20-brand-identity-and-design-system.md](./20-brand-identity-and-design-system.md) |
| K14 | [21-data-and-threat-intelligence.md](./21-data-and-threat-intelligence.md) |
| K15 | [18-organization-and-hiring.md](./18-organization-and-hiring.md), [22-governance-and-operating-cadence.md](./22-governance-and-operating-cadence.md) |

---

## K1 — Strategy & brand lock

### Approach

1. Leadership approves tagline and messaging hierarchy ([01-positioning-and-brand.md](./01-positioning-and-brand.md))
2. Document scope rules for optimization vs readiness lexicon
3. Write ADR for positioning decision
4. Refresh outbound templates

### Acceptance criteria

- [ ] Tagline selected and recorded in 01-positioning
- [ ] ADR published in `roadmap/adrs/ADR-005-readiness-first-positioning.md`
- [ ] cold_email.md updated with monitor/verify language
- [ ] Team alignment doc shared (link to 00-transformation-thesis)

---

## K2 — Website transformation

### Approach

Execute spec in [04-website-transformation.md](./04-website-transformation.md).

### Files to touch

| File | Change |
|------|--------|
| [web/lib/copy/readiness*.ts](../../web/lib/copy/) | Create readiness copy modules |
| [web/lib/copy/product.ts](../../web/lib/copy/product.ts) | readinessMetadata; scope optimization metadata |
| [web/lib/copy/nav.ts](../../web/lib/copy/nav.ts) | New nav; subtitle; CTA |
| [web/lib/copy/access.ts](../../web/lib/copy/access.ts) | PQC-first form |
| [web/app/page.tsx](../../web/app/page.tsx) | Readiness homepage |
| [web/app/platform/](../../web/app/) | New pages: platform, assess, monitor, convert, pricing |
| [web/lib/docs/roadmap.ts](../../web/lib/docs/roadmap.ts) | Reorder Now band |

### Acceptance criteria

- [ ] Homepage hero is readiness-first
- [ ] Nav: Platform, Assess, Demo→pqc, Pricing
- [ ] `/platform`, `/assess`, `/monitor`, `/convert`, `/pricing` live
- [ ] `/pqc` redirects to `/platform`
- [ ] Optimization cross-link banner on `/technology`, `/demo/hospital`
- [ ] Playwright: homepage CTA → `/demo/pqc`

---

## K3 — Content & SEO engine

### Approach

Execute [05-content-and-seo.md](./05-content-and-seo.md).

### Acceptance criteria

- [ ] `/q-day` hub index live
- [ ] ≥4 framework guides published
- [ ] Blog index features q-day-readiness post
- [ ] Learn library PQC category filter
- [ ] Sitemap includes new readiness routes

---

## K4 — Product journey UX polish

### Approach

Readiness-first dashboard; surface diff, remediation, what-if simulator.

### Files to touch

| File | Change |
|------|--------|
| [web/components/dashboard/DashboardClient.tsx](../../web/components/dashboard/DashboardClient.tsx) | Readiness-first layout |
| [web/components/pqc/ScanDiffPanel.tsx](../../web/components/pqc/ScanDiffPanel.tsx) | Prominent on dashboard |
| [web/components/pqc/RemediationBacklog.tsx](../../web/components/pqc/RemediationBacklog.tsx) | Status editing |
| [backend/app/api/pqc.py](../../backend/app/api/pqc.py) | Diff + remediation endpoints |

### Acceptance criteria

- [ ] Dashboard opens to readiness score + diff
- [ ] Remediation status editable in UI
- [ ] What-if readiness projection widget
- [ ] Scheduled scan config UI (when B3 ships)

---

## K5 — Lead magnets & self-serve funnel

### Approach

Mini-assessment, Stripe Monitor, onboarding emails.

### Acceptance criteria

- [ ] Mini-assessment mode on `/demo/pqc` with email gate
- [ ] Sample CBOM downloadable from `/assess`
- [ ] Stripe Monitor checkout on `/access` (when H5 ready)
- [ ] Access form interest options include Assess/Monitor/Enterprise

---

## K6 — GTM execution (readiness-first)

### Approach

Execute [06-gtm-and-pricing.md](./06-gtm-and-pricing.md) and [e1-week1-playbook.md](../../demos/pqc_migration/e1-week1-playbook.md).

### Acceptance criteria

- [ ] 10 outbound emails/week logged in crm-log.md
- [ ] 2 demos/week target
- [ ] ≥1 signed Assessment SOW
- [ ] ≥1 Monitor contract within 6 months of first assess
- [ ] Assess readout includes diff demo + Monitor proposal

---

## K7 — Partner program (Convert delivery)

### Approach

MSSP white-label, auditor referral, enablement kit per [partnerships.md](../../demos/pqc_migration/partnerships.md).

### Acceptance criteria

- [ ] Partner enablement deck + sample CBOM kit
- [ ] 2 auditor intro meetings completed
- [ ] 1 MSSP rev-share SOW signed
- [ ] Partner portal spec documented (v1 can be manual)

---

## K8 — Public roadmap & docs sync

### Approach

Sync [web/lib/docs/roadmap.ts](../../web/lib/docs/roadmap.ts) and docs index to readiness-first ordering.

### Acceptance criteria

- [ ] Public roadmap Now band: Q-Day scanner first
- [ ] Docs index features PQC guide at top
- [ ] weekly-review template checkbox for public sync

---

## K9 — Security & trust GTM

### Approach

Make Qtangl's own posture a sales asset per [12-platform-security-and-trust.md](./12-platform-security-and-trust.md): trust center, dogfooding, SOC 2, questionnaire readiness.

### Acceptance criteria

- [ ] Trust center answers top 20 questionnaire items publicly
- [ ] Sub-processors list published and current
- [ ] Weekly self-scan running; readiness badge live
- [ ] security.txt + disclosure policy published
- [ ] SOC 2 Type I observation started
- [ ] Security overview PDF available on request

---

## K10 — Customer success & retention engine

### Approach

Operationalize [14-customer-success-and-retention.md](./14-customer-success-and-retention.md): onboarding, health scores, QBRs, renewals, expansion.

### Acceptance criteria

- [ ] Onboarding checklist (30-day) in use; TTFV < 7 days
- [ ] Health score computed monthly; red-account play defined
- [ ] QBR deck template (uses `report_to_board`)
- [ ] Renewal playbook (120/90/60/30 day) live
- [ ] NRR / GRR tracked

---

## K11 — Competitive intelligence & sales enablement

### Approach

Maintain [11-competitive-intelligence.md](./11-competitive-intelligence.md) and the [sales-enablement/](./sales-enablement/battlecards.md) kit; run win/loss.

### Acceptance criteria

- [ ] Battlecards for all named competitors + status quo
- [ ] Discovery + demo script in use
- [ ] ROI calculator (and web tool spec) available
- [ ] Win/loss captured on every closed deal; quarterly synthesis

---

## K12 — Legal, contracts & export-control readiness

### Approach

Execute [17-legal-regulatory-and-compliance.md](./17-legal-regulatory-and-compliance.md): contract stack, IP, export control, insurance.

### Acceptance criteria

- [ ] MSA, order form, DPA, MNDA templates counsel-reviewed
- [ ] Export-control classification documented
- [ ] Trademark filed for brand + tagline
- [ ] ToS + Privacy Policy published before self-serve
- [ ] Insurance (E&O, cyber) bound before first enterprise contract

---

## K13 — Brand identity & design system

### Approach

Implement [20-brand-identity-and-design-system.md](./20-brand-identity-and-design-system.md): tokens, trust visuals, accessibility.

### Acceptance criteria

- [ ] Readiness vs optimization visual modes applied
- [ ] Color tokens map to backend severities
- [ ] ReadinessScoreGauge + VerifyBadge components built
- [ ] WCAG 2.2 AA spot-check (axe) in CI
- [ ] Brand kit (logo set, favicon, OG images) delivered

---

## K14 — Data & threat-intelligence program

### Approach

Stand up the standards-tracking ritual and data governance per [21-data-and-threat-intelligence.md](./21-data-and-threat-intelligence.md).

### Acceptance criteria

- [ ] Monthly standards-tracking ritual running
- [ ] standards/deadlines/risk files current (< 30-day lag)
- [ ] Anonymized benchmark gated by k-anonymity
- [ ] Report/CBOM golden snapshot tests in CI

---

## K15 — Org, hiring & governance cadence

### Approach

Execute hiring sequence ([18-organization-and-hiring.md](./18-organization-and-hiring.md)) and operating cadence/RACI ([22-governance-and-operating-cadence.md](./22-governance-and-operating-cadence.md)).

### Acceptance criteria

- [ ] Quarterly OKRs set and cascaded to Track K epics
- [ ] Weekly review includes Track K section
- [ ] Each doc has a named owner
- [ ] Hire #1 (platform eng) plan + role spec ready
- [ ] ADRs recorded for major decisions

---

## Action items

**Format:** `- [ ] **ID** Description → files | acceptance`

### Phase 0 — Strategy (Weeks 0–2)

- [ ] **K1-001** Select primary tagline → [01-positioning-and-brand.md](./01-positioning-and-brand.md) | Recorded in doc
- [ ] **K1-002** Write ADR-005 readiness-first positioning → `roadmap/adrs/` | ADR merged
- [ ] **K1-003** Update cold_email.md with verify + monitor language → [outreach/cold_email.md](../../demos/pqc_migration/outreach/cold_email.md) | Sent in outbound
- [ ] **K1-004** Review 00–08 transformation docs with leadership → quantum-readiness/ | Sign-off noted in weekly review

### Phase 1 — Website (Weeks 2–8)

- [ ] **K2-001** Create `web/lib/copy/readiness.ts` lexicon → voice scope rules | Imported by readiness pages
- [ ] **K2-002** Create `readiness-home.ts` homepage copy → [home.ts](../../web/lib/copy/home.ts) deprecated for `/` | Homepage imports readiness-home
- [ ] **K2-003** Update `siteMetadata` + `readinessMetadata` → [product.ts](../../web/lib/copy/product.ts) | Title/description changed
- [ ] **K2-004** Rewrite `nav.ts` + navbarCopy → [nav.ts](../../web/lib/copy/nav.ts) | 6 nav items per spec
- [ ] **K2-005** Rewrite homepage `page.tsx` sections → [page.tsx](../../web/app/page.tsx) | Hero + demo + journey updated
- [ ] **K2-006** Create `/platform` page → `web/app/platform/page.tsx` | Journey overview live
- [ ] **K2-007** Create `/assess` landing → `web/app/assess/page.tsx` | Scenario CTAs work
- [ ] **K2-008** Create `/monitor` landing → `web/app/monitor/page.tsx` | Diff screenshot/embed
- [ ] **K2-009** Create `/convert` landing → `web/app/convert/page.tsx` | Partner section present
- [ ] **K2-010** Create `/pricing` page → `web/app/pricing/page.tsx` | Tier matrix matches 06-gtm
- [ ] **K2-011** Create `/platform/optimize` hub → `web/app/platform/optimize/page.tsx` | Links to vertical demos
- [ ] **K2-012** Reorder `/demo` index — PQC first → [demo/page.tsx](../../web/app/demo/page.tsx) | PQC card first
- [ ] **K2-013** Rewrite access copy + form options → [access.ts](../../web/lib/copy/access.ts) | PQC interest options
- [ ] **K2-014** Add OptimizationCrossLink banner component → `web/components/marketing/` | On technology + hospital demo
- [ ] **K2-015** Configure redirect `/pqc` → `/platform` → next.config | 301 works
- [ ] **K2-016** Update public roadmap.ts band order → [roadmap.ts](../../web/lib/docs/roadmap.ts) | Q-Day scanner first in Now
- [ ] **K2-017** Playwright e2e homepage → demo/pqc → [web/tests/e2e/](../../web/tests/e2e/) | Test passes

### Phase 2 — Product UX (Weeks 4–16)

- [ ] **K4-001** Dashboard readiness-first layout → DashboardClient.tsx | Score hero on load
- [ ] **K4-002** Promote ScanDiffPanel on dashboard → ScanDiffPanel.tsx | Visible when previous scan exists
- [ ] **K4-003** Remediation status edit in backlog UI → RemediationBacklog.tsx | Persists via API
- [ ] **K4-004** What-if readiness widget → new component + remediation API | Projects score delta
- [ ] **K4-005** Wire B3 scheduled scans to tenant settings UI → Track B3 | Configurable frequency
- [ ] **K4-006** Report export includes remediation completion % → report.py | PDF shows pct

### Phase 3 — Content & GTM (Weeks 8–24)

- [ ] **K3-001** Launch `/q-day` hub index → `web/app/q-day/page.tsx` | Linked from homepage footer
- [ ] **K3-002** Publish `/q-day/hndl` guide → content | Linked from hub
- [ ] **K3-003** Publish CMMC framework guide → content | Links to gov scenario
- [ ] **K3-004** Add PQC category to learn library → library-topics.ts | Filter works
- [ ] **K3-005** Feature q-day-readiness on blog index → blog/page.tsx | Hero or top row
- [ ] **K5-001** Mini-assessment email gate on demo/pqc → demo/pqc | Fixture-only mini mode
- [ ] **K5-002** Ungated sample CBOM on /assess → assess page | Download works
- [ ] **K6-001** Log 10 outbound rows in crm-log.md → outreach/ | 10 rows filled
- [ ] **K6-002** Deliver first assess PDF in single session → pilot | B6 criteria met
- [ ] **K6-003** Present Monitor upsell at Week 2 workshop → pilot playbook | Documented in CRM
- [ ] **K6-004** Publish first case study → case-study-template.md | Customer permission
- [ ] **K7-001** Send sample CBOM to 2 audit firms → partnerships | Meetings logged
- [ ] **K7-002** Sign 1 MSSP rev-share SOW → partnerships | Partner name in CRM

### Enterprise-readiness workstreams (parallel, ongoing)

- [ ] **K9-001** Build trust center answering top-20 questionnaire items → [web/app/trust/page.tsx](../../web/app/trust/page.tsx) | Published
- [ ] **K9-002** Publish sub-processors list → trust center | Current + linked
- [ ] **K9-003** Weekly self-scan of owned domains in CI → CI workflow (G7) | Badge live
- [ ] **K9-004** Publish security.txt + disclosure policy → `.well-known/` (G8) | Reachable
- [ ] **K9-005** Start SOC 2 Type I (Vanta/Drata) → [soc2-type1-scope.md](../optimization_OLD_FUTURE/security/soc2-type1-scope.md) | Observation started
- [ ] **K10-001** Onboarding 30-day checklist in CS tool → [14-customer-success-and-retention.md](./14-customer-success-and-retention.md) | Used on first customer
- [ ] **K10-002** Define customer health score + red-account play | Computed monthly
- [ ] **K10-003** QBR deck template using `report_to_board` → [report.py](../../backend/app/pqc/report.py) | Used at first QBR
- [ ] **K10-004** Renewal playbook (120/90/60/30) | Documented
- [ ] **K11-001** Write battlecards for all competitors + status quo → [sales-enablement/battlecards.md](./sales-enablement/battlecards.md) | In use
- [ ] **K11-002** Stand up win/loss capture in CRM → [11-competitive-intelligence.md](./11-competitive-intelligence.md) | Captured per deal
- [ ] **K11-003** Ship web ROI calculator tool → [sales-enablement/roi-calculator.md](./sales-enablement/roi-calculator.md) | Live on /pricing
- [ ] **K12-001** Counsel-review MSA, order form, DPA, MNDA → [17-legal-regulatory-and-compliance.md](./17-legal-regulatory-and-compliance.md) | Templates signed off
- [ ] **K12-002** Document export-control (EAR) classification | In data room
- [ ] **K12-003** File trademark for brand + tagline | Application filed
- [ ] **K12-004** Publish ToS + Privacy Policy before self-serve | Live
- [ ] **K13-001** Define readiness color tokens mapped to severities → [20-brand-identity-and-design-system.md](./20-brand-identity-and-design-system.md) | Tokens in web
- [ ] **K13-002** Build ReadinessScoreGauge + VerifyBadge components → web/components | Used on home + dashboard
- [ ] **K13-003** Add axe WCAG 2.2 AA check to CI | Passing
- [ ] **K14-001** Stand up monthly standards-tracking ritual → [21-data-and-threat-intelligence.md](./21-data-and-threat-intelligence.md) | Runs monthly
- [ ] **K14-002** Add report/CBOM golden snapshot tests → [backend/tests/](../../backend/tests/) | In CI
- [ ] **K15-001** Set quarterly OKRs; cascade to Track K → [22-governance-and-operating-cadence.md](./22-governance-and-operating-cadence.md) | OKRs published
- [ ] **K15-002** Write platform-engineer role spec + JD → [18-organization-and-hiring.md](./18-organization-and-hiring.md) | Ready to post
- [ ] **K15-003** Record ADR-005 readiness-first positioning → roadmap/adrs/ | Merged

---

## Register in main backlog

Add Track K section to [optimization_OLD_FUTURE/backlog/epics.md](../optimization_OLD_FUTURE/backlog/epics.md) when implementation begins (optional sync step — K1-004).

---

## Related docs

- Execution plan: [08-execution-plan.md](./08-execution-plan.md)
- Website spec: [04-website-transformation.md](./04-website-transformation.md)
- Track B: [06-track-B-pqc-product.md](../optimization_OLD_FUTURE/06-track-B-pqc-product.md)
