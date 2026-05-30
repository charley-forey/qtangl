# Qtangl Implementation Roadmap

**Internal source of truth** for developing, validating, securing, and scaling Qtangl's hybrid optimization platform and PQC readiness product. The public-facing roadmap at [web/lib/docs/roadmap.ts](../web/lib/docs/roadmap.ts) is a 3-band summary derived from this folder.

---

## North star

**Help organizations extract auditable value from hybrid optimization today, and prove their stack survives Q-Day tomorrow — with honesty about when classical wins.**

---

## How to use this roadmap

| Audience | Start here | Then read |
|----------|------------|-----------|
| **Investor / stakeholder** | [00-executive-summary.md](./00-executive-summary.md) | [02-market-and-competition.md](./02-market-and-competition.md) → [03-strategy-and-priorities.md](./03-strategy-and-priorities.md) → [15-timeline-and-milestones.md](./15-timeline-and-milestones.md) → [17-financial-model.md](./17-financial-model.md) |
| **Builder / engineer** | [01-current-state.md](./01-current-state.md) | [04-architecture-blueprint.md](./04-architecture-blueprint.md) → relevant track doc (05–14) → [backlog/action-items.md](./backlog/action-items.md) |
| **Product / GTM** | [03-strategy-and-priorities.md](./03-strategy-and-priorities.md) | [09-track-E-gtm.md](./09-track-E-gtm.md) → [12-track-H-product-and-onboarding.md](./12-track-H-product-and-onboarding.md) → [demos/Demo_Use_Cases.md](../demos/Demo_Use_Cases.md) |
| **Security / compliance** | [11-track-G-security-trust-compliance.md](./11-track-G-security-trust-compliance.md) | [backlog/risk-register.md](./backlog/risk-register.md) |

**Weekly cadence:** Use [templates/weekly-review-template.md](./templates/weekly-review-template.md). Update epic status in [backlog/epics.md](./backlog/epics.md) and check off items in [backlog/action-items.md](./backlog/action-items.md).

---

## Status legend

Aligned with [web/lib/docs/roadmap.ts](../web/lib/docs/roadmap.ts):

| Status | Meaning |
|--------|---------|
| `ga` | Generally available; production-safe default path |
| `pilot` | Works in demo/fixture mode; design-partner ready with caveats |
| `coming-soon` | Scaffolded or specced; not yet live |
| `research` | Experimental; not committed to product |

Epic statuses in backlog use: `not-started` | `in-progress` | `blocked` | `done`.

---

## Document map

### Strategic layer

| Doc | Purpose |
|-----|---------|
| [00-executive-summary.md](./00-executive-summary.md) | One-page thesis, two-product bet, 6/12/18-month vision |
| [01-current-state.md](./01-current-state.md) | Honest baseline: what works, what's fixture-backed, what's missing |
| [02-market-and-competition.md](./02-market-and-competition.md) | TAM/SAM/SOM, competitors, differentiation |
| [03-strategy-and-priorities.md](./03-strategy-and-priorities.md) | Prioritization framework and ranked priorities |
| [04-architecture-blueprint.md](./04-architecture-blueprint.md) | Current vs target architecture, trust boundaries |

### Execution tracks

| Doc | Track | Focus |
|-----|-------|-------|
| [05-track-A-hybrid-optimizer.md](./05-track-A-hybrid-optimizer.md) | A | Local repair window, diversity metric, `/optimize`, QAOA, real QPU |
| [06-track-B-pqc-product.md](./06-track-B-pqc-product.md) | B | Lead revenue product: scan, CBOM, monitoring, remediation |
| [07-track-C-validation.md](./07-track-C-validation.md) | C | Benchmarks, falsifiable metrics, load/repro tests |
| [08-track-D-enterprise-scale.md](./08-track-D-enterprise-scale.md) | D | Persistence, async, observability, SDKs |
| [09-track-E-gtm.md](./09-track-E-gtm.md) | E | GTM, design partners, partnerships, DevRel |
| [10-track-F-business-ops.md](./10-track-F-business-ops.md) | F | Fundraising, hiring, IP, operating cadence |
| [11-track-G-security-trust-compliance.md](./11-track-G-security-trust-compliance.md) | G | Secrets, threat model, SOC2/HIPAA/FedRAMP/CMMC |
| [12-track-H-product-and-onboarding.md](./12-track-H-product-and-onboarding.md) | H | Demo → SaaS, accounts, ingestion, pilot lifecycle |
| [13-track-I-engineering-operating-model.md](./13-track-I-engineering-operating-model.md) | I | CI/CD, pinning, release, test strategy |
| [14-track-J-solver-research.md](./14-track-J-solver-research.md) | J | Core-tech expansion: QAOA, annealing, quantum-inspired |

### Planning layer

| Doc | Purpose |
|-----|---------|
| [15-timeline-and-milestones.md](./15-timeline-and-milestones.md) | Phased plan, gates, Gantt |
| [16-metrics-and-kpis.md](./16-metrics-and-kpis.md) | North-star and leading indicators |
| [17-financial-model.md](./17-financial-model.md) | Unit economics, COGS, runway |

### Backlog & templates

| Path | Purpose |
|------|---------|
| [backlog/epics.md](./backlog/epics.md) | All epics with IDs, status, effort, dependencies |
| [backlog/action-items.md](./backlog/action-items.md) | Granular checkbox steps with acceptance criteria |
| [backlog/risk-register.md](./backlog/risk-register.md) | Risks, mitigations, triggers |
| [backlog/assumptions-and-open-questions.md](./backlog/assumptions-and-open-questions.md) | Hypotheses to validate |
| [templates/epic-template.md](./templates/epic-template.md) | Template for new epics |
| [templates/adr-template.md](./templates/adr-template.md) | Architecture decision records |
| [templates/weekly-review-template.md](./templates/weekly-review-template.md) | Weekly operating review |
| [templates/pilot-playbook.md](./templates/pilot-playbook.md) | Demo → pilot → production checklist |
| [security/threat-model.md](./security/threat-model.md) | Product threat model (G2 stub) |

---

## Critical path (summary)

```
Phase 0 (baseline + CI + benchmarks)
  → A1 local repair window extractor (keystone)
  → Track B PQC hardened + Track G security
  → Design-partner pilots (Track H + E)
  → Revenue funds Track A4/A5 + Track J research
  → Track C credibility → Track D scale → fundraise
```

See [15-timeline-and-milestones.md](./15-timeline-and-milestones.md) for full phasing.

---

## Related repo resources

- Use cases & buyer personas: [demos/Demo_Use_Cases.md](../demos/Demo_Use_Cases.md)
- Backend ops: [backend/README.md](../backend/README.md)
- Public docs roadmap bands: [web/lib/docs/roadmap.ts](../web/lib/docs/roadmap.ts)
- Agent/worktree workflow: [scripts/web-worktrees/AGENT_CONTRACT.md](../scripts/web-worktrees/AGENT_CONTRACT.md)

---

*Last updated: 2026-05-29. Maintainer: update epic status in backlog/ when milestones shift.*
