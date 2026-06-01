from __future__ import annotations

from typing import Any


def _asset_fingerprint(asset: dict[str, Any]) -> str:
    host = str(asset.get("host", ""))
    port = asset.get("port")
    kind = str(asset.get("kind", ""))
    algorithm = str(asset.get("algorithm", ""))
    return f"{host}:{port}:{kind}:{algorithm}"


def _is_quantum_vulnerable(asset: dict[str, Any]) -> bool:
    vuln = asset.get("vulnerability") or {}
    status = vuln.get("status", "unknown")
    pqc_ready = bool(asset.get("pqcReady") or asset.get("pqc_ready"))
    return status in {"at-risk", "broken"} and not pqc_ready


def _readiness_score(bundle: dict[str, Any]) -> float:
    report = bundle.get("report") or {}
    return float(report.get("readinessScore", 0))


def compare_scan_bundles(
    current: dict[str, Any],
    previous: dict[str, Any],
    *,
    previous_scan_id: str,
) -> dict[str, Any]:
    """Compare two serialized scan bundles and return drift summary."""
    cur_assets = current.get("assets") or []
    prev_assets = previous.get("assets") or []

    cur_map = {_asset_fingerprint(asset): asset for asset in cur_assets}
    prev_map = {_asset_fingerprint(asset): asset for asset in prev_assets}

    cur_keys = set(cur_map)
    prev_keys = set(prev_map)

    new_assets = [cur_map[key] for key in sorted(cur_keys - prev_keys)]
    removed_assets = [prev_map[key] for key in sorted(prev_keys - cur_keys)]

    degraded: list[dict[str, Any]] = []
    for key in cur_keys & prev_keys:
        cur_vuln = (cur_map[key].get("vulnerability") or {}).get("status", "unknown")
        prev_vuln = (prev_map[key].get("vulnerability") or {}).get("status", "unknown")
        severity_order = {"safe": 0, "unknown": 1, "at-risk": 2, "broken": 3}
        if severity_order.get(cur_vuln, 1) > severity_order.get(prev_vuln, 0):
            degraded.append(
                {
                    "assetId": cur_map[key].get("id"),
                    "label": cur_map[key].get("label"),
                    "previousStatus": prev_vuln,
                    "currentStatus": cur_vuln,
                }
            )

    cur_qv = sum(1 for asset in cur_assets if _is_quantum_vulnerable(asset))
    prev_qv = sum(1 for asset in prev_assets if _is_quantum_vulnerable(asset))
    new_quantum_vulnerable = [asset for asset in new_assets if _is_quantum_vulnerable(asset)]

    cur_score = _readiness_score(current)
    prev_score = _readiness_score(previous)

    cert_expiring: list[dict[str, Any]] = []
    for asset in cur_assets:
        validity = asset.get("validityDays") or asset.get("validity_days")
        if validity is not None and int(validity) <= 30:
            cert_expiring.append(
                {
                    "assetId": asset.get("id"),
                    "label": asset.get("label"),
                    "validityDays": int(validity),
                }
            )

    timeline = _asset_timeline(
        new_assets=new_assets,
        removed_assets=removed_assets,
        degraded=degraded,
        current_map=cur_map,
        previous_map=prev_map,
    )
    drift_causes = _drift_causes(
        new_assets=new_assets,
        removed_assets=removed_assets,
        degraded=degraded,
        cert_expiring_count=len(cert_expiring),
    )

    return {
        "previousScanId": previous_scan_id,
        "readinessDelta": round(cur_score - prev_score, 2),
        "previousReadinessScore": prev_score,
        "currentReadinessScore": cur_score,
        "newAssets": [_asset_summary(asset) for asset in new_assets[:25]],
        "removedAssets": [_asset_summary(asset) for asset in removed_assets[:25]],
        "degradedAlgorithms": degraded[:25],
        "newQuantumVulnerable": [_asset_summary(asset) for asset in new_quantum_vulnerable[:25]],
        "newQuantumVulnerableCount": max(0, cur_qv - prev_qv),
        "certExpiringWithin30Days": cert_expiring[:25],
        "certExpiringCount": len(cert_expiring),
        "assetTimeline": timeline[:40],
        "driftCauses": drift_causes,
        "summary": _diff_summary(
            new_count=len(new_assets),
            removed_count=len(removed_assets),
            degraded_count=len(degraded),
            readiness_delta=cur_score - prev_score,
            new_qv=len(new_quantum_vulnerable),
        ),
    }


