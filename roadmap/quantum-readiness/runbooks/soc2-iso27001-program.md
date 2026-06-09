# SOC 2 Type II / ISO 27001 program (scaffold)

Enterprise compliance track for Monitor upmarket deals (Phase 7 E9).

## In scope controls

- OIDC SSO (`app/auth/oidc.py`)
- RBAC: admin / write / readonly roles
- Audit log export via `GET /tenant/audit` and SIEM streaming via `GET /tenant/audit/export` (NDJSON)
- SIEM webhook stream (existing webhook events)

## Evidence mapping

| Control | Qtangl artifact |
|---------|-----------------|
| Integrity | Signed reports + transparency log |
| Availability | `/health/ready`, `/status`, evidence SLO |
| Confidentiality | Tenant encryption, KMS signing (E1) |

Status: program documentation — formal audit engagement TBD.
