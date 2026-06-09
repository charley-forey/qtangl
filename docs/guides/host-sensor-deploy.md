# Host sensor deployment

Deploy the Qtangl Unified Sensor (`qtangl-sensor`) to discover certificates, crypto libraries, and TLS listeners on your fleet.

## Prerequisites

- Tenant feature flag `discovery.hostSensor` enabled (or `QTANGL_DISCOVERY_ENABLE_ALL=true` in dev)
- Monitor or Enterprise tier

## Create a fleet

1. Open **Dashboard → Integrations → Discovery depth**
2. Click **Create fleet** and copy the enrollment token
3. Token expires in 72 hours (max 100 enrollments)

## Linux install

```bash
go install github.com/qtangl/sensor/cmd/qtangl-sensor@latest
qtangl-sensor --enroll YOUR_TOKEN --api https://api.qtangl.com
qtangl-sensor --push --agent-id AGENT_ID --tenant-id TENANT_ID --api https://api.qtangl.com
```

## Kubernetes (Helm)

See `sensor/packaging/helm/qtangl-sensor/`.

## Air-gap

```bash
qtangl-sensor --output findings.zip
```

Upload via **Dashboard → Discovery depth → Offline upload** or `POST /tenant/discovery/offline-upload`.

## Troubleshooting

- **403 feature not enabled** — contact support to enable discovery flags
- **401 enroll** — token expired or max uses reached; rotate fleet token
- **Agent offline** — check heartbeat; agents silent >30d are auto-revoked
