# SOC 2 — remediation audit sampling

## Procedure

1. Monthly sample 25 `remediation.status_changed` audit events per pilot tenant.
2. Verify each event has actor, timestamp, and from/to status in `detail_json`.
3. For `done` items, confirm matching `verification_proofs` row or ITSM sync `synced_at`.
4. Document exceptions in compliance tracker.

## Evidence

Export via `GET /tenant/audit?action=remediation.status_changed`.
