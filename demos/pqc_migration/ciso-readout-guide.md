# CISO board readout guide (45 minutes)

## Prep (5 min)

- Send link: `https://www.qtangl.com/assess?scenario=bank-tls-inventory&autorun=1`
- Or fixture run live on call with customer's approved domain
- Have PDF + verify link ready from Evidence tab

## Agenda

| Time | Tab | Talking points |
|------|-----|----------------|
| 0–10 | Executive | Score, band, Mosca one-liner, top finding they didn't track |
| 10–20 | Compliance | Framework gaps (NIST IR 8547, CNSA 2.0, PCI/CMMC as relevant) |
| 20–30 | Inventory | Algorithm rollup, RSA/ECDSA concentration |
| 30–40 | Remediation | Top 3 backlog items + what-if projection |
| 40–45 | Evidence + upsell | Signed verify link; Monitor for drift between quarters |

## Board-safe phrases

- "Inventory aid, not attestation" — coverage confidence and scope limits
- "Harvest-now-decrypt-later" — Mosca X+Y vs Z
- "Signed evidence" — `/verify` independent of Qtangl UI

## Handoff

- Pilot: `/access?interest=Q-Day%20Monitor%20(annual)&source=assess-board`
- Production monitoring: `/dashboard` (never `/assess` for ongoing ops)
