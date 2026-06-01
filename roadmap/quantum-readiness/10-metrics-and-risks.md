# 10 — Metrics & Risks

Transformation KPIs, pivot-specific risks, assumptions to validate, and success gates.

---

## North-star metric

**PQC Monitor ARR** — recurring revenue from annual Monitor (+ Convert) subscriptions.

Supporting north star: **Assess → Monitor conversion rate within 6 months** (target ≥50% per [17-financial-model](../optimization_OLD_FUTURE/17-financial-model.md)).

---

## KPI dashboard

### Brand & website (leading)

| KPI | Target (Phase 1) | Target (Phase 3) | Source |
|-----|------------------|------------------|--------|
| Homepage bounce rate | Baseline −15% | Baseline −25% | Analytics |
| `/demo/pqc` starts / week | 20 | 100 | Product analytics |
| Demo start source = homepage | ≥40% | ≥60% | UTM / referrer |
| PQC pages in top 10 landing pages | 2 pages | 5 pages | Analytics |
| Avg time on `/platform` | >90 sec | >120 sec | Analytics |

### Funnel (conversion)

| KPI | Target | Source |
|-----|--------|--------|
| Outbound emails / week | 10 | crm-log.md |
| Reply rate | ≥20% | CRM |
| Demos booked / month | 8 | CRM |
| Assessment SOWs signed / quarter | 2 | CRM |
| Assess → Monitor conversion (6 mo) | ≥50% | CRM |
| Monitor renewal rate | ≥90% | Billing |
| Convert attach on Monitor | ≥30% | CRM |
| Optimize cross-sell (Monitor base) | ≥10% by month 18 | CRM |

### Product (engagement)

| KPI | Target | Source |
|-----|--------|--------|
| Live scans / tenant / month | ≥1 | API metrics |
| Scheduled scans running | 100% configured tenants | Worker logs |
| Diff alerts fired / month | Track | Webhook logs |
| Remediation items closed / quarter | Trending up | remediation_velocity |
| Verify link views / report | ≥1 per report | /verify analytics |
| Readiness score delta (Monitor cohort) | Net positive QoQ | Dashboard |

### Revenue (lagging)

| KPI | Target | Horizon | Source |
|-----|--------|---------|--------|
| PQC ARR | $100K | Q3 2026 | Billing |
| PQC ARR | $200K | Q4 2026 | Billing |
| PQC ARR | $500K | Q2 2027 | Billing |
| Assess gross margin | ≥95% | Ongoing | Financial model |
| Monitor gross margin | ≥95% | Ongoing | Financial model |
| Support hrs / Monitor customer / mo | ≤2 | At scale | Time tracking |

### Content (inbound)

| KPI | Target | Source |
|-----|--------|--------|
| Organic sessions / month | +50% vs baseline | Search console |
| Keywords in top 20 | 5 PQC terms | Search console |
| Q-Day hub pages indexed | 100% | Search console |
| Mini-assess email captures / month | 50 | Form analytics |
| Content → demo conversion | ≥5% | UTM |

---

## Phase gates (go / no-go)

| Gate | Criteria | If fail |
|------|----------|---------|
| **G1 — Launch website** | K2 acceptance complete | Delay GTM outbound refresh |
| **G2 — First Monitor** | 1 signed Monitor + live scan | Extend Phase 1 consultative sales; review pricing |
| **G3 — Scale content** | Q-Day hub live + 2 guides | Delay paid acquisition |
| **G4 — Self-serve** | Stripe Monitor + ≥3 self-serve signups | Stay manual provision |
| **G5 — $200K ARR** | Run-rate achieved | Delay second engineer; extend runway plan |

---

## Risk register (transformation-specific)

