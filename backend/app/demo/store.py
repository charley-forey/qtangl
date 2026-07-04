from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.demo.config import demo_tenant_id
from app.demo.registry import DemoResource

_MEM_RESOURCES: dict[str, DemoResource] = {}
_MEM_SNAPSHOTS: list[dict[str, Any]] = []
_MEM_CAMPAIGNS: dict[str, dict[str, Any]] = {}
_MEM_BUNDLES: dict[str, dict[str, Any]] = {}
_SEEDED = False


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def _tenant() -> str:
    return demo_tenant_id()


def _resource_row(resource: DemoResource) -> dict[str, Any]:
    return {
        "id": resource.id,
        "tenant_id": _tenant(),
        "label": resource.label,
        "kind": resource.kind,
        "host": resource.host,
        "port": resource.port,
        "business_unit": resource.business_unit,
        "posture": resource.posture,
        "compliance_target": resource.compliance_target,
        "enabled": resource.enabled,
        "active_events_json": json.dumps(resource.active_events),
    }


def _row_to_resource(row: Any) -> DemoResource:
    if isinstance(row, DemoResource):
        return row
    if isinstance(row, dict):
        return DemoResource.from_dict(row)
    events = json.loads(getattr(row, "active_events_json", None) or "[]")
    return DemoResource(
        id=row.id,
        label=row.label,
        kind=row.kind,
        host=row.host,
        port=row.port,
        business_unit=row.business_unit,
        posture=row.posture,
        compliance_target=row.compliance_target,
        enabled=bool(row.enabled),
        active_events=events,
    )


def list_resources(*, enabled_only: bool = False) -> list[DemoResource]:
    if not persistence_enabled():
        items = list(_MEM_RESOURCES.values())
    else:
        from app.db.models import DemoResourceRow

        with db_session() as session:
            query = session.query(DemoResourceRow).filter(DemoResourceRow.tenant_id == _tenant())
            if enabled_only:
                query = query.filter(DemoResourceRow.enabled.is_(True))
            items = [_row_to_resource(row) for row in query.order_by(DemoResourceRow.label.asc()).all()]
    if enabled_only:
        return [r for r in items if r.enabled]
    return sorted(items, key=lambda r: r.label.lower())


def get_resource(resource_id: str) -> DemoResource | None:
    if not persistence_enabled():
        return _MEM_RESOURCES.get(resource_id)
    from app.db.models import DemoResourceRow

    with db_session() as session:
        row = session.get(DemoResourceRow, resource_id)
        if row is None or row.tenant_id != _tenant():
            return None
        return _row_to_resource(row)


def upsert_resource(resource: DemoResource) -> DemoResource:
    if not persistence_enabled():
        _MEM_RESOURCES[resource.id] = resource
        return resource
    from app.db.models import DemoResourceRow

    payload = _resource_row(resource)
    with db_session() as session:
        row = session.get(DemoResourceRow, resource.id)
        if row is None:
            row = DemoResourceRow(**payload)
            session.add(row)
        else:
            for key, value in payload.items():
                setattr(row, key, value)
        session.flush()
        return _row_to_resource(row)


def delete_resource(resource_id: str) -> bool:
    if not persistence_enabled():
        return _MEM_RESOURCES.pop(resource_id, None) is not None
    from app.db.models import DemoResourceRow

    with db_session() as session:
        row = session.get(DemoResourceRow, resource_id)
        if row is None or row.tenant_id != _tenant():
            return False
        session.delete(row)
        return True


def replace_all_resources(resources: list[DemoResource]) -> None:
    if not persistence_enabled():
        _MEM_RESOURCES.clear()
        for resource in resources:
            _MEM_RESOURCES[resource.id] = resource
        return
    from app.db.models import DemoResourceRow

    with db_session() as session:
        session.query(DemoResourceRow).filter(DemoResourceRow.tenant_id == _tenant()).delete()
        for resource in resources:
            session.add(DemoResourceRow(**_resource_row(resource)))


def is_seeded() -> bool:
    global _SEEDED
    if _SEEDED:
        return True
    if not persistence_enabled():
        return bool(_MEM_RESOURCES)
    from app.db.models import DemoResourceRow

    with db_session() as session:
        return session.query(DemoResourceRow).filter(DemoResourceRow.tenant_id == _tenant()).count() > 0


def mark_seeded() -> None:
    global _SEEDED
    _SEEDED = True


def save_snapshot(payload: dict[str, Any]) -> dict[str, Any]:
    snapshot_id = payload.get("id") or f"ds_{uuid.uuid4().hex[:16]}"
    payload = {**payload, "id": snapshot_id}
    scan_id = payload.get("scanId")
    if scan_id and payload.get("bundle"):
        _MEM_BUNDLES[str(scan_id)] = payload["bundle"]

    if not persistence_enabled():
        _MEM_SNAPSHOTS.append(payload)
        if len(_MEM_SNAPSHOTS) > 500:
            del _MEM_SNAPSHOTS[:-500]
        return payload

    from app.db.models import DemoSnapshotRow

    with db_session() as session:
        row = DemoSnapshotRow(
            id=snapshot_id,
            tenant_id=_tenant(),
            scan_id=str(payload.get("scanId") or ""),
            captured_at=_utcnow(),
            readiness_score=float(payload.get("readinessScore") or 0),
            readiness_band=str(payload.get("readinessBand") or ""),
            severity_counts_json=json.dumps(payload.get("severityCounts") or {}),
            hndl_exposed=int(payload.get("hndlExposed") or 0),
            per_resource_json=json.dumps(payload.get("perResourceStatus") or []),
            alerts_json=json.dumps(payload.get("alerts") or []),
            signature_json=json.dumps(payload.get("signature") or {}),
            bundle_json=json.dumps(payload.get("bundle") or {}),
            narration=str(payload.get("narration") or ""),
            scene_id=payload.get("sceneId"),
            campaign_id=payload.get("campaignId"),
        )
        session.add(row)
        session.flush()
        payload["capturedAt"] = _iso(row.captured_at)
        return payload


