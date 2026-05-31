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
