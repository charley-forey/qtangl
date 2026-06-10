# SOC 2 — remediation audit sampling

## Procedure

1. Monthly sample 25 `remediation.status_changed` audit events per pilot tenant.
2. Verify each event has actor, timestamp, and from/to status in `detail_json`.
3. For `done` items, confirm matching `verification_proofs` row or ITSM sync `synced_at`.
4. Document exceptions in compliance tracker.

## Evidence

Export via `GET /tenant/audit?action=remediation.status_changed`.

## Crypto flip extension

1. Monthly sample 15 `flip_approved` and `flip_completed` audit events per Convert tenant.
2. Verify prod flips have matching `flip_approvals` row with `approval_note`.
3. Confirm `before_snapshot_id` and `after_snapshot_id` populated on succeeded jobs.
4. Enterprise KMS prod: assert approver ≠ submitter in audit `detail_json`.