def list_snapshots(*, limit: int = 50) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return list(reversed(_MEM_SNAPSHOTS[-limit:]))
    from app.db.models import DemoSnapshotRow

    with db_session() as session:
        rows = (
            session.query(DemoSnapshotRow)
            .filter(DemoSnapshotRow.tenant_id == _tenant())
            .order_by(DemoSnapshotRow.captured_at.desc())
            .limit(limit)
            .all()
        )
        return [_snapshot_row(r) for r in reversed(rows)]


def get_snapshot(snapshot_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        for snap in reversed(_MEM_SNAPSHOTS):
            if snap.get("id") == snapshot_id:
                return snap
        return None
    from app.db.models import DemoSnapshotRow

    with db_session() as session:
        row = session.get(DemoSnapshotRow, snapshot_id)
        if row is None or row.tenant_id != _tenant():
            return None
        return _snapshot_row(row)


def latest_snapshot() -> dict[str, Any] | None:
    snaps = list_snapshots(limit=1)
    return snaps[-1] if snaps else None


def _snapshot_row(row: Any) -> dict[str, Any]:
    return {
        "id": row.id,
        "scanId": row.scan_id,
        "capturedAt": _iso(row.captured_at) if hasattr(row, "captured_at") else row.get("capturedAt"),
        "readinessScore": float(row.readiness_score if hasattr(row, "readiness_score") else row.get("readinessScore", 0)),
        "readinessBand": row.readiness_band if hasattr(row, "readiness_band") else row.get("readinessBand", ""),
        "severityCounts": json.loads(row.severity_counts_json if hasattr(row, "severity_counts_json") else json.dumps(row.get("severityCounts", {}))),
        "hndlExposed": int(row.hndl_exposed if hasattr(row, "hndl_exposed") else row.get("hndlExposed", 0)),
        "perResourceStatus": json.loads(row.per_resource_json if hasattr(row, "per_resource_json") else json.dumps(row.get("perResourceStatus", []))),
        "alerts": json.loads(row.alerts_json if hasattr(row, "alerts_json") else json.dumps(row.get("alerts", []))),
        "signature": json.loads(row.signature_json if hasattr(row, "signature_json") else json.dumps(row.get("signature", {}))),
        "narration": row.narration if hasattr(row, "narration") else row.get("narration", ""),
        "sceneId": row.scene_id if hasattr(row, "scene_id") else row.get("sceneId"),
        "campaignId": row.campaign_id if hasattr(row, "campaign_id") else row.get("campaignId"),
        "bundle": json.loads(row.bundle_json if hasattr(row, "bundle_json") else json.dumps(row.get("bundle", {}))),
    }


def load_bundle(scan_id: str) -> dict[str, Any] | None:
    bundle = _MEM_BUNDLES.get(scan_id)
    if bundle:
        return bundle
    snap = latest_snapshot()
    if snap and snap.get("scanId") == scan_id:
        return snap.get("bundle")
    if not persistence_enabled():
        return None
    from app.db.models import DemoSnapshotRow

    with db_session() as session:
        row = (
            session.query(DemoSnapshotRow)
            .filter(DemoSnapshotRow.tenant_id == _tenant(), DemoSnapshotRow.scan_id == scan_id)
            .order_by(DemoSnapshotRow.captured_at.desc())
            .first()
        )
        if row is None:
            return None
        return json.loads(row.bundle_json or "{}")


def save_campaign(campaign: dict[str, Any]) -> dict[str, Any]:
    cid = campaign.get("id") or f"camp_{uuid.uuid4().hex[:12]}"
    payload = {**campaign, "id": cid, "updatedAt": _utcnow().isoformat()}
    if not persistence_enabled():
        _MEM_CAMPAIGNS[cid] = payload
        return payload
    from app.db.models import DemoCampaignRow

    with db_session() as session:
        row = session.get(DemoCampaignRow, cid)
        steps_json = json.dumps(payload.get("steps") or [])
        state_json = json.dumps(payload.get("playbackState") or {})
        if row is None:
            row = DemoCampaignRow(
                id=cid,
                tenant_id=_tenant(),
                name=str(payload.get("name") or "Campaign"),
                steps_json=steps_json,
                playback_state_json=state_json,
            )
            session.add(row)
        else:
            row.name = str(payload.get("name") or row.name)
            row.steps_json = steps_json
            row.playback_state_json = state_json
        session.flush()
        return _campaign_row(row)


def get_campaign(campaign_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return _MEM_CAMPAIGNS.get(campaign_id)
    from app.db.models import DemoCampaignRow

    with db_session() as session:
        row = session.get(DemoCampaignRow, campaign_id)
        if row is None or row.tenant_id != _tenant():
            return None
        return _campaign_row(row)


def list_campaigns() -> list[dict[str, Any]]:
    if not persistence_enabled():
        return list(_MEM_CAMPAIGNS.values())
    from app.db.models import DemoCampaignRow

    with db_session() as session:
        rows = session.query(DemoCampaignRow).filter(DemoCampaignRow.tenant_id == _tenant()).all()
        return [_campaign_row(r) for r in rows]


def _campaign_row(row: Any) -> dict[str, Any]:
    return {
        "id": row.id,
        "name": row.name,
        "steps": json.loads(row.steps_json if hasattr(row, "steps_json") else "[]"),
        "playbackState": json.loads(row.playback_state_json if hasattr(row, "playback_state_json") else "{}"),
    }
