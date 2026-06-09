from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.auth import AuthContext, require_auth_readonly, require_auth_write
from app.audit.service import log_action
from app.discovery.constants import DISCOVERY_SCHEMA_HEADER, FINDINGS_RATE_LIMIT_PER_MIN
from app.discovery.fleet import (
    create_fleet,
    enroll_agent,
    ingest_findings,
    list_agents,
    list_fleets,
    record_heartbeat,
    revoke_agents,
    rotate_fleet_token,
)
from app.discovery.inventory import discovery_inventory_summary
from app.discovery.agent_update import check_for_update
from app.discovery.constants import SCAN_ENQUEUE_RATE_LIMIT_PER_HOUR
from app.discovery.github_app import handle_github_webhook, summarize_pr_findings
from app.discovery.host_drift import current_finding_ids_for_tenant, diff_host_findings
from app.discovery.jobs import create_discovery_job, get_discovery_job
from app.discovery.schema import negotiate_schema
from app.discovery.targets import create_code_target, create_image_target, list_code_targets, list_image_targets
from app.queue.redis_queue import rate_limit_check
from app.tenant.settings import discovery_feature_enabled

router = APIRouter(tags=["discovery"])


def _require_host_sensor(auth: AuthContext) -> None:
    if not discovery_feature_enabled(tenant_id=auth.tenant_id, feature="hostSensor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="discovery.host_sensor feature not enabled for tenant",
        )


def _require_code_scan(auth: AuthContext) -> None:
    if not discovery_feature_enabled(tenant_id=auth.tenant_id, feature="codeScan"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="discovery.code_scan feature not enabled for tenant",
        )


