# 05 — Content & SEO

Readiness content engine: Q-Day hub, framework guides, keyword strategy, blog calendar, learn library repurposing, and lead magnets.

---

## Content strategy

**Goal:** Own mid-market PQC readiness search intent and educate buyers through the Assess → Monitor → Convert journey before sales contact.

**Principles:**

1. **Evidence-led** — every article links to demo, sample CBOM, or verify flow
2. **Honest** — "inventory aid, not formal audit"; quantum-vulnerable ≠ broken today
3. **Framework-native** — map content to NIST, NSM-10, CMMC, HIPAA deadlines buyers already track
4. **Journey-aligned** — content maps to maturity stages in [02-customer-journey.md](./02-customer-journey.md)

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
| **Try it CTA** | → `/demo/pqc` |
| **Sample artifacts** | CBOM JSON, redacted PDF, verify link demo |
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
| quantum vulnerable TLS scan | Medium | `/demo/pqc` | P0 |
| Q-Day readiness | Medium | `/q-day` | P0 |
| crypto agility assessment | Medium | `/platform` | P1 |
| CycloneDX CBOM export | Low (technical) | `/q-day/cbom` | P1 |

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
| 6 | CMMC crypto controls: inventory evidence auditors want | Framework | Assess |
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
| **Cross-link** | Each PQC repo page links to `/demo/pqc` and relevant framework guide |
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
| **Implementation** | `/demo/pqc` with `?mode=mini` + email capture modal; Track K5 |

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
| **CTA** | "Automate with Qtangl" → `/demo/pqc` |

---

## Sales leave-behind alignment

Sync web content with [demos/pqc_migration/outreach/README.md](../../demos/pqc_migration/outreach/README.md):

| Collateral | Web destination |
|------------|-----------------|
| Cold email demo link | `/demo/pqc` |
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
| 1. Keyword + journey mapping | Marketing | Brief in Notion/MD |
| 2. Draft in MDX | Marketing / founder | `web/content/q-day/` |
| 3. Technical review | Engineering | Accuracy vs scanner behavior |
| 4. Legal/compliance review | Founder | Honesty notes, no attestation claims |
| 5. Publish + promote | Marketing | Blog, LinkedIn, cold email refresh |
| 6. Measure | GTM | Organic traffic, demo starts, assess form fills |

---

## Related docs

- Website pages: [04-website-transformation.md](./04-website-transformation.md)
- GTM motion: [06-gtm-and-pricing.md](./06-gtm-and-pricing.md)
- DevRel calendar (original): [09-track-E](../optimization_OLD_FUTURE/09-track-E-gtm.md) E6
