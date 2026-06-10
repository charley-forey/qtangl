from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import AuthContext, require_auth_readonly
from app.monitoring.drift_snapshots import get_latest_snapshots, list_snapshots_for_tenant
from app.monitoring.unified_diff import UnifiedDiffService
from app.tenant.settings import drift_unified_enabled

router = APIRouter(tags=["tenant"])


@router.get("/tenant/drift/summary")
def drift_summary(
    since_days: int = Query(default=7, ge=1, le=365),
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    if not drift_unified_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="drift_unified_disabled")
    summary = UnifiedDiffService.summarize_tenant(tenant_id=auth.tenant_id, since_days=since_days)
    return {"status": "success", **summary}


@router.get("/tenant/drift/{source_type}/{scope_key}")
def drift_scope_detail(
    source_type: str,
    scope_key: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    if not drift_unified_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="drift_unified_disabled")
    delta = UnifiedDiffService.compute_delta(
        tenant_id=auth.tenant_id,
        source_type=source_type,
        scope_key=scope_key,
    )
    return {"status": "success", "delta": delta}


@router.get("/tenant/drift/history")
def drift_history(
    source_type: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    if not drift_unified_enabled(tenant_id=auth.tenant_id):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="drift_unified_disabled")
    snaps = list_snapshots_for_tenant(
        tenant_id=auth.tenant_id,
        source_type=source_type,
        limit=limit,
    )
    return {"status": "success", "snapshots": snaps}