@router.post("/tenant/discovery/fleets")
def create_discovery_fleet(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_host_sensor(auth)
    name = str(body.get("name") or "Default fleet")
    result = create_fleet(tenant_id=auth.tenant_id, name=name, policy=body.get("policy"))
    log_action(tenant_id=auth.tenant_id, action="discovery.fleet_created", detail={"fleetId": result["fleetId"]})
    return {"status": "success", **result}


@router.get("/tenant/discovery/fleets")
def get_discovery_fleets(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {"status": "success", "fleets": list_fleets(tenant_id=auth.tenant_id)}


@router.get("/tenant/discovery/agents")
def get_discovery_agents(
    fleetId: str | None = None,
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict:
    return {"status": "success", "agents": list_agents(tenant_id=auth.tenant_id, fleet_id=fleetId)}


@router.get("/tenant/discovery/summary")
def get_discovery_summary(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {"status": "success", "counts": discovery_inventory_summary(tenant_id=auth.tenant_id)}


@router.post("/tenant/discovery/fleets/{fleet_id}/rotate-token")
def rotate_token(fleet_id: str, auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_host_sensor(auth)
    result = rotate_fleet_token(tenant_id=auth.tenant_id, fleet_id=fleet_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fleet not found")
    log_action(tenant_id=auth.tenant_id, action="discovery.token_rotated", detail={"fleetId": fleet_id})
    return {"status": "success", **result}


@router.post("/tenant/discovery/agents/revoke")
def revoke_discovery_agents(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_host_sensor(auth)
    agent_ids = body.get("agentIds") or []
    if not isinstance(agent_ids, list):
        raise HTTPException(status_code=422, detail="agentIds must be array")
    count = revoke_agents(tenant_id=auth.tenant_id, agent_ids=[str(x) for x in agent_ids])
    return {"status": "success", "revoked": count}


def _rate_limit_scan_enqueue(tenant_id: str) -> None:
    if not rate_limit_check(f"disc-scan:{tenant_id}", limit=SCAN_ENQUEUE_RATE_LIMIT_PER_HOUR, window_seconds=3600):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Scan enqueue rate limit exceeded")


@router.post("/tenant/discovery/host-scan")
def trigger_host_scan(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_host_sensor(auth)
    _rate_limit_scan_enqueue(auth.tenant_id)
    job_id = create_discovery_job(
        tenant_id=auth.tenant_id,
        job_type="host_fleet_scan",
        payload={"fleetId": body.get("fleetId")},
        target_id=body.get("fleetId"),
    )
    return {"status": "success", "jobId": job_id}


@router.post("/discovery/agent/enroll")
def agent_enroll(body: dict[str, Any]) -> dict:
    token = str(body.get("enrollmentToken") or "")
    hostname = str(body.get("hostname") or "unknown")
    os_name = str(body.get("os") or "linux")
    sensor_version = str(body.get("sensorVersion") or "0.1.0")
    result = enroll_agent(
        enrollment_token=token,
        hostname=hostname,
        os_name=os_name,
        sensor_version=sensor_version,
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired enrollment token")
    return {"status": "success", **result}


@router.post("/discovery/agent/heartbeat")
def agent_heartbeat(body: dict[str, Any]) -> dict:
    agent_id = str(body.get("agentId") or "")
    tenant_id = str(body.get("tenantId") or "")
    if not record_heartbeat(
        agent_id=agent_id,
        tenant_id=tenant_id,
        sensor_version=body.get("sensorVersion"),
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return {"status": "success"}


@router.post("/discovery/agent/findings")
def agent_findings(
    body: dict[str, Any],
    x_qtangl_discovery_schema: str | None = Header(default=None, alias=DISCOVERY_SCHEMA_HEADER),
) -> dict:
    try:
        negotiate_schema(x_qtangl_discovery_schema)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    agent_id = str(body.get("agentId") or "")
    tenant_id = str(body.get("tenantId") or "")
    findings = body.get("findings") or []
    if not isinstance(findings, list):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="findings must be array")
    rate_key = f"findings:{tenant_id}:{agent_id}"
    if not rate_limit_check(rate_key, limit=FINDINGS_RATE_LIMIT_PER_MIN):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
    from app.observability.metrics import increment

    increment("discovery_findings_ingested", value=len(findings))
    result = ingest_findings(agent_id=agent_id, tenant_id=tenant_id, findings=findings)
    if result.get("error"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["error"])
    if result.get("accepted", 0) == 0 and result.get("rejected", 0) > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All findings rejected")
    try:
        from app.cbom.service import ingest_scan_assets
        from app.discovery.fleet import list_agents as _agents
        from app.discovery.host_normalize import findings_to_assets

        agents = _agents(tenant_id=tenant_id)
        hostname = next((a["hostname"] for a in agents if a["agentId"] == agent_id), agent_id)
        assets = findings_to_assets(findings, agent_hostname=hostname)
        ingest_scan_assets(tenant_id=tenant_id, assets=assets, source_method="qtangl:host-sensor")
    except Exception:
        pass
    return {"status": "success", **result}


@router.post("/tenant/coverage/code-scan")
def tenant_code_scan_async(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    _require_code_scan(auth)
    if body.get("async", True):
        job_id = create_discovery_job(
            tenant_id=auth.tenant_id,
            job_type="code_scan",
            payload=body,
        )
        return {"status": "success", "jobId": job_id, "async": True}
    from app.discovery.code_orchestrator import run_code_scan

    result = run_code_scan(
        owner=body.get("githubOwner"),
        repo=body.get("githubRepo"),
        token=body.get("githubToken"),
        ref=str(body.get("ref", "HEAD")),
        content=body.get("content"),
        path=str(body.get("path", "snippet")),
    )
    return {"status": "success", **result}


@router.get("/tenant/discovery/jobs/{job_id}")
def get_job_status(job_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    job = get_discovery_job(job_id=job_id, tenant_id=auth.tenant_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return {"status": "success", **job}


@router.get("/tenant/discovery/host-drift")
def get_host_drift(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    current = current_finding_ids_for_tenant(tenant_id=auth.tenant_id)
    baseline = set(str(x) for x in (auth.tenant_id,))  # placeholder; clients pass baseline via POST
    diff = diff_host_findings(tenant_id=auth.tenant_id, previous_finding_ids=set(), current_finding_ids=current)
    return {"status": "success", "currentCount": len(current), **diff}


@router.get("/discovery/agent/update")
def agent_update_check(version: str = "0.1.0", ring: str = "stable") -> dict:
    return {"status": "success", **check_for_update(current_version=version, ring=ring)}


@router.get("/tenant/discovery/code-targets")
def get_code_targets(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {"status": "success", "targets": list_code_targets(tenant_id=auth.tenant_id)}


@router.post("/tenant/discovery/code-targets")
def post_code_target(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_code_scan(auth)
    target = create_code_target(
        tenant_id=auth.tenant_id,
        owner=str(body.get("owner", "")),
        repo=str(body.get("repo", "")),
        provider=str(body.get("provider", "github")),
    )
    return {"status": "success", "target": target}


@router.get("/tenant/discovery/image-targets")
def get_image_targets(auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    return {"status": "success", "targets": list_image_targets(tenant_id=auth.tenant_id)}


@router.post("/tenant/discovery/image-targets")
def post_image_target(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    if not discovery_feature_enabled(tenant_id=auth.tenant_id, feature="binaryScan"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="discovery.binary_scan not enabled")
    target = create_image_target(
        tenant_id=auth.tenant_id,
        image_ref=str(body.get("imageRef", "")),
        registry=str(body.get("registry", "ecr")),
    )
    return {"status": "success", "target": target}


@router.post("/tenant/discovery/github-webhook")
def github_webhook(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_code_scan(auth)
    event = str(body.get("event") or body.get("action") or "push")
    return handle_github_webhook(tenant_id=auth.tenant_id, event=event, payload=body.get("payload") or body)


@router.post("/tenant/discovery/pr-comment")
def pr_comment(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    comment = summarize_pr_findings(
        base_count=int(body.get("baseCount", 0)),
        head_count=int(body.get("headCount", 0)),
    )
    return {"status": "success", "comment": comment}


@router.post("/tenant/discovery/gitlab-webhook")
def gitlab_webhook(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_code_scan(auth)
    project = body.get("project") or {}
    path = str(project.get("path_with_namespace") or "")
    parts = path.split("/", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=422, detail="invalid project path")
    job_id = create_discovery_job(
        tenant_id=auth.tenant_id,
        job_type="code_scan",
        payload={"githubOwner": parts[0], "githubRepo": parts[1], "provider": "gitlab"},
    )
    return {"status": "success", "jobId": job_id}


@router.post("/tenant/discovery/ado-webhook")
def ado_webhook(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_code_scan(auth)
    repo = body.get("resource") or {}
    name = str(repo.get("repository", {}).get("name") or body.get("repo", ""))
    project = str(body.get("project", "org"))
    job_id = create_discovery_job(
        tenant_id=auth.tenant_id,
        job_type="code_scan",
        payload={"githubOwner": project, "githubRepo": name, "provider": "ado"},
    )
    return {"status": "success", "jobId": job_id}


@router.post("/tenant/discovery/binary-scan")
def trigger_binary_scan(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    if not discovery_feature_enabled(tenant_id=auth.tenant_id, feature="binaryScan"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="discovery.binary_scan not enabled")
    _rate_limit_scan_enqueue(auth.tenant_id)
    job_id = create_discovery_job(
        tenant_id=auth.tenant_id,
        job_type="binary_scan",
        payload=body,
        target_id=body.get("imageRef"),
    )
    return {"status": "success", "jobId": job_id}


@router.post("/tenant/discovery/offline-upload")
def offline_sensor_upload(body: dict[str, Any], auth: AuthContext = Depends(require_auth_write)) -> dict:
    _require_host_sensor(auth)
    findings = body.get("findings") or []
    agent_id = str(body.get("agentId") or f"offline-{auth.tenant_id}")
    result = ingest_findings(agent_id=agent_id, tenant_id=auth.tenant_id, findings=findings)
    return {"status": "success", **result}


@router.post("/tenant/discovery/source-runtime-diff")
def source_runtime_diff(body: dict[str, Any], auth: AuthContext = Depends(require_auth_readonly)) -> dict:
    from app.discovery.source_runtime_diff import compute_source_runtime_diff

    source = body.get("sourceFindings") or body.get("source") or []
    runtime = body.get("runtimeFindings") or body.get("runtime") or []
    if not isinstance(source, list) or not isinstance(runtime, list):
        raise HTTPException(status_code=422, detail="sourceFindings and runtimeFindings must be arrays")
    diff = compute_source_runtime_diff(source_findings=source, runtime_findings=runtime)
    return {"status": "success", **diff}
