# Sensor staging smoke

Prove the host sensor pipeline on staging: fleet enrollment → agent heartbeat → findings push → drift widget + program items.

## Prerequisites

- Staging API URL and tenant API key with write access
- `discovery.hostSensor` enabled (script enables automatically unless `--skip-settings`)
- mTLS not required on staging (`DISCOVERY_MTLS_REQUIRED=false`, default)

## Quick run

```bash
export QTANGL_API_BASE=https://staging-api.qtangl.com
export QTANGL_API_KEY=your-tenant-key

python backend/scripts/sensor_staging_smoke.py --simulate-findings
```

Exit `0` = pass, `1` = assertion failure, `2` = missing credentials.

## Manual acceptance (UI)

1. **Enable feature:** Settings or `PUT /tenant/settings` → `discovery.hostSensor: true`
2. **Monitor → Advanced → Host sensor fleet:** Create fleet, copy install command
3. **Enroll sensor:**
   ```bash
   qtangl-sensor --enroll TOKEN --api $QTANGL_API_BASE --hostname myhost
   ```
4. **Save cert** from enroll JSON; run daemon:
   ```bash
   qtangl-sensor --daemon --agent-id=... --tenant-id=... --cert=/path/to/cert.pem --api $QTANGL_API_BASE
   ```
5. **Or force push:** `qtangl-sensor --push ...`
6. **Verify UI:** AgentFleetTable shows `findingsCount > 0`; Host drift widget updates

## Architecture note

The **Refresh fleet summary** button enqueues a metadata job (`host_fleet_scan`). **Findings arrive via sensor push**, not that button. Sensors push on daemon start and every 24h.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 403 on fleet create | Enable `discovery.hostSensor` |
| Enroll 401 | Token expired; rotate or create new fleet |
| findingsCount 0 | Run `--push` or wait for daemon scan interval |
| CBOM count unchanged | Check `ingest_scan_assets` logs; re-push findings |

## Ops: enable flag via provision script

```bash
python backend/scripts/provision_tenant.py --name "Staging Sensor" --tier enterprise --enable-host-sensor
```
