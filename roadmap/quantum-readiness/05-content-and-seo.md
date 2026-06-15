# 05 — Content & SEO

Readiness content engine: Q-Day hub, framework guides, keyword strategy, blog calendar, learn library repurposing, and lead magnets.

---

## Content strategy

**Goal:** Own mid-market PQC readiness search intent and educate buyers through the Assess → Monitor → Convert journey before sales contact.

**Principles:**

1. **Evidence-led** — every article links to demo, sample CBOM, verify flow, or transparency log receipt
2. **Honest** — "inventory aid, not formal audit"; quantum-vulnerable ≠ broken today
3. **Framework-native** — map content to NIST, NSM-10, CMMC, HIPAA deadlines buyers already track
4. **Journey-aligned** — content maps to maturity stages in [02-customer-journey.md](./02-customer-journey.md)

---

## Readiness lexicon (evidence layer — use consistently)

Align with [01-positioning-and-brand.md](./01-positioning-and-brand.md) and [23-glossary-and-references.md](./23-glossary-and-references.md).

| Term | Definition | Prefer over |
|------|------------|-------------|
| **Evidence layer** | Cross-cutting PQ signing, transparency log, passport, open verify | "Trust features" |
| **Transparency log** | Append-only SHA-256 chain of signed report content hashes | "Audit log" (internal) |
| **Log inclusion** | Receipt proving a report hash appears in the transparency log at a given seq | "Logged" (vague) |
| **Readiness Passport** | Shareable evidence bundle: PDF + CBOM + verify metadata + log receipt | "Share link" (internal) |
| **Aggregator** | Import/merge CBOMs from any discovery source with provenance tags | "Importer" (too narrow) |
| **Verifiable evidence** | Proof an auditor can check offline without Qtangl credentials | "Signed report" alone |
| **Key transparency** | Public history of signing key fingerprints at `/pqc/transparency/keys` | — |

**Banned on readiness surfaces:** "tamper-proof" (use "tamper-evident"), "formal audit" (use "inventory aid"), "full estate coverage" (use "fast external baseline").

---

## Q-Day resource hub (`/q-day`)

Central education destination linked from homepage, nav footer, and blog.

### Hub structure

```
/q-day                          — Hub index
/q-day/what-is-q-day            — Explainer
/q-day/hndl                     — Harvest-now-decrypt-later deep dive
/q-day/mosca-inequality         — X + Y > Z interactive explainer
/q-day/deadlines                — NSM-10, CNSA 2.0, NIST IR 8547 timeline
/q-day/cbom                     — CycloneDX CBOM guide + sample download
/q-day/hybrid-tls               — PQ TLS handshake proof explainer
/q-day/readiness-score          — How Qtangl scores readiness
/q-day/vs-spreadsheet           — Why spreadsheets fail (sales enablement)
```

### Hub index page content blocks

| Block | Purpose |
|-------|---------|
| **Timeline widget** | Deadline tiers from [deadlines.json](../../demos/pqc_migration/data/deadlines.json) |
| **Mosca calculator** | Simple X/Y/Z inputs → inequality holds? |
| **Try it CTA** | → `/assess` |
| **Sample artifacts** | CBOM JSON, redacted PDF, verify link demo, transparency log seq screenshot |
| **Framework grid** | Links to framework guides below |

**Implementation:** MDX under `web/content/q-day/` or App Router pages with copy from `web/lib/copy/readiness-qday-hub.ts`.

---

## Framework guides (pillar content)

Long-form guides (2,000–4,000 words) targeting compliance search intent.

| Guide | Primary keyword | Framework refs | CTA |
|-------|-----------------|----------------|-----|
| **NSM-10 compliance guide** | NSM-10 PQC migration | NSM-10, CNSA 2.0 | Assess tier |
| **CMMC crypto inventory** | CMMC level 2 cryptography | CMMC, SP 800-208 | gov-contractor scenario |
| **HIPAA & HNDL for payers** | HIPAA quantum risk | HIPAA, NIST IR 8547 | healthcare scenario |
| **PCI-DSS 4.0 crypto agility** | PCI-DSS 4.0 inventory | PCI-DSS 4.0 | bank scenario |
| **NIST FIPS 203/204/205 primer** | ML-KEM ML-DSA migration | FIPS 203-205 | hybrid TLS guide |
| **EU CRA crypto requirements** | EU CRA post-quantum | EU CRA | Enterprise |

**Reuse:** Standards metadata from [standards.json](../../demos/pqc_migration/data/standards.json) and [standards.py](../../backend/app/pqc/standards.py) mappings.

