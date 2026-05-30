from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse, Response

from app.auth import AuthContext, require_auth, require_auth_readonly
from app.db.config import persistence_enabled
from app.pqc.report import report_to_json, report_to_pdf
from app.pqc.serialize import serialize_bundle
from app.store.scan_jobs import get_job, list_jobs_for_tenant, load_scan_bundle

router = APIRouter(prefix="/tenant", tags=["tenant"])


@router.get("/me")
def tenant_me(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "persistenceEnabled": persistence_enabled(),
    }


@router.get("/scans")
def tenant_scans(
    auth: AuthContext = Depends(require_auth_readonly),
    limit: int = Query(default=25, ge=1, le=100),
) -> dict:
    scans = list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=limit)
    return {
        "status": "success",
        "tenantId": auth.tenant_id,
        "count": len(scans),
        "scans": scans,
    }


@router.get("/scans/{scan_id}")
def tenant_scan_detail(scan_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    job = get_job(scan_id, tenant_id=auth.tenant_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found.")
    payload = {
        "status": "success",
        "scanId": job.scan_id,
        "jobStatus": job.status,
        "error": job.error,
        "timeline": [
            {
                "key": event.key,
                "label": event.label,
                "durationMs": event.duration_ms,
                "status": event.status,
            }
            for event in job.timeline
        ],
    }
    if job.bundle:
        payload.update(serialize_bundle(job.bundle))
    return payload


@router.get("/scans/{scan_id}/report")
def tenant_scan_report(
    scan_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
    format: str = Query(default="pdf", pattern="^(pdf|json)$"),
) -> Response:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan report not found.")

    from app.pqc.bundle_codec import bundle_from_api_dict

    bundle = bundle_from_api_dict(bundle_dict)
    if format == "json":
        return JSONResponse(content=report_to_json(bundle.report))
    content = report_to_pdf(bundle.report)
    return Response(content=content, media_type="application/pdf")
