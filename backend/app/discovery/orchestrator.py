from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Callable

from app.discovery.binary_orchestrator import run_binary_scan
from app.discovery.code_orchestrator import run_code_scan
from app.discovery.constants import SOURCE_METHODS
from app.discovery.fleet import ingest_findings, list_agents
from app.discovery.jobs import append_timeline, complete_discovery_job, fail_discovery_job
from app.pqc.models import TimelineEvent

ProgressCallback = Callable[[TimelineEvent], None]


class DiscoveryError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


def _emit(on_progress: ProgressCallback | None, phase: str, detail: str) -> None:
    if on_progress:
        on_progress(
            TimelineEvent(
                at=datetime.now(timezone.utc).isoformat(),
                phase=phase,
                detail=detail,
            )
        )


def run_discovery_job(
    *,
    job_id: str,
    tenant_id: str,
    job_type: str,
    payload: dict[str, Any],
    on_progress: ProgressCallback | None = None,
) -> dict[str, Any]:
    _emit(on_progress, "start", f"Discovery job {job_type} started")
    try:
        if job_type == "host_fleet_scan":
            result = _run_host_fleet_scan(tenant_id=tenant_id, payload=payload, on_progress=on_progress)
        elif job_type in ("code_scan", "repo_scheduled_scan"):
            result = _run_code_scan_job(tenant_id=tenant_id, payload=payload, on_progress=on_progress)
        elif job_type == "binary_scan":
            result = _run_binary_scan_job(tenant_id=tenant_id, payload=payload, on_progress=on_progress)
        else:
            raise DiscoveryError("unknown_job_type", f"Unknown job type: {job_type}")
        _emit(on_progress, "complete", "Discovery job completed")
        complete_discovery_job(job_id=job_id, tenant_id=tenant_id, result=result)
        append_timeline(
            job_id=job_id,
            tenant_id=tenant_id,
            event={"phase": "complete", "detail": result.get("status", "ok")},
        )
        return result
    except DiscoveryError as exc:
        fail_discovery_job(job_id=job_id, tenant_id=tenant_id, error=exc.message)
        raise
    except Exception as exc:
        fail_discovery_job(job_id=job_id, tenant_id=tenant_id, error=str(exc))
        raise


def _run_host_fleet_scan(
    *,
    tenant_id: str,
    payload: dict[str, Any],
    on_progress: ProgressCallback | None,
) -> dict[str, Any]:
    fleet_id = payload.get("fleetId")
    agents = list_agents(tenant_id=tenant_id, fleet_id=fleet_id)
    online = [a for a in agents if a.get("status") == "online"]
    stale = [a for a in agents if a.get("status") not in {"online", "revoked"}]
    _emit(on_progress, "host", f"Fleet has {len(agents)} agent(s), {len(online)} online")
    total_findings = sum(int(a.get("findingsCount") or 0) for a in agents)
    return {
        "status": "ok",
        "agentCount": len(agents),
        "onlineCount": len(online),
        "staleCount": len(stale),
        "findingsCount": total_findings,
        "dispatch": "agents_push_on_schedule",
        "sourceMethod": SOURCE_METHODS["host_sensor"],
    }


def _run_code_scan_job(
    *,
    tenant_id: str,
    payload: dict[str, Any],
    on_progress: ProgressCallback | None,
) -> dict[str, Any]:
    _emit(on_progress, "code", "Running code scan orchestrator")
    result = run_code_scan(
        owner=payload.get("githubOwner") or payload.get("owner"),
        repo=payload.get("githubRepo") or payload.get("repo"),
        token=payload.get("githubToken") or payload.get("token"),
        ref=str(payload.get("ref", "HEAD")),
        content=payload.get("content"),
        path=str(payload.get("path", "snippet")),
    )
    if result.get("status") == "error":
        raise DiscoveryError("code_scan_failed", str(result.get("message")))
    _merge_assets_to_cbom(tenant_id=tenant_id, assets=result.get("assets") or [], source_method=SOURCE_METHODS["code_scan"])
    return {k: v for k, v in result.items() if k != "assets"}


def _run_binary_scan_job(
    *,
    tenant_id: str,
    payload: dict[str, Any],
    on_progress: ProgressCallback | None,
) -> dict[str, Any]:
    image_ref = str(payload.get("imageRef") or payload.get("image"))
    if not image_ref:
        raise DiscoveryError("missing_image", "imageRef required")
    _emit(on_progress, "binary", f"Scanning image {image_ref}")
    result = run_binary_scan(image_ref=image_ref, base_cbom=payload.get("baseCbom"))
    _merge_assets_to_cbom(tenant_id=tenant_id, assets=result.get("assets") or [], source_method=SOURCE_METHODS["binary_scan"])
    return {k: v for k, v in result.items() if k != "assets"}


def _merge_assets_to_cbom(*, tenant_id: str, assets: list[Any], source_method: str) -> None:
    if not assets:
        return
    try:
        from app.cbom.service import ingest_scan_assets

        ingest_scan_assets(tenant_id=tenant_id, assets=assets, source_method=source_method)
    except ImportError:
        pass
    except Exception:
        pass


def ingest_host_findings_batch(
    *,
    agent_id: str,
    tenant_id: str,
    findings: list[dict[str, Any]],
) -> dict[str, Any]:
    return ingest_findings(agent_id=agent_id, tenant_id=tenant_id, findings=findings)
