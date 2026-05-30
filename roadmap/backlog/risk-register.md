# Risk Register

Technical, commercial, and execution risks with mitigations and triggers. Review weekly.

**Severity:** Critical | High | Medium | Low  
**Likelihood:** High | Medium | Low

---

## Critical risks

| ID | Risk | L | I | Trigger | Mitigation | Owner | Status |
|----|------|---|---|---------|------------|-------|--------|
| R-001 | **Quantum never beats classical at scale** — hybrid adds no measurable value | M | C | Benchmark table shows 0% success metric on all instances | Pivot headline to auditability + alternates only; invest in quantum-inspired (J4) not QPU | Eng | Open |
| R-002 | **Fixture demos misread as live quantum** — credibility loss in due diligence | M | C | Prospect asks "is this real QPU?" and answer is unclear | Label fixture mode in UI/API; one documented real QPU run (A5); honest marketing | GTM + Eng | Open |
| R-003 | **Selling security with weak internal security** — PQC buyer finds our own vulns | M | C | G7 self-scan finds critical RSA on qtangl.com | G1 secrets hygiene; G7 dogfood; threat model before PQC scale | Security | Open |

---

## High risks

| ID | Risk | L | I | Trigger | Mitigation | Owner | Status |
|----|------|---|---|---------|------------|-------|--------|
| R-004 | **Key person / solo bandwidth** — critical path blocked on one builder | H | H | >2 epics blocked >2 weeks | F2 hiring plan; I6 agent workflow; prioritize PQC revenue to fund hire | Founder | Open |
| R-005 | **PQC standards shift** — NIST/algorithms change invalidates reports | L | H | NIST bulletin on algorithm deprecation | Track liboqs/NIST; version reports; `standards.json` versioning | Eng | Open |
| R-006 | **Regulated pilot before compliance ready** — HIPAA/CMMC incident | M | H | Hospital PHI uploaded without BAA | G6 gate checklist; de-identified roster option; no PHI until BAA | Security | Open |
| R-007 | **In-memory state in production** — data loss or cross-tenant leak on scale | H | H | Second Railway instance deployed | D1 Postgres priority; G3 tenant isolation | Eng | Open |
| R-008 | **Qiskit dependency drift** — QAOA breaks on upgrade | M | H | CI fails after pip install | I2 lockfile; benchmark CI on dep bump | Eng | Open |
| R-009 | **PQC live scan abuse** — SSRF/port scan used as attack vector | L | H | Abuse report or anomalous scan volume | `assert_scannable`; rate limits; isolated workers; G2 threat model | Eng | Open |
| R-010 | **Long sales cycle kills runway** — no revenue by month 9 | M | H | Zero signed pilots by month 6 | E1 outbound volume; lower Assessment price; services revenue | GTM | Open |

---

## Medium risks

| ID | Risk | L | I | Trigger | Mitigation | Owner | Status |
|----|------|---|---|---------|------------|-------|--------|
| R-011 | **Competitor leapfrog** — SandboxAQ wins all enterprise PQC | M | M | Lose 3 enterprise deals to same competitor | Mid-market focus; speed + price; both-sides-of-Q-Day bundle | GTM | Open |
| R-012 | **Hospital buyer inertia** — union IT blocks integration | M | M | Pilot stalls >90 days on IT review | De-identified pilot; audit pack as compliance sell; leave-behind for IT | GTM | Open |
| R-013 | **IBM Quantum API cost overrun** | L | M | QPU bill >$500/mo | Cap spend; fixture default; A5 one-time proof only | Eng | Open |
| R-014 | **Web/backend doc drift** — API contract mismatch | M | M | SDK integration test fails | D4 OpenAPI in CI; contract tests | Eng | Open |
| R-015 | **No CI** — regressions ship to production | H | M | Production bug from untested merge | I1 CI — Phase 0 priority | Eng | Open |

---

## Low risks

| ID | Risk | L | I | Trigger | Mitigation | Owner | Status |
|----|------|---|---|---------|------------|-------|--------|
| R-016 | **Railway/Vercel outage** | L | M | >1hr downtime | Status page; multi-region later (D6) | Ops | Open |
| R-017 | **Open-source license conflict** — qiskit/OR-Tools terms | L | L | Legal review flags | F5 legal review of dependencies | Legal | Open |
| R-18 | **Learn library stale** — SEO/content outdated | M | L | `npm run learn:stale` fails | Existing stale check in web package.json | DevRel | Open |

---

## Risk response playbook

| If trigger fires... | Immediate action |
|---------------------|------------------|
| R-001 confirmed | Emergency ADR: production hybrid = quantum-inspired only; update all marketing |
| R-002 in sales call | Show diagnostics block + fixture label; offer live QPU demo if A5 complete |
| R-003 critical self-scan | Stop PQC outbound until remediated; publish remediation timeline |
| R-006 PHI without BAA | Delete data; notify customer; incident log; legal counsel |
| R-010 no pilots month 6 | Cut burn; founder full-time sales; consider services/consulting revenue |

---

## Risk review log

| Date | Reviewer | Notes |
|------|----------|-------|
| 2026-05-29 | Initial | Register created from deep-dive |

---

## Related docs

- Assumptions: [assumptions-and-open-questions.md](./assumptions-and-open-questions.md)
- Security: [../11-track-G-security-trust-compliance.md](../11-track-G-security-trust-compliance.md)
- Strategy: [../03-strategy-and-priorities.md](../03-strategy-and-priorities.md)
