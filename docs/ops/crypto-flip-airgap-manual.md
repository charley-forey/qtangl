# Air-gap manual flip playbook

For disconnected environments without live CLM/KMS API access:

1. Export flip playbook JSON from program item (`GET /tenant/remediation/program/{id}/playbook`).
2. Customer executes change manually per provider runbook.
3. Upload proof via verify re-scan job or manual proof attachment on program item.
4. Record drift snapshots using exported before/after scan bundles ingested via CBOM import.
5. Mark flip job as `succeeded` with `external_ref: manual-{ticket}` via partner API (MSSP scope).

Qtangl never receives private key material in air-gap mode.
