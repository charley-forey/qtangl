# PQC scanner outreach

Collateral for CISO / compliance leads:

- `cold_email.md` — short intro with demo link `/demo/pqc`
- Use `demo_specs.md` for executive briefings

## Sales leave-behind (B5 compliance report packs)

After a fixture or live scan, download the **PDF** or **JSON** report from `GET /pqc/report/{scanId}?format=pdf|json`.

Each scenario includes a pre-built compliance pack:

| Scenario | Primary frameworks |
|----------|-------------------|
| `bank-tls-inventory` | NSM-10, PCI-DSS 4.0, NIST CSF |
| `gov-contractor-cmmc` | CMMC L2, CNSA 2.0, SP 800-208 |
| `healthcare-insurer-hndl` | HIPAA, NIST IR 8547, EU CRA |

Reports surface **Mosca HNDL assessment**, **framework mapping**, remediation backlog, and a **PQ TLS handshake proof appendix**.
