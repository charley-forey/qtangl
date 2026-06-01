# 20 — Brand Identity & Design System

Visual identity, design tokens, accessibility standards, and the "trust visual language" for the readiness platform. Bridges [01-positioning-and-brand.md](./01-positioning-and-brand.md) (verbal) to the implemented UI in `web/`.

**Principle:** The UI must *feel* trustworthy to a CISO. Evidence, clarity, and restraint over quantum spectacle.

---

## Brand at a glance

| Element | Direction |
|---------|-----------|
| Name | Qtangl |
| Category | Post-quantum readiness platform |
| Tagline | "Assess. Monitor. Convert." (primary; see [01](./01-positioning-and-brand.md)) |
| Personality | Credible, precise, calm, evidence-led — not hype, not fear |
| Promise | "Readiness with evidence your auditors can verify." |

---

## Two visual modes (scoped)

The site serves two audiences. Keep them visually distinct but coherent.

| Mode | Surfaces | Feel | Motion |
|------|----------|------|--------|
| **Readiness** (primary) | `/`, `/platform`, `/assess`, `/monitor`, `/convert`, `/pricing`, `/dashboard`, `/trust`, `/verify` | Trust, evidence, clarity; gauges, badges, signatures | Minimal, purposeful |
| **Optimization** (secondary) | `/technology`, `/demo/hospital\|airline\|ev-fleet`, `/sandbox` | Existing quantum metaphor (superposition→collapse) | Existing StateTransition animations |

**Rule:** Readiness surfaces de-emphasize particle/quantum-state animation in favor of evidence visuals (readiness score, verify badge, trend lines). Quantum lexicon (`quantumLexicon` in [voice.ts](../../web/lib/copy/voice.ts)) is **not** used on readiness surfaces ([01](./01-positioning-and-brand.md)).

---

## Logo & wordmark

| Asset | Spec |
|-------|------|
| Wordmark | "Qtangl" — existing; keep |
| App icon / favicon | Existing; ensure crisp at 16–512px |
| Trust badge | New: "Q-Day Readiness" lockup for trust center + footer |
| Readiness score badge | New: embeddable score gauge ("Verified by Qtangl") for customer use |
| Clear space / min size | Define in brand kit; protect wordmark |

Deliverable: brand kit (SVG logo set, favicon, OG images per tier) — contracted via [18-organization-and-hiring.md](./18-organization-and-hiring.md).

---

## Color tokens

Build on the existing monochrome system (CSS vars like `--color-gray-300/400/500`, `--border`, `--radius-feature` referenced in [web/app/page.tsx](../../web/app/page.tsx)).

| Token (proposed) | Role | Notes |
|------------------|------|-------|
| `--color-bg` / surfaces | Base monochrome | Existing dark system |
| `--readiness-strong` | High readiness / verified | Calm green-family (accessible) |
| `--readiness-warn` | Drift / medium severity | Amber-family |
| `--readiness-critical` | Critical / quantum-vulnerable | Red-family (restrained) |
| `--evidence-accent` | Verify / signature / trust | Single trust accent |
| `--opt-accent` | Optimization surfaces only | Existing motion accent |

**Severity semantics** must match backend vulnerability severities (critical/high/medium/low/safe) from [vulnerability.py](../../backend/app/pqc/vulnerability.py) so UI color = data meaning. Never use color as the only signal (see accessibility).

---

## Typography & spacing

| Token | Use |
|-------|-----|
| `heading-section` | Section titles (existing class) |
| `text-label` | Eyebrows / labels (existing) |
| Body scale | Reading width via `content-reading` (existing) |
| Numeric/mono | Scores, counts, hashes, CBOM snippets |

Reuse existing utility classes; extend rather than replace. Keep headline word limits from [voice.ts](../../web/lib/copy/voice.ts) `copyGuardrails` (≤12 words).

---

## Trust visual language (readiness-specific)

