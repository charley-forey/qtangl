# PQC scanner outreach

Collateral for CISO / compliance leads — aligned with **Assess → Monitor → Convert** positioning.

## Primary links

| Asset | URL |
|-------|-----|
| Q-Day scanner demo | https://qtangl.com/demo/pqc |
| Platform overview | https://qtangl.com/platform |
| Monitor preview | https://qtangl.com/monitor |
| Convert preview | https://qtangl.com/convert |
| Q-Day education hub | https://qtangl.com/q-day |
| Verify a report | https://qtangl.com/verify |
| Request pilot | https://qtangl.com/access |

## Vertical scenarios

| Scenario | URL | Frameworks |
|----------|-----|------------|
| `bank-tls-inventory` | `/demo/pqc?scenario=bank-tls-inventory` | NSM-10, PCI-DSS 4.0, NIST CSF |
| `gov-contractor-cmmc` | `/demo/pqc?scenario=gov-contractor-cmmc` | CMMC L2, CNSA 2.0, SP 800-208 |
| `healthcare-insurer-hndl` | `/demo/pqc?scenario=healthcare-insurer-hndl` | HIPAA, NIST IR 8547, EU CRA |

## Collateral files

- `cold_email.md` — intro + Monitor follow-up templates
- `../demo_specs.md` — executive briefings
- `../case-study-template.md` — design partner write-ups

## Sales leave-behind (B5 compliance report packs)

After a fixture or live scan, download the **PDF** or **JSON** report from `GET /pqc/report/{scanId}?format=pdf|json`.

Reports surface **Mosca HNDL assessment**, **framework mapping**, remediation backlog, and a **PQ TLS handshake proof appendix**.

## Journey messaging

1. **Assess** (land) — one-time scan + signed evidence → pitch Monitor before delivery
2. **Monitor** (recurring) — drift alerts, trend chart, scheduled re-scans
3. **Convert** (expand) — remediation program, what-if, re-scan verification

Never lead with optimization demos in PQC outreach. Link `/platform/optimize` only after readiness conversation is established.