**Format:** `/q-day/frameworks/[slug]` + cross-link from [docs/reference/pqc/standards](../../web/app/docs/reference/pqc/standards/page.tsx).

---

## Keyword map

### Primary (high intent — optimize landing pages)

| Keyword | Volume intent | Target page | Priority |
|---------|---------------|-------------|----------|
| post-quantum cryptography readiness | High | `/`, `/platform` | P0 |
| PQC assessment / PQC inventory | High | `/assess` | P0 |
| quantum vulnerable TLS scan | Medium | `/assess` | P0 |
| Q-Day readiness | Medium | `/q-day` | P0 |
| crypto agility assessment | Medium | `/platform` | P1 |
| CycloneDX CBOM export | Low (technical) | `/q-day/cbom` | P1 |
| post-quantum signed report verify | Low (technical) | `/verify`, [verify-spec.md](../../docs/verify-spec.md) | P1 |
| cryptographic transparency log | Low (niche) | `/trust`, `/docs/guides/verify` | P2 |

### Secondary (education — blog + hub)

| Keyword | Target |
|---------|--------|
| harvest now decrypt later | `/q-day/hndl` |
| Mosca inequality | `/q-day/mosca-inequality` |
| ML-KEM migration guide | `/q-day/frameworks/ml-kem` |
| CMMC PQC requirements | `/solutions/government` |
| RSA deprecation timeline | `/q-day/deadlines` |

### Deprioritize (optimization — keep but don't lead)

| Keyword | Keep on page |
|---------|--------------|
| quantum scheduling optimization | `/technology`, blog |
| hybrid QAOA scheduling | `/blog/when-classical-wins` |
| hospital nurse scheduling API | `/demo/hospital` |

---

## Blog calendar (12 months)

Reprioritize [web/app/blog/](../../web/app/blog/) toward readiness. Keep optimization posts in archive; feature readiness posts on index.

| Month | Title | Type | Journey stage |
|-------|-------|------|---------------|
| 1 | PQC inventory in 10 minutes: live demo walkthrough | Product | Assess |
| 2 | Harvest-now-decrypt-later: what boards miss | Education | Assess |
| 3 | Why your spreadsheet crypto inventory is wrong | Sales enablement | Assess |
| 4 | Reading a Qtangl CBOM export | Technical | Assess |
| 5 | Mosca inequality explained for CISOs | Education | Assess |
| 6 | CMMC crypto controls: verifiable evidence auditors want | Framework | Assess |
| 6b | How Qtangl's transparency log works (and why it matters) | Technical | Assess |
| 7 | Crypto drift: why one scan is not enough | Product | Monitor |
| 8 | Setting up Q-Day Monitor alerts | How-to | Monitor |
| 9 | Remediation backlog prioritization by deadline tier | How-to | Convert |
| 10 | Hybrid TLS proof: what the handshake appendix means | Technical | Convert |
| 11 | Case study: [design partner] readiness in 90 days | Social proof | All |
| 12 | 2027 PQC deadlines: 90-day action plan | Framework | All |

**Existing post to feature:** [web/app/blog/q-day-readiness/page.tsx](../../web/app/blog/q-day-readiness/page.tsx) — promote to blog index hero.

**Existing posts to demote on index:** quantum-optimization, hospital-restaffing (move to "Optimization" category filter).

---

## Learn library repurposing

The learn library (~90 OSS repos in [web/content/library/](../../web/content/library/)) currently serves quantum **computing** education.

### Repurposing strategy

| Action | Detail |
|--------|--------|
| **Add category** | "Post-Quantum Cryptography" filter on `/learn` |
| **Curate PQC repos** | liboqs, oqs-provider, pqcrypto, CBOM tools — index with readiness framing |
| **Cross-link** | Each PQC repo page links to `/assess` and relevant framework guide |
| **De-emphasize** | Quantum computing repos remain but not on homepage/learn hero |
| **New editorial** | Add entries to [library-editorial.ts](../../web/lib/copy/library-editorial.ts) for PQC topics |

### New learn topics (proposed)

| Topic slug | Title |
|------------|-------|
| `pqc-readiness` | Post-quantum cryptography readiness |
| `cbom-inventory` | Cryptographic bill of materials |
| `hndl-risk` | Harvest-now-decrypt-later |
| `ml-kem-deployment` | Deploying ML-KEM in TLS |

---

## Lead magnets

### 1. Free mini-assessment (primary)

