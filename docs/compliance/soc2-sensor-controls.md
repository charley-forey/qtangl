# SOC 2 control mapping — Qtangl Unified Sensor

| Control | Implementation |
|---------|----------------|
| CC6.1 Logical access | Fleet enrollment tokens; tenant-scoped agent IDs |
| CC6.6 Encryption | TLS 1.2+ for agent telemetry; no key exfiltration |
| CC7.2 System monitoring | Heartbeat SLOs; stale agent revocation |
| CC8.1 Change management | cosign-signed sensor releases; version lock file |
| CC9.2 Risk mitigation | Pen-test scope in ADR-009 security appendix |

Audit trail: `discovery.fleet_created`, `discovery.agent.enroll` in tenant audit log.
