from __future__ import annotations

import os
from typing import Any


def evaluate_scan_alerts(
    *,
    scan_diff: dict[str, Any] | None,
    readiness_score: float,
    readiness_band: str,
) -> list[dict[str, Any]]:
    """Return triggered alert rules for a completed scan."""
    if not scan_diff:
        return []

    alerts: list[dict[str, Any]] = []
    readiness_drop_threshold = float(os.environ.get("QTANGL_ALERT_READINESS_DROP", "5"))
    delta = float(scan_diff.get("readinessDelta", 0))

    if delta <= -readiness_drop_threshold:
        alerts.append(
            {
                "rule": "readiness_drop",
                "severity": "high",
                "message": f"Readiness dropped {abs(delta):.1f} points since last scan.",
                "readinessDelta": delta,
            }
        )

    new_qv = int(scan_diff.get("newQuantumVulnerableCount", 0))
    if new_qv > 0:
        alerts.append(
            {
                "rule": "new_quantum_vulnerable",
                "severity": "critical",
                "message": f"{new_qv} new quantum-vulnerable asset(s) since last scan.",
                "count": new_qv,
            }
        )

    cert_count = int(scan_diff.get("certExpiringCount", 0))
    if cert_count > 0:
        alerts.append(
            {
                "rule": "cert_expiring_30d",
                "severity": "medium",
                "message": f"{cert_count} certificate(s) expiring within 30 days.",
                "count": cert_count,
            }
        )

    degraded = scan_diff.get("degradedAlgorithms") or []
    if degraded:
        alerts.append(
            {
                "rule": "algorithm_degraded",
                "severity": "high",
                "message": f"{len(degraded)} asset(s) show worse crypto posture than last scan.",
                "count": len(degraded),
            }
        )

    if not alerts and scan_diff.get("summary"):
        alerts.append(
            {
                "rule": "scan_diff_info",
                "severity": "info",
                "message": str(scan_diff["summary"]),
            }
        )

    return alerts


def should_send_regression_email(alerts: list[dict[str, Any]]) -> bool:
    return any(alert.get("severity") in {"high", "critical"} for alert in alerts)
