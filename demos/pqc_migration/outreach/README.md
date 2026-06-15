# PQC scanner outreach

Collateral for CISO / compliance leads — aligned with **Assess → Monitor → Convert** positioning.

## Primary links

| Asset | URL |
|-------|-----|
| Q-Day scanner (live) | https://qtangl.com/assess |
| Free mini-assessment | https://qtangl.com/assess/mini |
| Legacy demo URL (redirects to `/assess`) | https://qtangl.com/demo/pqc |
| Platform overview | https://qtangl.com/platform |
| Monitor preview | https://qtangl.com/monitor |
| Convert preview | https://qtangl.com/convert |
| Q-Day education hub | https://qtangl.com/q-day |
| Sample CBOM (ungated) | https://qtangl.com/samples/sample-cbom-bank-tls-inventory.json |
| Sample report | https://qtangl.com/q-day/sample-report |
| Verify a report | https://qtangl.com/verify?token=sample-token |
| Request pilot | https://qtangl.com/access |
| Blog RSS | https://qtangl.com/blog/feed.xml |

## Vertical scenarios

Use `scenario=` or `case=` query param (both supported on `/assess`):

| Scenario | URL | Frameworks |
|----------|-----|------------|
| `bank-tls-inventory` | https://qtangl.com/assess?scenario=bank-tls-inventory&autorun=1 | NSM-10, PCI-DSS 4.0, NIST CSF |
| `gov-contractor-cmmc` | https://qtangl.com/assess?scenario=gov-contractor-cmmc&autorun=1 | CMMC L2, CNSA 2.0, SP 800-208 |
| `healthcare-insurer-hndl` | https://qtangl.com/assess?scenario=healthcare-insurer-hndl&autorun=1 | HIPAA, NIST IR 8547, EU CRA |

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
3. **Convert** (expand) — remediation program with verify-fix workflow

See `/blog` for readiness articles and `/q-day/frameworks/*` for compliance pillar guides.
