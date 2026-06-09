from __future__ import annotations

DISCOVERY_SCHEMA_VERSION = 1
DISCOVERY_SCHEMA_HEADER = "X-Qtangl-Discovery-Schema"

SOURCE_METHODS = {
    "host_sensor": "qtangl:host-sensor",
    "code_scan": "qtangl:code-scan",
    "binary_scan": "qtangl:binary-scan",
    "agentless": "qtangl:agentless-scan",
}

JOB_TYPES = ("host_fleet_scan", "code_scan", "binary_scan", "repo_scheduled_scan")

PRIVATE_KEY_MARKERS = (
    "BEGIN PRIVATE KEY",
    "BEGIN RSA PRIVATE KEY",
    "BEGIN EC PRIVATE KEY",
    "BEGIN ENCRYPTED PRIVATE KEY",
)

FINDINGS_RATE_LIMIT_PER_MIN = 10_000
SCAN_ENQUEUE_RATE_LIMIT_PER_HOUR = 50
