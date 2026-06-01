# 16 — Metrics & KPIs

North-star metric, leading indicators per track, validation metrics, security/compliance metrics, and business metrics.

---

## North-star metric

**For optimization:** *Distinct feasible alternates within 2% of classical optimum, per solve.*

```
north_star_optimization = avg(distinct_feasible_plans_hybrid)
  where hybrid_best_objective <= classical_objective * 1.02
```

**For PQC:** *Critical remediation items identified per scan that customer did not previously track.*

```
north_star_pqc = avg(new_critical_findings_per_scan)
```

**Company-level (18 mo):** *Annual recurring revenue (ARR)* with ≥60% from PQC (recurring) and ≥40% gross margin blended.

---

## Business metrics

| Metric | Definition | Target 6 mo | Target 12 mo | Target 18 mo |
|--------|------------|-------------|--------------|--------------|
| **ARR** | Monthly recurring × 12 + annual contracts | $100K | $500K | $1M |
| **Paying customers** | Active subscription or pilot → prod | 2 | 8 | 20 |
| **PQC pilots closed** | Signed SOW | 2 | 6 | 12 |
| **Hospital pilots** | Active | 1 | 3 | 5 |
| **Case studies** | Published with logo | 0 | 1 | 3 |
| **Pipeline** | Qualified opportunities | $500K | $2M | $5M |
| **Net revenue retention** | Expansion − churn | — | >100% | >110% |
| **Gross margin** | (Rev − COGS) / Rev | 50% | 60% | 65% |

---

## Product metrics (optimization)

| Metric | Definition | Target |
|--------|------------|--------|
| `distinct_feasible_plans` | Count of feasible hybrid plans within ε | ≥2 on BM-003 |
| `diversity_score` | Pairwise plan distance (0–1) | >0.3 when alternates ≥2 |
| `classical_fallback_rate` | % solves where hybrid not used | Track; expect >80% initially |
| `audit_pack_rate` | % solves with downloadable audit | 100% for hybrid attempts |
| `p95_solve_latency_fixture` | Hospital fixture solve | <10s |
| `repair_window_size` | Tasks/nurses in micro-window | ≤8 by construction |
| `qubo_var_count` | Binary vars in micro-QUBO | ≤12 |

---

## Product metrics (PQC)

| Metric | Definition | Target |
|--------|------------|--------|
| `assets_scanned` | Per live scan | Track distribution |
| `quantum_vulnerable_pct` | Vulnerable / total assets | Benchmark per vertical |
| `scan_completion_rate` | Successful scans / started | >95% |
| `remediation_backlog_size` | Items per scan | Track |
| `time_to_report` | Scan start → PDF ready | <5 min fixture; <15 min live |
| `handshake_proof_success` | PQ TLS proof rate | 100% on OQS demo server |
| `scheduled_scan_on_time` | Cron reliability | >99% |

---

## Validation metrics (Track C)

| Metric | Gate |
|--------|------|
| Benchmark instances with committed results | 6/6 |
| Success metric true on ≥1 instance | Required before optimization GTM scale |
| QAOA reproducer test pass rate | 100% (fixed seed) |
| Fixture-live weight correlation | ≥80% (after A5) |
| Load test p95 `/optimize` | <2s (≤10 tasks) |

---

## Security & compliance metrics (Track G)

| Metric | Target |
|--------|--------|
| gitleaks CI pass | 100% |
| Critical vulns open | 0 |
| Mean time to rotate compromised key | <4 hours |
| Tenant isolation test pass | 100% |
| SOC2 controls implemented | Type I: 100% by Phase 4 |
| Qtangl self-scan critical findings | 0 |
| BAA signed before PHI pilot | Required (binary) |

---

## Engineering metrics (Track I)

| Metric | Target 6 mo | Target 12 mo |
|--------|-------------|--------------|
| CI pass rate on main | >95% | >98% |
| Backend test count | 100 | 200 |
| Deploy frequency | Weekly | Daily (web); weekly (backend) |
| Mean time to restore (staging) | <4 hours | <1 hour |
| Dependency audit critical | 0 open >7 days | 0 open >3 days |

---

## GTM metrics (Track E)

| Metric | Target |
|--------|--------|
| Outbound emails / month | 40 |
| Demos completed / month | 5 |
| Demo → pilot conversion | 20% |
| Pilot → production conversion | 50% |
| Inbound leads / month (from content) | 10 by month 12 |
| Partner referrals / quarter | 2 by month 18 |

---

## Research metrics (Track J)

| Metric | Target |
|--------|--------|
| Solver types in eval harness | 3 by Phase 2; 5 by Phase 4 |
| Library repo notes written | 10 |
| Published comparison artifacts | 1 blog + 1 whitepaper by Phase 4 |
| ADRs for solver decisions | ≥3 |

---

## Dashboard & reporting

### Weekly (founder review)

- ARR / pipeline
- Active pilots status
- CI pass rate
- Blocked epics count

### Monthly (full KPI review)

- All tables above
- Actual vs [17-financial-model.md](./17-financial-model.md)
- Assumption status from [backlog/assumptions-and-open-questions.md](./backlog/assumptions-and-open-questions.md)

### Tooling (recommended)

| Stage | Tool |
|-------|------|
| Pre-CRM | Spreadsheet + this doc |
| Post-first-pilot | HubSpot or Pipedrive |
| Engineering | GitHub Insights + CI |
| Product analytics | PostHog or Plausible on web |
| Uptime | Better Uptime or Railway metrics |

---

## Related docs

- Validation: [07-track-C-validation.md](./07-track-C-validation.md)
- Financial: [17-financial-model.md](./17-financial-model.md)
- Weekly template: [templates/weekly-review-template.md](./templates/weekly-review-template.md)