| ID | Risk | L | I | Trigger | Mitigation | Owner | Status |
|----|------|---|---|---------|------------|-------|--------|
| KR-001 | Website pivot drops total demo starts | M | H | >30% drop 4 weeks post-launch | Keep `/demo/pqc` as primary CTA; A/B test hero | Marketing | open |
| KR-002 | Wrong inbound persona (devs not CISOs) | M | M | Access form ≥60% "Developer platform" | Persona fields; tighten SEO to compliance terms | GTM | open |
| KR-003 | Brand confusion ("what are you?") | M | H | Sales calls spend >5 min on explanation | Consistent tagline; kill "Quantum Planning API" everywhere | Brand | open |
| KR-004 | Assessment-only trap (no Monitor upsell) | H | H | <25% assess→Monitor at 6 mo | Mandatory diff demo in readout; SOW includes Monitor option | Sales | open |
| KR-005 | Optimization pipeline atrophies | L | M | Zero optimize inbound 6 mo | `/platform/optimize` hub; bundle only post-Monitor | Product | open |
| KR-006 | SEO ranking loss on optimization terms | M | L | Optimization organic traffic −50% | Keep optimization pages live; no redirects | Marketing | open |
| KR-007 | Competitor owns "readiness" narrative | M | H | Lose 2 deals to SandboxAQ/PQShield | Emphasize verify links, mid-market price, speed | GTM | open |
| KR-008 | Partner delivery quality | M | H | Re-scan fails after partner migration | Qtangl verification required; partner certification | Partners | open |
| KR-009 | Support COGS erodes margin | M | M | >4 hrs/customer/mo sustained | Automate playbooks; tiered support | Ops | open |
| KR-010 | Overclaiming (audit attestation) | L | H | Legal challenge or lost trust | Honesty notes on every report; SOW scope | Legal | open |

**L** = Likelihood · **I** = Impact

Cross-reference main [risk-register.md](../optimization_OLD_FUTURE/backlog/risk-register.md) for platform risks (R-001+).

---

## Assumptions to validate

| ID | Assumption | Validation method | Success criteria | Status |
|----|------------|-------------------|------------------|--------|
| KA-001 | CISO buyers respond to readiness-first homepage | A/B or before/after demo starts | Demo starts from CISO segments increase | unvalidated |
| KA-002 | "Assess. Monitor. Convert." resonates vs "Get ready for Q-Day" | 5 customer interviews | ≥3/5 prefer journey tagline | unvalidated |
| KA-003 | Monitor ACV $100K achievable mid-market | 3 pricing conversations | No consistent sticker shock | unvalidated |
| KA-004 | ≥50% assess→Monitor in 6 months | First 5 assess cohort | ≥2/5 convert | unvalidated |
| KA-005 | Verify links differentiate vs consultants | 2 auditor meetings | Auditors accept as evidence input | unvalidated |
| KA-006 | MSSPs want white-label Monitor | 3 MSSP conversations | ≥1 pilot SOW | unvalidated |
| KA-007 | Mini-assessment converts to paid assess | Funnel metrics | ≥10% email → assess call | unvalidated |
| KA-008 | Content hub drives inbound demos | Organic attribution | ≥20% demo starts from /q-day | unvalidated |

Track in [assumptions-and-open-questions.md](../optimization_OLD_FUTURE/backlog/assumptions-and-open-questions.md) when validated.

---

## Invalidation playbook

If **KA-004** invalidated (<25% assess→Monitor):

1. Root-cause interviews (price, product, timing, champion)
2. Add Convert workshop to Assess SOW at lower price point
3. Tighten assess ICP (disqualify Stage 0 buyers)
4. Review Monitor packaging — split "Monitor Lite" at $60K?
5. Update [06-gtm-and-pricing.md](./06-gtm-and-pricing.md) and [risk-register](../optimization_OLD_FUTURE/backlog/risk-register.md)

If **KR-001** triggered (demo drop):

1. Do **not** revert PQC positioning
2. Add secondary homepage module "Also: optimization demos"
3. Increase outbound volume temporarily
4. Run user session recordings on homepage

---

## Honesty metrics (trust)

| Metric | Target | Why |
|--------|--------|-----|
| Reports with honesty notes section | 100% | Trust with auditors |
| Sales calls citing "not formal audit" | 100% | Reduce KR-010 |
| Optimization demos showing classical win | When applicable | Brand consistency |
| Public benchmark claims with evidence row | 100% | Due diligence |

---

## Weekly review template (transformation section)

Add to [weekly-review-template.md](../optimization_OLD_FUTURE/templates/weekly-review-template.md):

```markdown
## Track K — Readiness transformation

| KPI | This week | Target |
|-----|-----------|--------|
| /demo/pqc starts | | |
| Outbound emails sent | | |
| Demos completed | | |
| Assess SOWs in pipeline | | |
| Monitor ARR | | |

**Epic progress:** K1 ___ | K2 ___ | K3 ___ | K4 ___ | K6 ___

**Top risk this week:** KR-___

**Assumption validated/invalidated:** KA-___
```

---

## Related docs

- Financial targets: [17-financial-model.md](../optimization_OLD_FUTURE/17-financial-model.md)
- Main KPIs: [16-metrics-and-kpis.md](../optimization_OLD_FUTURE/16-metrics-and-kpis.md)
- Execution gates: [08-execution-plan.md](./08-execution-plan.md)
- Epics: [09-epics-and-backlog.md](./09-epics-and-backlog.md)
