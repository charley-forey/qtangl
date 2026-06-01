# ADR-005: Readiness-first website positioning

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-31 |
| **Deciders** | Product, GTM |
| **Epic** | K2 |

---

## Context

Qtangl's website and nav led with **"Quantum Planning API"** and optimization demos (hospital re-staffing hero), while the most mature product surface is the **PQC readiness scanner** (`/pqc/*`, pilot status).

The company strategy ([00-transformation-thesis.md](./00-transformation-thesis.md)) positions Qtangl as a **post-quantum readiness platform** with journey **Assess → Monitor → Convert**. Hybrid optimization remains a valid expansion motion but must not headline readiness pages.

Constraints:

- Do not delete optimization demos or `/optimize` API docs
- Preserve existing demo URLs for inbound links
- Signed evidence and honest scope ("inventory aid, not formal audit") on all readiness surfaces

---

## Decision

Reposition qtangl.com to readiness-first:

1. **Homepage hero:** "Assess. Monitor. Convert." with primary CTA → `/demo/pqc`
2. **Primary nav:** Platform, Assess, Demo (PQC), Docs, Pricing, Access
3. **New landing pages:** `/platform`, `/assess`, `/monitor`, `/convert`, `/pricing`, `/platform/optimize`
4. **Education hub:** `/q-day` with HNDL, Mosca, deadlines, CBOM guides
5. **Vertical solutions:** `/solutions/banking`, `/government`, `/healthcare`
6. **Optimization secondary:** `/platform/optimize`, `/technology` with cross-link banner to `/platform`
7. **Redirect:** `/pqc` → `/platform` (301)
8. **Metadata default:** `readinessMetadata` in `siteMetadata`; `optimizationMetadata` scoped to optimize pages

Copy lives in `web/lib/copy/readiness*.ts` modules per [04-website-transformation.md](./04-website-transformation.md).

---

## Consequences

**Positive**

- Website matches buyer journey and PRD packaging (Assess / Monitor / Convert)
- PQC demo and verify flow surfaced in primary nav and homepage
- Optimization preserved for expansion without confusing CISO ICP

**Negative / tradeoffs**

- Existing optimization SEO keywords deprioritized on homepage (mitigated: `/technology`, blog archive, `/platform/optimize`)
- Two product narratives require discipline — readiness guardrails in `web/lib/copy/voice.ts`

---

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Dual homepage (A/B readiness vs optimize) | Splits brand; roadmap calls for single north star |
| Delete optimization demos | Loses expansion motion and engineering proof |
| Keep `/pqc` as product URL | Spec consolidates journey under `/platform`; redirect preserves inbound links |

---

## Related

- [04-website-transformation.md](./04-website-transformation.md)
- [09-epics-and-backlog.md](./09-epics-and-backlog.md) Track K2
- [01-positioning-and-brand.md](./01-positioning-and-brand.md)
