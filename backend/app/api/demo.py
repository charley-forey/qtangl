from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.auth import require_api_key
from app.demo.adversary import inject_event
from app.demo.campaign import (
    get_campaign_state,
    pause_campaign,
    play_campaign,
    save_campaign_definition,
    scrub_campaign,
)
from app.demo.compliance import build_compliance_scorecard, build_portfolio_rollup
from app.demo.config import demo_enabled
from app.demo.events import publish_event, subscribe, unsubscribe
from app.demo.graph import build_demo_graph
from app.demo.narration import build_narration
from app.demo.registry import COMPLIANCE_TARGETS, POSTURES, DemoResource
from app.demo.scenes import apply_scene, list_scenes
from app.demo.service import (
    chaos_enabled,
    ensure_seeded,
    get_status,
    get_trend,
    reassess_demo,
    set_chaos_enabled,
)
from app.demo.store import (
    delete_resource,
    get_resource,
    get_snapshot,
    list_campaigns,
    list_resources,
    load_bundle,
    upsert_resource,
)
from app.models.api import ErrorResponse
from app.pqc.signing import verify_report_signature

router = APIRouter(prefix="/demo", tags=["demo"])


def _require_demo_enabled() -> None:
    if not demo_enabled():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demo mode is disabled.")


class DemoResourceCreate(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    kind: str = Field(default="tls")
    host: str = Field(min_length=1, max_length=255)
    port: int | None = None
    businessUnit: str = Field(default="default", max_length=64)
    posture: str = Field(default="classical")
    complianceTarget: str = Field(default="general")
    enabled: bool = True


class DemoResourcePatch(BaseModel):
    label: str | None = None
    posture: str | None = None
    complianceTarget: str | None = None
    enabled: bool | None = None
    activeEvents: list[str] | None = None


class CampaignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    steps: list[dict[str, Any]] = Field(default_factory=list)


class InjectRequest(BaseModel):
    eventType: str
    resourceId: str | None = None


class ChaosRequest(BaseModel):
    enabled: bool


@router.get("/status")
def demo_status() -> dict[str, Any]:
    _require_demo_enabled()
    return get_status()


@router.get("/trend")
def demo_trend(limit: int = 30) -> dict[str, Any]:
    _require_demo_enabled()
    return get_trend(limit=min(limit, 100))


@router.get("/resources")
def demo_list_resources(_token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    ensure_seeded()
    return {"status": "success", "resources": [r.to_dict() for r in list_resources()]}


@router.post("/resources", responses={401: {"model": ErrorResponse}})
def demo_create_resource(body: DemoResourceCreate, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    import uuid

    if body.posture not in POSTURES:
        raise HTTPException(status_code=400, detail="Invalid posture.")
    if body.complianceTarget not in COMPLIANCE_TARGETS:
        raise HTTPException(status_code=400, detail="Invalid compliance target.")
    resource = DemoResource(
        id=f"demo-{uuid.uuid4().hex[:10]}",
        label=body.label,
        kind=body.kind,  # type: ignore[arg-type]
        host=body.host,
        port=body.port,
        business_unit=body.businessUnit,
        posture=body.posture,  # type: ignore[arg-type]
        compliance_target=body.complianceTarget,  # type: ignore[arg-type]
        enabled=body.enabled,
    )
    upsert_resource(resource)
    snapshot = reassess_demo(reason="resource_create")
    return {"status": "success", "resource": resource.to_dict(), "snapshot": snapshot}


@router.patch("/resources/{resource_id}", responses={401: {"model": ErrorResponse}})
def demo_patch_resource(
    resource_id: str,
    body: DemoResourcePatch,
    _token: str = Depends(require_api_key),
) -> dict[str, Any]:
    _require_demo_enabled()
    resource = get_resource(resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found.")
    if body.label is not None:
        resource.label = body.label
    if body.posture is not None:
        if body.posture not in POSTURES:
            raise HTTPException(status_code=400, detail="Invalid posture.")
        resource.posture = body.posture  # type: ignore[assignment]
    if body.complianceTarget is not None:
        if body.complianceTarget not in COMPLIANCE_TARGETS:
            raise HTTPException(status_code=400, detail="Invalid compliance target.")
        resource.compliance_target = body.complianceTarget  # type: ignore[assignment]
    if body.enabled is not None:
        resource.enabled = body.enabled
    if body.activeEvents is not None:
        resource.active_events = body.activeEvents
    upsert_resource(resource)
    snapshot = reassess_demo(reason="resource_patch")
    return {"status": "success", "resource": resource.to_dict(), "snapshot": snapshot}


@router.delete("/resources/{resource_id}", responses={401: {"model": ErrorResponse}})
def demo_delete_resource(resource_id: str, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    if not delete_resource(resource_id):
        raise HTTPException(status_code=404, detail="Resource not found.")
    snapshot = reassess_demo(reason="resource_delete")
    return {"status": "success", "snapshot": snapshot}


@router.post("/reassess", responses={401: {"model": ErrorResponse}})
def demo_reassess(_token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    snapshot = reassess_demo(reason="manual")
    return {"status": "success", "snapshot": snapshot}


@router.post("/scene/{scene_id}", responses={401: {"model": ErrorResponse}})
def demo_apply_scene(scene_id: str, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    try:
        scene = apply_scene(scene_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    snapshot = reassess_demo(scene_id=scene_id, reason="scene")
    publish_event("scene", {"sceneId": scene_id, "title": scene.get("title")})
    return {"status": "success", "scene": scene, "snapshot": snapshot}


@router.get("/scenes")
def demo_scenes() -> dict[str, Any]:
    _require_demo_enabled()
    return {"status": "success", "scenes": list_scenes()}


@router.post("/inject", responses={401: {"model": ErrorResponse}})
def demo_inject(body: InjectRequest, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    try:
        result = inject_event(event_type=body.eventType, resource_id=body.resourceId)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    snapshot = reassess_demo(reason=f"inject:{body.eventType}")
    return {"status": "success", "injection": result, "snapshot": snapshot}


@router.post("/chaos", responses={401: {"model": ErrorResponse}})
def demo_chaos(body: ChaosRequest, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    set_chaos_enabled(body.enabled)
    return {"status": "success", "chaosEnabled": chaos_enabled()}


@router.get("/campaigns")
def demo_campaigns(_token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    return {"status": "success", "campaigns": list_campaigns()}


@router.post("/campaign", responses={401: {"model": ErrorResponse}})
def demo_save_campaign(body: CampaignCreate, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    campaign = save_campaign_definition(name=body.name, steps=body.steps)
    return {"status": "success", "campaign": campaign}


@router.post("/campaign/{campaign_id}/play", responses={401: {"model": ErrorResponse}})
def demo_play_campaign(campaign_id: str, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    try:
        campaign = play_campaign(campaign_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "success", "campaign": campaign}


@router.post("/campaign/{campaign_id}/pause", responses={401: {"model": ErrorResponse}})
def demo_pause_campaign(campaign_id: str, _token: str = Depends(require_api_key)) -> dict[str, Any]:
    _require_demo_enabled()
    try:
        campaign = pause_campaign(campaign_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "success", "campaign": campaign}


@router.get("/campaign/{campaign_id}/state")
def demo_campaign_state(campaign_id: str) -> dict[str, Any]:
    _require_demo_enabled()
    try:
        campaign = get_campaign_state(campaign_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "success", "campaign": campaign}


@router.post("/campaign/{campaign_id}/scrub", responses={401: {"model": ErrorResponse}})
def demo_scrub_campaign(
    campaign_id: str,
    stepIndex: int = 0,
    _token: str = Depends(require_api_key),
) -> dict[str, Any]:
    _require_demo_enabled()
    try:
        result = scrub_campaign(campaign_id, step_index=stepIndex)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "success", **result}


@router.get("/compliance")
def demo_compliance(scanId: str | None = None) -> dict[str, Any]:
    _require_demo_enabled()
    return {"status": "success", **build_compliance_scorecard(scan_id=scanId)}


@router.get("/portfolio")
def demo_portfolio(limit: int = 30) -> dict[str, Any]:
    _require_demo_enabled()
    return {"status": "success", **build_portfolio_rollup(limit=min(limit, 100))}


@router.get("/graph")
def demo_graph(scanId: str | None = None) -> dict[str, Any]:
    _require_demo_enabled()
    return {"status": "success", **build_demo_graph(scan_id=scanId)}


@router.get("/narration")
def demo_narration() -> dict[str, Any]:
    _require_demo_enabled()
    text = build_narration()
    return {"status": "success", "narration": text}


@router.get("/verify/{snapshot_id}")
def demo_verify(snapshot_id: str) -> dict[str, Any]:
    _require_demo_enabled()
    snap = get_snapshot(snapshot_id)
    if snap is None:
        raise HTTPException(status_code=404, detail="Snapshot not found.")
    bundle = snap.get("bundle") or load_bundle(str(snap.get("scanId") or ""))
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found.")
    report = bundle.get("report") or {}
    signature = report.get("signature") or snap.get("signature") or {}
    verify_payload = {k: v for k, v in report.items() if k != "signature"}
    result = verify_report_signature(verify_payload, signature)
    return {
        "status": "success",
        "snapshotId": snapshot_id,
        "scanId": snap.get("scanId"),
        "valid": result.get("valid"),
        "contentHash": result.get("contentHash"),
        "verifySpecVersion": result.get("verifySpecVersion"),
        "simulation": True,
    }


async def _demo_events_generator():
    queue = await subscribe()
    try:
        yield "event: heartbeat\ndata: {}\n\n"
        while True:
            try:
                message = await asyncio.wait_for(queue.get(), timeout=15.0)
                yield message
            except asyncio.TimeoutError:
                yield "event: heartbeat\ndata: {}\n\n"
    finally:
        unsubscribe(queue)


@router.get("/events")
async def demo_events() -> StreamingResponse:
    _require_demo_enabled()
    return StreamingResponse(
        _demo_events_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
