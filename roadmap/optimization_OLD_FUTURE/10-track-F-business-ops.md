# 10 — Track F: Business Operations

Fundraising, hiring, IP, research credibility, and operating cadence.

---

## Epic overview

| ID | Epic | Status | Effort | Depends on |
|----|------|--------|--------|------------|
| F1 | Fundraising narrative + deck | `not-started` | M | C1, E1 |
| F2 | First key hires plan | `not-started` | S | — |
| F3 | IP & research credibility | `not-started` | M | A1, C1 |
| F4 | Operating cadence | `not-started` | S | — |
| F5 | Legal & corporate basics | `not-started` | M | G3 |

---

## F1 — Fundraising narrative

### Story arc

1. **Problem:** Organizations face Q-Day crypto exposure AND disruption-heavy optimization with no auditable hybrid path
2. **Insight:** Honesty is the moat — quantum vendors over-promise; classical OR lacks audit trails
3. **Solution:** Qtangl — both sides of Q-Day (PQC defense + hybrid optimization)
4. **Traction:** PQC pilots, hospital demos, benchmark table, docs platform
5. **Market:** $5–15B PQC + $2–5B optimization SAM ([02-market-and-competition.md](./02-market-and-competition.md))
6. **Ask:** Seed $2–4M for 18-month runway to $1M ARR

### Milestone-gated raise

| Milestone | Unlock |
|-----------|--------|
| 1 paying PQC pilot | Angel / pre-seed conversations |
| $250K ARR + benchmark table | Seed round |
| $1M ARR + SOC2 Type I | Series A |

### Deck sections (12 slides)

1. Title + one-liner
2. Problem (Q-Day + disruption)
3. Solution (two pillars)
4. Demo screenshot (PQC + hospital scoreboard)
5. How it works (pipeline diagram from [04-architecture-blueprint.md](./04-architecture-blueprint.md))
6. Traction / milestones
7. Market size
8. Business model ([17-financial-model.md](./17-financial-model.md))
9. Competition + differentiation
10. Team
11. Roadmap ([15-timeline-and-milestones.md](./15-timeline-and-milestones.md))
12. Ask + use of funds

---

## F2 — First key hires

### Priority order (first 18 months)

| Order | Role | When | Why |
|-------|------|------|-----|
| 1 | **Senior backend engineer** | Month 3–6 | A1 repair window, D1 persistence |
| 2 | **Security/compliance lead** (fractional OK) | Month 4–6 | Track G, PQC pilot trust |
| 3 | **Enterprise AE** | Month 6–9 | PQC design partner close |
| 4 | **DevRel / technical writer** | Month 9–12 | SDK, content engine |
| 5 | **Quantum algorithms advisor** (part-time) | Month 6+ | Track J credibility |

### Until hire #1

- Founder-led engineering on critical path (A1, B1, I1)
- Fractional SOC2 consultant for Track G
- Outbound founder-led sales for first 2 PQC pilots

---

## F3 — IP & research credibility

### Patent strategy

**Candidate invention:** *Method for classical-global optimization with bounded quantum micro-repair window extraction and auditable fallback*

- Provisional patent filing after A1 implemented and benchmarked
- Claims: repair window detection algorithm, merge-with-fallback protocol, audit pack generation

### Research publications

| Type | Topic | When |
|------|-------|------|
| Technical blog | "Local repair windows for hybrid QAOA" | After A1 |
| Whitepaper | "Honest hybrid optimization benchmarks" | After C1 |
| arXiv (optional) | Repair window formalization | After J1 experiments |

### Academic partnerships

- Reach out to 1–2 university quantum optimization labs (Qiskit ecosystem contacts)
- Offer benchmark dataset + API access for co-authored comparison study

### Benchmarks-as-marketing

Committed benchmark table ([07-track-C-validation.md](./07-track-C-validation.md)) is a sales asset — publish prominently on `/technology`.

---

## F4 — Operating cadence

### Weekly (use [templates/weekly-review-template.md](./templates/weekly-review-template.md))

- Review epic status in [backlog/epics.md](./backlog/epics.md)
- Check off action items in [backlog/action-items.md](./backlog/action-items.md)
- Update risk register if triggers hit

### Monthly

- KPI review ([16-metrics-and-kpis.md](./16-metrics-and-kpis.md))
- Financial actuals vs [17-financial-model.md](./17-financial-model.md)
- Roadmap reprioritization (update [03-strategy-and-priorities.md](./03-strategy-and-priorities.md) if needed)

### Quarterly

- Board/advisor update (even informal)
- Public roadmap sync with [web/lib/docs/roadmap.ts](../web/lib/docs/roadmap.ts)
- Assumption validation review ([backlog/assumptions-and-open-questions.md](./backlog/assumptions-and-open-questions.md))

---

## F5 — Legal & corporate basics

| Item | Status | Action |
|------|--------|--------|
| Delaware C-Corp (or equivalent) | Confirm | If not incorporated, prioritize |
| Standard pilot MSA + SOW | Needed | Template for PQC + hospital pilots |
| BAA template (HIPAA) | Needed | Before hospital PHI pilot |
| DPA template (GDPR) | Needed | Before EU PQC customer |
| Terms of service + privacy policy | Needed | Before self-serve signup (Track H) |
| Insurance (E&O, cyber) | Needed | Before first $100K+ contract |

---

## Use of funds (seed scenario: $3M)

| Category | % | Amount |
|----------|---|--------|
| Engineering (2 FTE) | 45% | $1.35M |
| GTM (1 AE + founder sales) | 25% | $750K |
| Security/compliance (SOC2, fractional) | 10% | $300K |
| Cloud/QPU costs | 5% | $150K |
| Legal, ops, buffer | 15% | $450K |

18-month runway target at ~$165K/mo burn.

---

## Related docs

- Financial model: [17-financial-model.md](./17-financial-model.md)
- Security: [11-track-G-security-trust-compliance.md](./11-track-G-security-trust-compliance.md)
- GTM: [09-track-E-gtm.md](./09-track-E-gtm.md)
