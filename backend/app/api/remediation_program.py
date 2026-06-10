from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.auth import AuthContext, require_auth_readonly, require_auth_write
from app.partner.service import list_child_tenants
from app.remediation.playbooks import playbook_for_item
from app.remediation.program import (
    get_program_item,
    list_program_items,
    migrate_legacy_remediation_status,
    program_velocity,
    update_program_item,
    upsert_program_item,
)
from app.remediation.service import recommend_remediation_plan, simulate_post_migration_readiness
from app.remediation.verify import verify_program_item
from app.tenant.settings import remediation_program_enabled

router = APIRouter(prefix="/tenant/remediation", tags=["tenant"])


def _assert_partner_scope(auth: AuthContext, tenant_id: str) -> None:
    children = {c["childTenantId"] for c in list_child_tenants(parent_tenant_id=auth.tenant_id)}
    if children and tenant_id not in children and tenant_id != auth.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="partner_scope_denied")


class ProgramCreateRequest(BaseModel):
    sourceType: str = "manual"
    sourceRef: str
    title: str = ""
    status: str = "open"
    notes: str | None = None


class ProgramUpdateRequest(BaseModel):
    status: str | None = None
    owner: str | None = None
    notes: str | None = None
    targetDate: str | None = None


class ProgramVerifyRequest(BaseModel):
    verifyScanId: str | None = None


class ProgramSimulateRequest(BaseModel):
    programItemIds: list[str] = Field(default_factory=list)


@router.get("/program")
def program_list(
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    if not remediation_program_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=503, detail="remediation_program_disabled")
    items, total = list_program_items(
        tenant_id=auth.tenant_id, status=status_filter, limit=limit, offset=offset
    )
    return {"status": "success", "items": items, "total": total}


@router.post("/program")
def program_create(body: ProgramCreateRequest, auth: AuthContext = Depends(require_auth_write)) -> dict:
    if not remediation_program_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=503, detail="remediation_program_disabled")
    if body.status == "accepted_risk" and not body.notes:
        raise HTTPException(status_code=400, detail="accepted_risk_requires_note")
    item = upsert_program_item(
        tenant_id=auth.tenant_id,
        source_type=body.sourceType,
        source_ref=body.sourceRef,
        title=body.title or body.sourceRef,
        status=body.status,
        notes=body.notes,
        actor=auth.tenant_id,
    )
    return {"status": "success", "item": item}


@router.get("/program/velocity")
def program_velocity_endpoint(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {"status": "success", **program_velocity(tenant_id=auth.tenant_id)}


@router.post("/program/simulate")
def program_simulate(body: ProgramSimulateRequest, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    items, _ = list_program_items(tenant_id=auth.tenant_id, limit=10000)
    selected = [i for i in items if i["id"] in body.programItemIds]
    remediation_ids = [i.get("remediationId") or i.get("sourceRef") for i in selected if i.get("remediationId") or i.get("sourceRef")]
    scan_id = next((i.get("scanId") for i in selected if i.get("scanId")), None)
    if scan_id and remediation_ids:
        from app.store.scan_jobs import load_scan_bundle
        from app.pqc.serialize import serialize_bundle

        bundle = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
        if bundle:
            report = serialize_bundle(bundle).get("report") or {}
            projection = simulate_post_migration_readiness(
                report=report,
                selected_remediation_ids=remediation_ids,
            )
            return {"status": "success", "projection": projection}
    return {"status": "success", "projection": {"selectedCount": len(selected), "projectedDelta": len(selected) * 2}}


@router.post("/program/migrate-legacy")
def program_migrate_legacy(auth: AuthContext = Depends(require_auth_write)) -> dict:
    count = migrate_legacy_remediation_status(tenant_id=auth.tenant_id)
    return {"status": "success", "migrated": count}


@router.put("/program/{item_id}")
def program_update(
    item_id: str,
    body: ProgramUpdateRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    if not remediation_program_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=503, detail="remediation_program_disabled")
    target_date = None
    if body.targetDate:
        target_date = datetime.fromisoformat(body.targetDate.replace("Z", "+00:00"))
    try:
        item = update_program_item(
            tenant_id=auth.tenant_id,
            item_id=item_id,
            status=body.status,
            owner=body.owner,
            notes=body.notes,
            target_date=target_date,
            actor=auth.tenant_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not item:
        raise HTTPException(status_code=404, detail="not_found")
    return {"status": "success", "item": item}


@router.get("/program/recommendations")
def program_recommendations(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    items, _ = list_program_items(tenant_id=auth.tenant_id, limit=50)
    plans = []
    for item in items[:20]:
        if item.get("scanId") and item.get("remediationId"):
            from app.store.scan_jobs import load_scan_bundle
            from app.pqc.serialize import serialize_bundle

            bundle = load_scan_bundle(item["scanId"], tenant_id=auth.tenant_id)
            if bundle:
                backlog = bundle.report.remediation_backlog
                match = next((b for b in backlog if b.id == item["remediationId"]), None)
                if match:
                    item_dict = {
                        "id": match.id,
                        "title": match.title,
                        "severity": match.severity.value if hasattr(match.severity, "value") else str(match.severity),
                        "effortDays": match.effort_days,
                    }
                    plan = recommend_remediation_plan(item_dict)
                    plans.append({"programItemId": item["id"], **plan})
    return {"status": "success", "plans": plans}


@router.get("/program/{item_id}/playbook")
def program_playbook(item_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    item = get_program_item(tenant_id=auth.tenant_id, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="not_found")
    return {"status": "success", "playbook": playbook_for_item(item)}


@router.post("/program/{item_id}/verify")
def program_verify(
    item_id: str,
    body: ProgramVerifyRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict:
    result = verify_program_item(
        tenant_id=auth.tenant_id,
        item_id=item_id,
        verify_scan_id=body.verifyScanId,
    )
    return {"status": "success", **result}