| Component | Purpose | Notes |
|-----------|---------|-------|
| Readiness score gauge | Headline metric | Band + numeric; on homepage, dashboard, reports |
| Verify badge | Signed-evidence trust | Links to `/verify`; checkmark + key fingerprint |
| Severity donut | Vulnerability breakdown | [SeverityDonut.tsx](../../web/components/pqc/SeverityDonut.tsx) |
| Inventory heatmap | Asset exposure | [InventoryHeatmap.tsx](../../web/components/pqc/InventoryHeatmap.tsx) |
| Drift/trend line | Posture over time | Monitor tier |
| Mosca timeline | HNDL X+Y vs Z | Education + reports |
| Deadline countdown | Urgency (NSM-10/CMMC) | Q-Day hub |
| Provenance footer | Signing key, scan hash, env | From `report_provenance` ([report.py](../../backend/app/pqc/report.py)) |

---

## Component library mapping

| UI need | Existing component |
|---------|--------------------|
| Page shell / hero | PageShell, PageHero, Hero |
| Sections | Section, Card, Eyebrow |
| Marketing | FeatureCard, CTA, ApiPreviewSection |
| PQC product | QDayCommandCenter, RemediationBacklog, ScanDiffPanel, ScanLog, ReportDrawer |
| Dashboard | DashboardClient |

New components to add (Track K2/K4):

- ReadinessScoreGauge
- VerifyBadge
- DriftTrendChart
- DeadlineTimeline
- OptimizationCrossLink (banner on optimization pages)

---

## Accessibility (WCAG 2.2 AA)

Non-negotiable — we sell to compliance-minded buyers and `report.py` honesty applies to UX too.

| Requirement | Standard |
|-------------|----------|
| Color contrast | ≥ 4.5:1 text; ≥ 3:1 large/UI |
| Non-color signaling | Severity uses icon + label, not color alone |
| Keyboard nav | All interactive elements reachable/operable |
| Focus states | Visible focus rings |
| Screen reader | Semantic HTML, ARIA on charts/gauges, alt text |
| Motion | Respect `prefers-reduced-motion` (esp. optimization animations) |
| Forms | Labels, error text, instructions (access form) |
| Reports/PDF | Tagged, readable order, sufficient contrast |

Add a11y spot-check to Definition of Done ([19-engineering-operating-model.md](./19-engineering-operating-model.md)) and Playwright/axe checks in CI. (BrowserStack accessibility scan available if needed.)

---

## Imagery & iconography

| Type | Direction |
|------|-----------|
| Diagrams | Clean flow/architecture (mermaid in docs; SVG on site) |
| Icons | Consistent set; security/evidence motifs (shield, key, check, clock) |
| Screenshots | Real product (scan, CBOM, verify) over abstract art |
| Avoid | Stock "quantum glow", fear imagery, lock clichés overload |

---

## Email & report templates

| Template | Brand notes |
|----------|-------------|
| Transactional (scan complete, alert) | Clear subject, readiness delta, CTA to dashboard |
| Report PDF | Cover with score + provenance; consistent typography; accessible |
| Board one-pager | Executive tone; exposure range; 90-day decisions |
| Cold email | Plaintext-friendly; demo + verify link ([cold_email.md](../../demos/pqc_migration/outreach/cold_email.md)) |

---

## Brand governance

| Rule | Detail |
|------|--------|
| Single source of copy | `web/lib/copy/*` (readiness modules per [04](./04-website-transformation.md)) |
| Lexicon scope | Quantum metaphor optimization-only |
| Tone | Evidence over hype; honesty notes preserved |
| Review | Copy + design review before publishing new pages |

---

## Acceptance criteria (Track K design workstream)

- [ ] Readiness vs optimization visual modes documented and applied
- [ ] Color tokens map to backend severities
- [ ] ReadinessScoreGauge + VerifyBadge components built
- [ ] WCAG 2.2 AA spot-check in CI (axe)
- [ ] Brand kit (logo set, favicon, OG images) delivered
- [ ] OptimizationCrossLink banner on optimization pages

---

## Related docs

- Verbal brand: [01-positioning-and-brand.md](./01-positioning-and-brand.md)
- Website spec: [04-website-transformation.md](./04-website-transformation.md)
- Engineering DoD / a11y: [19-engineering-operating-model.md](./19-engineering-operating-model.md)
- Existing voice tokens: [web/lib/copy/voice.ts](../../web/lib/copy/voice.ts)