| Attribute | Detail |
|-----------|--------|
| **Offer** | Single-domain fixture scan (no live scan) + readiness score + top 5 findings |
| **Gate** | Work email |
| **Delivery** | Instant in-browser + PDF email |
| **Upsell** | "Authorize live scan for full CBOM" → Assess SOW |
| **Implementation** | `/assess/mini` + email capture modal; Track K5 |

### 2. Sample CBOM download (ungated)

| Attribute | Detail |
|-----------|--------|
| **File** | [sample-cbom-bank-tls-inventory.json](../../demos/pqc_migration/data/sample-cbom-bank-tls-inventory.json) |
| **Placement** | `/assess`, `/q-day/cbom`, cold email attachment |
| **Purpose** | Technical buyer trust before call |

### 3. Executive briefing PDF (gated)

| Attribute | Detail |
|-----------|--------|
| **Content** | 4-page "Q-Day readiness for boards" — Mosca, deadlines, exposure range |
| **Source** | Adapt [demo_specs.md](../../demos/pqc_migration/demo_specs.md) persona |
| **Gate** | Name + title + company |

### 4. Readiness checklist (ungated SEO)

| Attribute | Detail |
|-----------|--------|
| **Format** | Markdown/PDF "20-point crypto agility checklist" |
| **Placement** | `/q-day/checklist` |
| **CTA** | "Automate with Qtangl" → `/assess` |

---

## Sales leave-behind alignment

Sync web content with [demos/pqc_migration/outreach/README.md](../../demos/pqc_migration/outreach/README.md):

| Collateral | Web destination |
|------------|-----------------|
| Cold email demo link | `/assess` |
| PDF report sample | `/q-day/sample-report` (hosted redacted PDF) |
| Scenario frameworks table | `/solutions/*` pages |
| Objection handling | Internal sales wiki; public FAQ at `/docs/resources/faq` |

---

## SEO technical checklist

- [ ] Update `siteMetadata` in product.ts (readiness title/description)
- [ ] Add `/q-day` sitemap entries
- [ ] Canonical URLs on `/pqc` → `/platform` redirect
- [ ] OpenGraph images per tier (Assess/Monitor/Convert)
- [ ] FAQ schema on `/q-day/hndl`, `/pricing`
- [ ] Internal linking: every blog post → one journey page + one demo CTA

---

## Content production workflow

| Step | Owner | Output |
|------|-------|--------|
| 1. Keyword + journey mapping | Marketing | Brief using [templates/content-brief.md](./templates/content-brief.md) |
| 2. Draft body in markdown | Marketing / founder | `web/content/readiness/blog/` or `frameworks/` with YAML frontmatter |
| 3. Register metadata | Marketing | `web/lib/copy/readiness-content-registry.ts` + `marketing.ts` (blogs) |
| 4. Technical review | Engineering | Accuracy vs scanner behavior |
| 5. Legal/compliance review | Founder | Honesty notes, no attestation claims |
| 6. Validate links | Engineering | `node scripts/check-readiness-content-links.mjs` |
| 7. Publish + promote | Marketing | Blog RSS, LinkedIn, cold email refresh |
| 8. Measure | GTM | Organic traffic, `/assess/mini` fills, `/access` submissions |

**Hybrid authoring:** Long-form body lives in `web/content/readiness/*.md`; SEO metadata, CTAs, and card copy in TypeScript registry. Shared components: `MarkdownReadinessArticle`, `FrameworkGuideLayout`, `YouTubeEmbed`, `BlogReferencesPanel`, `ContentQualityStrip`.

**Video companion rule:** Use transcripts for research only. Max 2 attributed quotes; original prose ≥70%.

## Analytics KPIs (90-day)

| Metric | Target |
|--------|--------|
| Readiness indexable pages | Track growth from `/q-day/*`, `/blog/*`, framework guides |
| Organic sessions on `/assess`, `/assess/mini` | Baseline + month-over-month |
| Mini-assessment email captures | Via `requestAccess` source tags |
| `/access` form submissions | By interest tier (Assess, Monitor) |
| Outreach link resolution | No `?scenario=` / `?case=` mismatches |

## Distribution checklist (per publish)

- [ ] Blog appears in `/blog/feed.xml`
- [ ] Sitemap includes new route (auto via registry/blogPosts)
- [ ] Cross-link from related hub page or framework guide
- [ ] LinkedIn post: hub link + demo CTA
- [ ] Update outreach templates if primary URL changed

---

## Related docs

- Website pages: [04-website-transformation.md](./04-website-transformation.md)
- GTM motion: [06-gtm-and-pricing.md](./06-gtm-and-pricing.md)
- DevRel calendar (original): [09-track-E](../optimization_OLD_FUTURE/09-track-E-gtm.md) E6
