# Qtangl — GTM, pricing & competitive positioning

Go-to-market reference for sales, product, and engineering. Full playbooks live in [`roadmap/quantum-readiness/`](../roadmap/quantum-readiness/README.md).

Public compare page: [www.qtangl.com/compare](https://www.qtangl.com/compare)

---

## Pricing snapshot

Source: [`roadmap/quantum-readiness/06-gtm-and-pricing.md`](../roadmap/quantum-readiness/06-gtm-and-pricing.md) · Live pricing: [www.qtangl.com/pricing](https://www.qtangl.com/pricing)

### Journey packages (SOW / annual)

| Package | Stage | What's included | Price band (USD) | Billing |
|---------|-------|-----------------|------------------|---------|
| **Q-Day Assessment** | Assess | One-time scan + signed PDF/CBOM + workshop | $25K–$50K | 50/50 SOW |
| **Q-Day Monitor** | Monitor | Scheduled re-scans, drift diff, alerts, remediation board | $75K–$150K/yr | Annual |
| **Q-Day Convert** | Convert | Monitor + program mgmt + partner orchestration | +$50K–$100K/yr on Monitor | Annual |
| **Q-Day Enterprise** | Stage 5 | Multi-domain, CMMC/HIPAA packs, dedicated support, MSSP portfolio | $150K–$250K/yr | Annual |
| **Optimize Pilot** | Expansion | 60–90 day hospital/airline/EV vertical pilot | $50K–$200K | Pilot SOW |
| **API Developer** | Labs | `/optimize` hybrid API tier | $500–$5K/mo | Monthly |

### Product tier entitlements (platform)

Maps to Stripe / tenant subscription — source: [`backend/app/billing/entitlements.py`](../backend/app/billing/entitlements.py)

| Tier | Scans/mo | Schedules | Min cadence | Key features |
|------|----------|-----------|-------------|--------------|
| **free** | 5 | 0 | — | assess, 1 trial live scan |
| **monitor** | 100 | 10 | 24h | + monitor, webhooks, drift |
| **convert** | 500 | 25 | 12h | + convert, integrations, CLM flip |
| **enterprise** | 5000 | 100 | 1h | + SSO, audit, portfolio, KMS prod flip |

### Unit economics (mid-market hypothesis)

| Motion | Price (mid) | Gross margin |
|--------|-------------|--------------|
| Assessment (one-time) | ~$35,000 | ~98% |
| Monitor (annual) | ~$100,000/yr | ~97% |

**GTM rule:** Assessment is a **land** motion — every assess should pitch Monitor before delivery.

### Evidence layer (cross-cutting — not a separate SKU)

| Capability | Assess | Monitor | Convert | Enterprise |
|------------|--------|---------|---------|------------|
| Signed report (Ed25519 / ML-DSA-65) | ✓ | ✓ | ✓ | ✓ |
| Public `/verify` link | ✓ | ✓ | ✓ | ✓ |
| Transparency log | ✓ | ✓ + alerts | ✓ + remediation proof | ✓ + anchored roots |
| Readiness Passport | Sample | Per scan | + remediation timeline | Multi-domain |
| Offline `qtangl-verify` | Docs | Docs | Partner kit | Auditor kit |

**Pitch:** Discovery is table stakes; **verifiable evidence** is the product.

---

## Market category

**Post-Quantum Cryptography (PQC) readiness / crypto-agility / Cryptographic Posture Management (CPM)**

Qtangl owns: **"Post-quantum readiness platform"** — assess, monitor, convert, prove — self-serve at mid-market.

| Adjacent category | Overlap | How Qtangl differs |
|-------------------|---------|-------------------|
| CLM (DigiCert, Keyfactor) | Cert inventory | + quantum classification, Mosca HNDL, signed verify |
| ASM (attack surface) | External discovery | Crypto-specific, not general vulns |
| GRC platforms | Framework mapping | Crypto-specific CBOM + evidence chain |
| KMS / HSM vendors | Key material | Orchestrate + verify; don't store keys |
| PQ-TLS vendors | Hybrid TLS | Assess + prove, not just enable |

Full analysis: [`roadmap/quantum-readiness/11-competitive-intelligence.md`](../roadmap/quantum-readiness/11-competitive-intelligence.md)

---

## Competitive positioning (summary)

### Where Qtangl wins

| Dimension | Qtangl advantage |
|-----------|------------------|
| **Speed to baseline** | Minutes-to-inventory vs weeks of consulting spreadsheets |
| **Verifiable evidence** | Signed reports + public `/verify` + transparency log — **unique in market** |
| **Mid-market packaging** | Self-serve assess path, transparent pricing |
| **Honest framing** | Agentless external baseline; layers onto CLM/agents for depth |
| **Price** | 10× cheaper baseline vs Big 4 inventory engagements |

### Where Qtangl loses (be honest in sales)

| Scenario | Stronger alternative |
|----------|---------------------|
| Fortune 100 brand-led RFP | SandboxAQ, IBM Quantum Safe |
| Deep host-agent fleet coverage | Keyfactor (+ InfoSec Global), CrowdStrike-integrated |
| Static code analysis at scale | IBM Explorer, Encryption Consulting |
| Existing Palo Alto platform | Quantum-Safe Security app (firewall telemetry) |
| Buyer wants people-only program | Big 4 / boutique consulting |
| KMS-centric "where are my keys?" | Fortanix Key Insight |

### Tier A competitors (direct)

| Vendor | Positioning | Qtangl counter-message |
|--------|-------------|------------------------|
| **SandboxAQ** AQtive Guard | Enterprise CPM + AI-SPM, agent-heavy | Mid-market speed + public verify + price |
| **Keyfactor** (+ ISG/CipherInsights) | CLM + acquired discovery | Complementary agentless assess + evidence layer |
| **QuSecure** R3 | Overlay + Reconnaissance module | Assessment-first; lighter start |
| **IBM Quantum Safe** | Owns CBOM standard; code + runtime | CBOM-compatible export; win on external baseline + packaging |
| **Fortanix** | KMS/key-centric readiness | Endpoint/protocol inventory (TLS, JWKS, SSH) they miss |
| **Palo Alto** | NGFW telemetry CBOM | Standalone evidence product; no platform lock-in |

### Tier B — closest twins (table stakes)

| Vendor | Notes |
|--------|-------|
| **Qinsight** | Agentless CBOM + CNSA mapping — compete on signed public verify |
| **ExeQuantum** | 10-surface discovery + CBOM 1.7 — compete on evidence + transparency |
| **Encryption Consulting** | Consulting-led CBOM — compete on self-serve product |

### Coopetition (CLM / PKI)

**DigiCert · AppViewX · Entrust · CyberArk/Venafi** — partner for Convert (issuance); compete on full crypto inventory + Mosca + verify.

### Feature comparison (high level)

| Capability | Qtangl | Typical enterprise CPM |
|------------|--------|------------------------|
| Agentless external scan | **Yes** | Partial |
| Signed + **public verify** | **Yes** | No |
| Mosca HNDL scoring | **Yes** | Partial |
| CycloneDX CBOM | Yes | Yes |
| Drift / re-scan diff | Yes | Yes |
| Mid-market self-serve | **Yes** | No |
| Transparent pricing | **Yes** | No |
| Host/code depth | Partial | Yes (agents) |

**Pattern:** Lose on depth; win on packaging, speed, verifiable evidence, mid-market price.

---

## ICP (ideal customer profile)

| Attribute | Primary target |
|-----------|----------------|
| Industry | Regional bank, insurer, healthcare payer, gov contractor, FedRAMP-path SaaS |
| Size | 500–10,000 employees |
| Trigger | Board PQC mandate; CMMC audit; contract clause |
| Buyer | CISO, compliance lead, VP Engineering |
| Budget | $25K–$250K/yr for PQC tooling |

**Disqualifiers:** Fortune 50 needing FedRAMP High today; zero external TLS surface.

---

## Sales motion (readiness-first)

```
Outbound/content → Demo (live scan) → Assessment SOW → Deliver CBOM+PDF
  → Remediation workshop → Monitor annual → Convert add-on → Case study
```

Demo priority:

1. **Assessment + evidence** — scan → PDF/CBOM → `/verify` → transparency log
2. **Monitor drift** — second scan → diff → webhook
3. **Convert** — remediation backlog → what-if projection
4. **Optimization** — hospital demo (only if asked)

Collateral: [`demos/pqc_migration/`](../demos/pqc_migration/) · [`demos/pqc_migration/script.md`](../demos/pqc_migration/script.md)

---

## Related

- [COMPLIANCE.md](./COMPLIANCE.md) — framework → artifact mapping
- [06-gtm-and-pricing.md](../roadmap/quantum-readiness/06-gtm-and-pricing.md) — full GTM doc
- [11-competitive-intelligence.md](../roadmap/quantum-readiness/11-competitive-intelligence.md) — full competitor teardowns
- [sales-enablement/battlecards.md](../roadmap/quantum-readiness/sales-enablement/battlecards.md) — battlecards
