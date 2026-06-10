"""Lightweight drift/remediation metrics (Prometheus-compatible counters)."""

from __future__ import annotations

_count: dict[str, float] = {}


def _inc(key: str, amount: float = 1.0) -> None:
    _count[key] = _count.get(key, 0.0) + amount


def increment_drift_snapshot(*, tenant_id: str, source_type: str) -> None:
    _inc(f"qtangl_drift_snapshots_total{{tenant_id={tenant_id},source_type={source_type}}}")


def increment_drift_snapshot_error(*, source_type: str) -> None:
    _inc(f"qtangl_drift_snapshot_write_errors_total{{source_type={source_type}}}")


def increment_drift_alert(*, alert_type: str, severity: str) -> None:
    _inc(f"qtangl_drift_alerts_fired_total{{alert_type={alert_type},severity={severity}}}")


def set_remediation_sync_lag(*, provider: str, seconds: float) -> None:
    _count[f"qtangl_remediation_sync_lag_seconds{{provider={provider}}}"] = seconds


def increment_remediation_sync_failure(*, provider: str) -> None:
    _inc(f"qtangl_remediation_sync_failures_total{{provider={provider}}}")


def get_metrics_snapshot() -> dict[str, float]:
    return dict(_count)