def _asset_summary(asset: dict[str, Any]) -> dict[str, Any]:
    vuln = asset.get("vulnerability") or {}
    return {
        "id": asset.get("id"),
        "label": asset.get("label"),
        "host": asset.get("host"),
        "kind": asset.get("kind"),
        "algorithm": asset.get("algorithm"),
        "severity": vuln.get("severity"),
        "status": vuln.get("status"),
    }


def _diff_summary(
    *,
    new_count: int,
    removed_count: int,
    degraded_count: int,
    readiness_delta: float,
    new_qv: int,
) -> str:
    parts: list[str] = []
    if readiness_delta > 0:
        parts.append(f"Readiness improved by {readiness_delta:.1f} points")
    elif readiness_delta < 0:
        parts.append(f"Readiness dropped by {abs(readiness_delta):.1f} points")
    if new_qv:
        parts.append(f"{new_qv} newly quantum-vulnerable asset(s)")
    if degraded_count:
        parts.append(f"{degraded_count} asset(s) degraded")
    if new_count:
        parts.append(f"{new_count} new asset(s) discovered")
    if removed_count:
        parts.append(f"{removed_count} asset(s) no longer seen")
    return "; ".join(parts) if parts else "No material changes since last scan."


def _asset_timeline(
    *,
    new_assets: list[dict[str, Any]],
    removed_assets: list[dict[str, Any]],
    degraded: list[dict[str, Any]],
    current_map: dict[str, dict[str, Any]],
    previous_map: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    timeline: list[dict[str, Any]] = []
    for asset in new_assets:
        timeline.append(
            {
                "assetId": asset.get("id"),
                "label": asset.get("label"),
                "state": "first_seen",
                "detail": "Asset discovered in latest scan.",
            }
        )
    for asset in removed_assets:
        timeline.append(
            {
                "assetId": asset.get("id"),
                "label": asset.get("label"),
                "state": "removed",
                "detail": "Asset no longer present.",
            }
        )
    for row in degraded:
        timeline.append(
            {
                "assetId": row.get("assetId"),
                "label": row.get("label"),
                "state": "regressed",
                "detail": f"{row.get('previousStatus')} -> {row.get('currentStatus')}",
            }
        )
    for key in set(current_map) & set(previous_map):
        cur = current_map[key]
        prev = previous_map[key]
        if str(cur.get("algorithm")) != str(prev.get("algorithm")):
            timeline.append(
                {
                    "assetId": cur.get("id"),
                    "label": cur.get("label"),
                    "state": "changed_algo",
                    "detail": f"{prev.get('algorithm')} -> {cur.get('algorithm')}",
                }
            )
    return timeline


def _drift_causes(
    *,
    new_assets: list[dict[str, Any]],
    removed_assets: list[dict[str, Any]],
    degraded: list[dict[str, Any]],
    cert_expiring_count: int,
) -> list[dict[str, Any]]:
    causes: list[dict[str, Any]] = []
    if new_assets:
        causes.append({"cause": "endpoint_expansion", "count": len(new_assets)})
    if removed_assets:
        causes.append({"cause": "endpoint_removed", "count": len(removed_assets)})
    if degraded:
        causes.append({"cause": "algorithm_downgrade_or_regression", "count": len(degraded)})
    if cert_expiring_count:
        causes.append({"cause": "certificate_horizon_risk", "count": cert_expiring_count})
    if not causes:
        causes.append({"cause": "no_material_drift", "count": 0})
    return causes
