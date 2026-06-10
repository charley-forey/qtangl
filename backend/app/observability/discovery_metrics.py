"""Discovery SLO metrics helpers."""

from __future__ import annotations

from app.observability.metrics import gauge, increment, snapshot


def record_queue_depth(depth: int) -> None:
    gauge("discovery_queue_depth", float(depth))


def record_job_dlq() -> None:
    increment("discovery_job_dlq")


def record_heartbeat_lag_minutes(lag: float) -> None:
    gauge("discovery_heartbeat_lag_minutes", lag)


def discovery_slo_snapshot() -> dict[str, float]:
    snap = snapshot()
    gauges = snap.get("gauges", {})
    counters = snap.get("counters", {})
    return {
        "findingsIngested": float(counters.get("discovery_findings_ingested", 0)),
        "queueDepth": float(gauges.get("discovery_queue_depth", 0)),
        "ingestLatencyMs": float(gauges.get("discovery_ingest_latency_ms", 0)),
        "heartbeatLagMinutes": float(gauges.get("discovery_heartbeat_lag_minutes", 0)),
        "jobDlq": float(counters.get("discovery_job_dlq", 0)),
    }
