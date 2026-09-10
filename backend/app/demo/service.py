from __future__ import annotations

import threading
import time
import uuid
from typing import Any

from app.demo.assess import run_demo_assessment
from app.demo.config import DEMO_CADENCE_SEC
from app.demo.events import publish_event
from app.demo.narration import build_narration
from app.demo.registry import DemoResource
from app.demo.seed import seed_enterprise_fleet
from app.demo.store import (
    is_seeded,
    latest_snapshot,
    list_snapshots,
    mark_seeded,
    replace_all_resources,
    save_snapshot,
)
from app.monitoring.alerts import evaluate_scan_alerts
from app.monitoring.diff import compare_scan_bundles
from app.pqc.signing import sign_report_payload

_REASSESS_LOCK = threading.Lock()
_LAST_CADENCE_AT = 0.0
_CHAOS_ENABLED = False


def ensure_seeded() -> None:
    if is_seeded():
        mark_seeded()
        return
    replace_all_resources(seed_enterprise_fleet())
    mark_seeded()


def _severity_counts(assets: list[dict[str, Any]]) -> dict[str, int]:
    counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    for asset in assets:
        vuln = asset.get("vulnerability") or {}
        sev = str(vuln.get("severity") or "info")
        counts[sev] = counts.get(sev, 0) + 1
    return counts


def _hndl_exposed(assets: list[dict[str, Any]]) -> int:
    total = 0
    for asset in assets:
        vuln = asset.get("vulnerability") or {}
        if vuln.get("hndlExposed") or vuln.get("hndl_exposed"):
            total += 1
    return total


def _per_resource_status(bundle: dict[str, Any], resources: list[DemoResource]) -> list[dict[str, Any]]:
    by_id: dict[str, list[dict[str, Any]]] = {}
    by_endpoint: dict[tuple[str, Any, Any], list[dict[str, Any]]] = {}
    for asset in bundle.get("assets") or []:
        by_id.setdefault(str(asset.get("id")), []).append(asset)
        endpoint = (str(asset.get("host") or "").lower().rstrip("."), asset.get("port"), asset.get("kind"))
        by_endpoint.setdefault(endpoint, []).append(asset)
    rows = []
    for resource in resources:
        matches = by_id.get(resource.id) or by_endpoint.get(
            (resource.host.lower().rstrip("."), resource.port, resource.kind), []
        )
        asset = matches[0] if resource.enabled and len(matches) == 1 else None
        vuln = (asset or {}).get("vulnerability") or {}
        rows.append(
            {
                "resourceId": resource.id,
                "label": resource.label,
                "host": resource.host,
                "port": resource.port,
                "businessUnit": resource.business_unit,
                "posture": resource.posture,
                "complianceTarget": resource.compliance_target,
                "enabled": resource.enabled,
                "activeEvents": resource.active_events,
                "severity": vuln.get("severity", "unknown"),
                "status": vuln.get("status", "unknown"),
                # The signed score describes the full report, not this resource.
                "readinessScore": None,
            }
        )
    return rows


def reassess_demo(
    *,
    scene_id: str | None = None,
    campaign_id: str | None = None,
    reason: str = "manual",
) -> dict[str, Any]:
    with _REASSESS_LOCK:
        ensure_seeded()
        from app.demo.store import list_resources

        resources = list_resources()
        previous = latest_snapshot()
        scan_id = f"demo-{uuid.uuid4().hex[:16]}"
        bundle = run_demo_assessment(resources=resources, scan_id=scan_id)

        report = dict(bundle.get("report") or {})
        report_payload = {k: v for k, v in report.items() if k != "signature"}
        signature = sign_report_payload(report_payload)
        report["signature"] = signature
        bundle["report"] = report

        scan_diff = None
        alerts: list[dict[str, Any]] = []
        if previous and previous.get("bundle"):
            scan_diff = compare_scan_bundles(
                bundle,
                previous["bundle"],
                previous_scan_id=str(previous.get("scanId") or ""),
            )
            alerts = evaluate_scan_alerts(
                scan_diff=scan_diff,
                readiness_score=float(report.get("readinessScore") or 0),
                readiness_band=str(report.get("readinessBand") or ""),
                assets=bundle.get("assets") or [],
            )

        narration = build_narration(previous=previous, current=None)
        snapshot = save_snapshot(
            {
                "scanId": scan_id,
                "readinessScore": float(report.get("readinessScore") or 0),
                "readinessBand": str(report.get("readinessBand") or ""),
                "severityCounts": _severity_counts(bundle.get("assets") or []),
                "hndlExposed": _hndl_exposed(bundle.get("assets") or []),
                "perResourceStatus": _per_resource_status(bundle, resources),
                "alerts": alerts,
                "signature": signature,
                "bundle": bundle,
                "narration": narration,
                "sceneId": scene_id,
                "campaignId": campaign_id,
                "reason": reason,
            }
        )

        publish_event("snapshot", {"snapshot": _public_snapshot(snapshot), "reason": reason})
        for alert in alerts:
            publish_event("alert", alert)
        publish_event("narration", {"text": narration})
        if scene_id:
            publish_event("scene", {"sceneId": scene_id})
        return snapshot


def _public_snapshot(snapshot: dict[str, Any]) -> dict[str, Any]:
    payload = dict(snapshot)
    payload.pop("bundle", None)
    return payload


def get_status() -> dict[str, Any]:
    ensure_seeded()
    from app.demo.store import list_resources

    latest = latest_snapshot()
    resources = [r.to_dict() for r in list_resources()]
    return {
        "status": "success",
        "simulation": True,
        "honestyNote": "Controlled demo simulation — inventory aid, not a formal audit.",
        "resources": resources,
        "latestSnapshot": _public_snapshot(latest) if latest else None,
        "cadenceSec": DEMO_CADENCE_SEC,
        "chaosEnabled": _CHAOS_ENABLED,
    }


def get_trend(*, limit: int = 30) -> dict[str, Any]:
    snaps = list_snapshots(limit=limit)
    points = [
        {
            "snapshotId": snap.get("id"),
            "scanId": snap.get("scanId"),
            "createdAt": snap.get("capturedAt"),
            "readinessScore": snap.get("readinessScore"),
            "readinessBand": snap.get("readinessBand"),
        }
        for snap in snaps
    ]
    return {"status": "success", "points": points}


def set_chaos_enabled(enabled: bool) -> None:
    global _CHAOS_ENABLED
    _CHAOS_ENABLED = enabled
    publish_event("chaos", {"enabled": enabled})


def chaos_enabled() -> bool:
    return _CHAOS_ENABLED


def maybe_run_cadence_tick() -> bool:
    global _LAST_CADENCE_AT
    now = time.time()
    if now - _LAST_CADENCE_AT < DEMO_CADENCE_SEC:
        return False
    _LAST_CADENCE_AT = now
    reassess_demo(reason="cadence")
    if _CHAOS_ENABLED:
        _maybe_chaos_inject()
    return True


def _maybe_chaos_inject() -> None:
    import random

    from app.demo.adversary import inject_event

    events = ["cert-expiry", "algorithm-downgrade", "hndl-harvest", "key-reuse"]
    try:
        inject_event(event_type=random.choice(events))
    except Exception:
        return
