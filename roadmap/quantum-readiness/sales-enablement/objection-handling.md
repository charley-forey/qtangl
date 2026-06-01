# Objection Handling

Comprehensive objection responses for the readiness motion. Extends the table in [06-gtm-and-pricing.md](../06-gtm-and-pricing.md) and [e1-week1-playbook.md](../../../demos/pqc_migration/e1-week1-playbook.md).

**Method:** Acknowledge → reframe → prove (with an artifact). Never argue; lead to evidence.

---

## Timing / urgency

| Objection | Response | Proof |
|-----------|----------|-------|
| "Quantum is years away." | Acknowledge — but HNDL means data encrypted today is harvested now, decrypted post-Q-Day. Mosca: if shelf-life + migration time > time-to-Q-Day, you're already exposed. | Mosca timeline; deadline tiers |
| "We'll deal with it when standards settle." | Standards are settled — FIPS 203/204/205 finalized (2024). Mandates (NSM-10/CMMC) have deadlines now. | Standards refs ([23](../23-glossary-and-references.md)) |
| "Not a priority this year." | The migration is multi-year (2027–2035). Starting late compresses runway and raises cost. A baseline now is low-cost insurance. | Free mini-assessment |

## Build vs buy

| Objection | Response | Proof |
|-----------|----------|-------|
| "We can script our own scans." | Scripts find endpoints; they don't score Mosca, map frameworks, track drift, or produce signed auditor evidence. | Signed PDF + `/verify` + diff |
| "It's just open-source (liboqs)." | OQS gives primitives; we give the assembled, auditable program — orchestration, report, drift, compliance crosswalk. | CBOM + compliance pack |
| "Our CLM vendor adds PQC." | Keep your CLM. We add PQC-first posture (Mosca, CBOM, readiness score) and signed evidence it lacks; we're complementary. | Battlecard ([battlecards.md](./battlecards.md)) |

## Competition

| Objection | Response | Proof |
|-----------|----------|-------|
| "We're looking at SandboxAQ." | Strong brand. If you want a fast, verifiable baseline this quarter at mid-market price without an enterprise program, that's us. | Demo-in-minutes + pricing |
| "Our consultants will handle it." | Consultants deliver a deck that's stale on arrival. We're a living system of record + evidence — and partner with consultants for labor. | Drift demo; partner model |

## Trust / maturity

| Objection | Response | Proof |
|-----------|----------|-------|
| "Are you secure enough to hold this data?" | We sell to security teams and hold ourselves to the standard — we scan ourselves weekly and publish it. | Trust center; self-scan badge ([12](../12-platform-security-and-trust.md)) |
| "You're a young company." | Yes — that's why we're transparent: signed evidence, honest notes, SOC 2 in progress, and references. | SOC2 status; references |
| "What if you disappear?" | Your data and CBOM are exportable in open formats (CycloneDX); no lock-in of the inventory itself. | CBOM export |

## Scope / accuracy

| Objection | Response | Proof |
|-----------|----------|-------|
| "Will it find internal certs, not just external?" | Yes via cloud inventory import (ACM/Key Vault) and PEM/K8s upload, plus external scanning. | Cloud import ([15](../15-partnerships-and-ecosystem.md)) |
| "How accurate is it?" | We're transparent: it's an inventory aid, not a formal audit; coverage is endpoint-scoped with confidence shown. | Honesty notes; coverage confidence |
| "False positives?" | Severities map to standards; you review and set status; re-scan verifies fixes. | Remediation workflow |

## Price / procurement

| Objection | Response | Proof |
|-----------|----------|-------|
| "Too expensive." | Compare to a consulting baseline plus ongoing manual effort — Monitor is comparable or lower and continuous. | ROI calculator ([roi-calculator.md](./roi-calculator.md)) |
| "No budget this year." | Start with a one-time Assessment; convert to Monitor next cycle. Or run a free mini-scan to build the internal case. | Assessment SOW; mini-scan |
| "Procurement/security review is slow." | We pre-answer 80% of questionnaires on our trust center and provide DPA/SOC2 under NDA. | Trust center ([12](../12-platform-security-and-trust.md)) |

## Internal / champion

| Objection | Response | Proof |
|-----------|----------|-------|
| "I need to convince my board/CISO." | We provide a board one-pager: exposure range, deadlines, 90-day decisions. | `report_to_board()` output |
| "Different team owns this." | Happy to multi-thread — CISO for risk, VP Eng for execution, compliance for audit. | Persona-mapped value ([02](../02-customer-journey.md)) |

---

## Hard-won phrases

- "Quantum is the threat, not the engine."
- "A spreadsheet is stale the day after you finish it."
- "We hold ourselves to the standard we sell."
- "Inventory aid, not a formal audit — and that honesty is why auditors trust the evidence."

---

## Related

- GTM objections table: [06-gtm-and-pricing.md](../06-gtm-and-pricing.md)
- Battlecards: [battlecards.md](./battlecards.md)
- Trust: [12-platform-security-and-trust.md](../12-platform-security-and-trust.md)
