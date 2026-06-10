from __future__ import annotations

import os
from typing import Any

from app.tenant.settings import DEFAULT_SETTINGS


def evaluate_scan_alerts(
    *,
    scan_diff: dict[str, Any] | None,
    readiness_score: float,
    readiness_band: str,
    settings: dict[str, Any] | None = None,
    assets: list[Any] | None = None,
) -> list[dict[str, Any]]:
    """Return triggered alert rules for a completed scan."""
    cfg = dict(DEFAULT_SETTINGS)
    if settings:
        cfg.update(settings)

    alerts: list[dict[str, Any]] = []
    readiness_drop_threshold = float(
        cfg.get("readinessDropThreshold", os.environ.get("QTANGL_ALERT_READINESS_DROP", "5"))
    )
    alert_on_new_qv = bool(cfg.get("alertOnNewQuantumVulnerable", True))
    cert_expiry_days = int(cfg.get("certExpiryDays", 30))

    if scan_diff:
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

        if alert_on_new_qv:
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

        diff_cert_count = int(scan_diff.get("certExpiringCount", 0))
        if diff_cert_count > 0:
            alerts.append(
                {
                    "rule": "cert_expiring_30d",
                    "severity": "medium",
                    "message": f"{diff_cert_count} certificate(s) expiring within {cert_expiry_days} days.",
                    "count": diff_cert_count,
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

    if assets:
        expiring = _assets_expiring_within_days(assets, cert_expiry_days)
        if expiring and not any(a.get("rule") == "cert_expiring_assets" for a in alerts):
            alerts.append(
                {
                    "rule": "cert_expiring_assets",
                    "severity": "medium",
                    "message": f"{len(expiring)} certificate(s) expire within {cert_expiry_days} days.",
                    "count": len(expiring),
                    "assets": expiring[:10],
                }
            )

    return alerts


def _assets_expiring_within_days(assets: list[Any], days: int) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for asset in assets:
        validity = getattr(asset, "validity_days", None)
        if validity is None and isinstance(asset, dict):
            validity = asset.get("validityDays") or asset.get("validity_days")
        if validity is not None and int(validity) <= days:
            label = getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else "")
            host = getattr(asset, "host", None) or (asset.get("host") if isinstance(asset, dict) else "")
            out.append({"label": label, "host": host, "validityDays": int(validity)})
    return out


def evaluate_cbom_alerts(drift: dict[str, Any]) -> list[dict[str, Any]]:
    """Return triggered alerts for CBOM ingest drift."""
    if not drift.get("available"):
        return []
    alerts: list[dict[str, Any]] = []
    added = int(drift.get("addedCount") or 0)
    changed = int(drift.get("changedCount") or 0)
    removed = int(drift.get("removedCount") or 0)
    if added > 0:
        alerts.append(
            {
                "rule": "cbom_assets_added",
                "severity": "medium",
                "message": f"{added} new cryptographic asset(s) in merged CBOM inventory.",
                "count": added,
            }
        )
    if changed > 0:
        alerts.append(
            {
                "rule": "cbom_assets_changed",
                "severity": "high",
                "message": f"{changed} CBOM asset(s) changed algorithm or metadata since last ingest.",
                "count": changed,
            }
        )
    if removed > 0:
        alerts.append(
            {
                "rule": "cbom_assets_removed",
                "severity": "info",
                "message": f"{removed} asset(s) no longer present in latest CBOM snapshot.",
                "count": removed,
            }
        )
    return alerts


def evaluate_drift_alerts(
    *,
    delta: dict[str, Any],
    source_type: str,
    settings: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Return triggered alerts for unified drift deltas."""
    if not delta.get("hasBaseline"):
        return []

    cfg = dict(DEFAULT_SETTINGS)
    if settings:
        cfg.update(settings)

    alerts: list[dict[str, Any]] = []
    added = int(delta.get("addedCount", 0))
    qv_delta = int(delta.get("quantumVulnerableDelta", 0))

    rule_map = {
        "host": "drift_host",
        "code": "drift_code",
        "binary": "drift_code",
        "cbom": "drift_cbom",
        "external": "drift_external",
    }
    rule = rule_map.get(source_type, "drift_generic")

    if added > 0:
        alerts.append(
            {
                "rule": rule,
                "severity": "high" if source_type in {"host", "external"} else "medium",
                "message": f"{added} new finding(s) in {source_type} drift since last snapshot.",
                "count": added,
                "sourceType": source_type,
            }
        )

    if qv_delta > 0 and cfg.get("alertOnNewQuantumVulnerable", True):
        alerts.append(
            {
                "rule": "new_quantum_vulnerable",
                "severity": "critical",
                "message": f"{qv_delta} new quantum-vulnerable asset(s) in {source_type} drift.",
                "count": qv_delta,
                "sourceType": source_type,
            }
        )

    sr = delta.get("sourceRuntimeDrift") or {}
    runtime_added = sr.get("runtimeOnlyAdded") or []
    source_added = sr.get("sourceOnlyAdded") or []
    if runtime_added or source_added:
        alerts.append(
            {
                "rule": "discovery_source_runtime_drift",
                "severity": "high",
                "message": (
                    f"Source/runtime mismatch: {len(runtime_added)} runtime-only, "
                    f"{len(source_added)} source-only changes."
                ),
                "runtimeOnlyAdded": runtime_added[:10],
                "sourceOnlyAdded": source_added[:10],
            }
        )

    removed = int(delta.get("removedCount", 0))
    if removed > 0 and not alerts:
        alerts.append(
            {
                "rule": rule,
                "severity": "info",
                "message": f"{removed} finding(s) removed in {source_type} drift.",
                "count": removed,
                "sourceType": source_type,
            }
        )

    return alerts


def should_send_regression_email(alerts: list[dict[str, Any]]) -> bool:
    return any(alert.get("severity") in {"high", "critical"} for alert in alerts)
