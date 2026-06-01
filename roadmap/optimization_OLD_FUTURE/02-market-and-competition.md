# 02 — Market & Competition

Market sizing, competitive landscape, and Qtangl differentiation for both product pillars. Buyer personas sourced from [demos/Demo_Use_Cases.md](../demos/Demo_Use_Cases.md).

---

## Market overview

### Pillar 1: Post-quantum cryptography (PQC) readiness

| Metric | Estimate | Source / rationale |
|--------|----------|-------------------|
| **TAM** | $5–15B (2026–2030) | Global PQC migration spend; NIST/NSM mandates; mid-size banks budget $5–25M per program |
| **SAM** | $500M–$2B | US/EU regulated orgs: banks, insurers, healthcare, gov contractors, SaaS with FedRAMP/CMMC |
| **SOM (18 mo)** | $2–10M | 10–40 mid-market design partners @ $50K–$250K/yr scan + remediation subscriptions |

**Drivers:**
- NIST ML-KEM/ML-DSA finalized (2024); deployment deadlines 2027–2030
- NSM-10 (US) mandates federal PQC migration
- "Harvest now, decrypt later" — adversaries storing encrypted traffic today
- CMMC 2.0, FedRAMP, EU CRA pushing crypto inventory

**Buyer personas:**
- CISO / compliance lead (bank, insurer, gov contractor)
- FedRAMP/CMMC officer (SaaS, defense industrial base)
- Board-level mandate with 2027/2030 SLA risk

### Pillar 2: Hybrid optimization (disruption repair)

| Vertical | Pain ($) | Persona | Qtangl fit |
|----------|----------|---------|------------|
| **Hospital re-staffing** | $5K–$12K/mis-staffed shift; $14–22B/yr US OT | Nurse manager / OR charge | **Strongest** — ~60% built |
| **Airline OCC recovery** | $0.5–2M/cascade; ~$8B industry controllable cancels | OCC controller | Medium — ~2 weeks extra data model |
| **EV fleet charging** | $150K–$330K/yr/depot peak charging waste | Last-mile ops manager | Medium — VRP + charger QUBO |
| **Generic scheduling API** | Hours saved vs manual resequencing | Developers / ops engineers | Foundation — `/optimize` schedule only |

| Metric | Estimate |
|--------|----------|
| **TAM (optimization)** | $20B+ (workforce scheduling + logistics OR software) |
| **SAM** | $2–5B (regulated/disruption-heavy verticals where audit matters) |
| **SOM (18 mo)** | $500K–$2M (3–8 optimization pilots @ $75K–$300K) |

---

## Competitive landscape

### PQC / Q-Day readiness

| Competitor | Strength | Weakness vs Qtangl |
|------------|----------|-------------------|
| **SandboxAQ** | Brand, enterprise sales, broad PQ portfolio | Expensive; less transparent; not paired with optimization story |
| **QuSecure / PQShield** | PQ TLS, HSM integration | Narrow; no hybrid optimizer cross-sell |
| **IBM / Cloudflare PQ TLS** | Infrastructure-level PQ | Not inventory/remediation workflow |
| **Manual consulting (Big 4)** | Trust, relationships | Slow (weeks inventory); expensive; no live handshake proof |
| **Open-source (liboqs, test.openquantumsafe.org)** | Free, NIST-aligned | No productized scan + CBOM + Mosca risk + report workflow |

**Qtangl wins when:** Buyer wants fast inventory + remediation backlog + live PQ handshake demo + honest migration timeline — at mid-market price point, optionally bundled with optimization.

### Hybrid / quantum optimization

| Competitor | Strength | Weakness vs Qtangl |
|------------|----------|-------------------|
| **Multiverse Computing** | Quantum algorithms, enterprise | Opaque on when classical wins; less audit-focused |
| **D-Wave (Leap / hybrid)** | Annealing, decomposition (dwave-hybrid) | Different API; not vertical demo packages |
| **Gurobi / CPLEX / OR-Tools** | Best-in-class classical | No quantum narrative; no audit packs |
| **Custom in-house (hospital/airline)** | Domain fit | No hybrid second opinion; manual fairness |
| **Generic "AI scheduling" SaaS** | UX | Black box; no constraint proof |

**Qtangl wins when:** Buyer needs **auditable constraint satisfaction** + **diverse alternates** + honest classical fallback — especially in regulated scheduling (healthcare, aviation).

---

## Differentiation matrix

| Dimension | Qtangl | Typical quantum vendor | Classical OR |
|-----------|--------|------------------------|----------------|
| Honesty when classical wins | ✅ Built into API | ❌ Often hidden | N/A |
| Audit pack / QUBO snapshot | ✅ | Rare | Rare |
| PQC + optimization one vendor | ✅ Unique | ❌ | ❌ |
| Vertical demo packages | ✅ 4 verticals | Partial | Vertical SaaS only |
| Developer docs / learn library | ✅ Strong | Weak | Varies |
| Live quantum in production | 🟡 Fixture replay | Varies | N/A |
| Enterprise tenancy / SOC2 | 🟡 Roadmap | ✅ | ✅ |

---

## Where we win / lose

### Win

- Mid-market regulated orgs needing **fast PQC inventory** without $5M consulting engagement
- Hospitals wanting **explainable swap decisions** with union/skill rule evidence
- Technical buyers who **punish quantum hype** and reward transparent diagnostics
- **Both-sides-of-Q-Day** narrative for boards (optimize today + defend tomorrow)

### Lose (today)

- Fortune 50 requiring FedRAMP High **today** (we're not there yet)
- Buyers who need **proven quantum speedup** (we honestly don't have it)
- Pure classical OR at scale (Gurobi will beat us on largest MIP instances)
- QRNG / gaming entropy niche (Rank #5 in use cases — small market)

---

## Go-to-market implication

**Lead product:** PQC scanner (revenue, urgency, no quantum-performance caveat).

**Land-and-expand:** PQC customer → optimization pilot (hospital or airline) using shared API key, audit culture, and board quantum narrative.

**Vertical order:** Hospital (#1) → PQC (#4 orthogonal but lead revenue) → Airline (#2) → EV fleet (#3).

---

## Next doc

[03-strategy-and-priorities.md](./03-strategy-and-priorities.md) — how we prioritize and sequence.
