# Discovery & Demo Script

Repeatable discovery framework and demo flow for the readiness-first motion. Pairs with [06-gtm-and-pricing.md](../06-gtm-and-pricing.md) and the existing [demo script](../../../demos/pqc_migration/script.md).

---

## Discovery (MEDDICC-lite)

| Element | Questions |
|---------|-----------|
| **Metrics** | "How do you measure PQC readiness today? What does the board ask for?" |
| **Economic buyer** | "Who owns the PQC program budget?" |
| **Decision criteria** | "What would make this a yes — speed, evidence, price, compliance?" |
| **Decision process** | "What's your security review / procurement path?" |
| **Identify pain** | "Where do you lack visibility — JWKS, SSH, email, internal certs?" |
| **Champion** | "Who's accountable for the migration program?" |
| **Competition** | "Evaluating consultants, an incumbent, or building internally?" |

### Qualification (fit score)

| Signal | Strong fit |
|--------|------------|
| Trigger | Board mandate / audit / CMMC clause |
| Inventory state | None or spreadsheet |
| Size | 500–10,000 employees |
| Vertical | Bank / insurer / healthcare / gov contractor |
| Timeline | 2027/2030 deadline pressure |

Disqualify (politely): needs FedRAMP High today; no external crypto; pure research interest.

---

## Demo flow (15–20 min)

### Demo 1 — Assess + evidence (always lead)

1. **Frame (1 min)** — "Let's answer the board's exposure question in minutes, with evidence."
2. **Scan (3 min)** — Enter their domain (authorized) or relevant scenario; narrate CT → TLS → classify.
3. **Inventory (3 min)** — Heatmap + severity donut; call out JWKS/SSH/email a spreadsheet misses.
4. **Mosca (2 min)** — HNDL timeline: X+Y vs Z; "data you encrypt today is exposed."
5. **Backlog (2 min)** — Prioritized remediation with deadlines + effort.
6. **Evidence (3 min)** — Export signed PDF + CBOM; open `/verify`; "auditors trust this."

### Demo 2 — Monitor drift (the recurring value)

1. Run/show a second scan → **Diff panel**: new quantum-vulnerable asset, readiness delta, expiring cert.
2. Show scheduled scans + alert (Slack/webhook).
3. "One scan is a snapshot; crypto drifts — this is why Monitor is the product."

### Demo 3 — Convert (for engaged buyers)

1. Assign owner + status on a backlog item.
2. What-if readiness projection.
3. Re-scan verifies fix → verify link on the item.
4. "Your score climbs with proof; partners can deliver the labor."

### Demo 4 — Optimization (only on request / Stage 6)

- Brief hospital scoreboard; honest classical-vs-hybrid. Do **not** lead here.

---

## Demo principles

| Do | Don't |
|----|-------|
| Use their domain when authorized | Overclaim ("formal audit") |
| Show signed verify link | Imply live QPU |
| End on Monitor proposal | Pitch optimization early |
| Quantify net-new findings | Fear-monger ("you're broken") |

---

## Post-demo next steps

1. Send recap + sample CBOM + `/verify` link
2. Propose 90-day Assessment SOW ([pqc-pilot-sow.md](../../optimization_OLD_FUTURE/templates/pqc-pilot-sow.md))
3. Schedule remediation workshop (Week 2) with Monitor proposal
4. Log in CRM ([crm-log.md](../../../demos/pqc_migration/outreach/crm-log.md)); capture win/loss fields ([11](../11-competitive-intelligence.md))

---

## Related

- GTM motion: [06-gtm-and-pricing.md](../06-gtm-and-pricing.md)
- Objections: [objection-handling.md](./objection-handling.md)
- ROI: [roi-calculator.md](./roi-calculator.md)
- Demo script (timed): [script.md](../../../demos/pqc_migration/script.md)
