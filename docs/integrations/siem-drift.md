# SIEM ingestion — drift webhook v2

Qtangl drift alerts use webhook schema `qtangl-webhook-v2` with `event: drift.detected`.

## Payload shape

```json
{
  "schemaVersion": "qtangl-webhook-v2",
  "event": "drift.detected",
  "tenantId": "tenant-abc",
  "jobId": "disc-xyz",
  "scanId": null,
  "driftDelta": {
    "sourceType": "host",
    "scopeKey": "fleet-prod",
    "addedCount": 3,
    "removedCount": 1,
    "hasBaseline": true
  },
  "alerts": [
    {
      "rule": "drift_host",
      "severity": "high",
      "message": "3 new finding(s) in host drift since last snapshot."
    }
  ]
}
```

## Splunk HEC

```
index=security sourcetype=qtangl:drift
| spath path=driftDelta.addedCount output=added
| spath path=alerts{} severity output=severity
| where added > 0 AND severity in ("high", "critical")
```

## Elastic Common Schema

Map fields:
- `event.action` → `drift.detected`
- `qtangl.source_type` → `driftDelta.sourceType`
- `qtangl.added_count` → `driftDelta.addedCount`
- `rule.name` → `alerts.rule`
