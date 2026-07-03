"""Command Center Next Wave tenant API endpoints."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.audit.service import log_action
from app.auth import AuthContext, require_auth_readonly, require_auth_write
from app.command_center.ai import (
    build_agentic_plan,
    build_executive_narrative,
    draft_remediation_pr,
    run_nl_query,
)
from app.command_center.cadence import recommend_cadence
from app.command_center.correlation import group_alerts
from app.command_center.graph import build_scan_graph
from app.command_center.hndl import build_hndl_exposure
from app.command_center.inbox import build_inbox
from app.command_center.schemas import (
    AgenticPlanResponse,
    AiQueryRequest,
    AiQueryResponse,
    AuditorPacketResponse,
    CadenceRecommendation,
    CorrelatedIncidentsResponse,
    ExecutiveNarrativeResponse,
    FindingCommentCreate,
    FindingCommentListResponse,
    HndlExposureResponse,
    InboxResponse,
    NotificationPreferences,
    PeerPercentileResponse,
    PortfolioRollupResponse,
    RemediationPrDraftRequest,
    RemediationPrDraftResponse,
    SavedViewCreate,
    SavedViewListResponse,
    ScanGraphResponse,
    TransparencyLogResponse,
    WarRoom,
    WarRoomCreate,
)
from app.command_center.store import (
    create_comment,
    create_war_room,
    delete_comment,
    delete_saved_view,
    list_comments,
    list_saved_views,
    list_war_rooms,
    upsert_saved_view,
)
from app.command_center.trust import build_auditor_packet, build_transparency_view
from app.pqc.bundle_codec import bundle_from_api_dict
from app.monitoring.anomaly import detect_readiness_anomalies, forecast_readiness
from app.remediation.service import simulate_post_migration_readiness
from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle
from app.store.tenant_alerts import list_alerts
from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

router = APIRouter(prefix="/tenant", tags=["tenant"])


def _readiness_scores_for_tenant(*, tenant_id: str) -> list[float]:
    scores = [
        float(scan["readinessScore"])
        for scan in list_jobs_for_tenant(tenant_id=tenant_id, limit=50)
        if scan.get("readinessScore") is not None
    ]
    scores.reverse()
    return scores


def _latest_report(auth: AuthContext):
    from app.store.scan_jobs import list_jobs_for_tenant

    jobs = list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=20)
    for job in jobs:
        if job.get("status") != "done":
            continue
        bundle_dict = load_scan_bundle(job["scanId"], tenant_id=auth.tenant_id)
        if not bundle_dict:
            continue
        bundle = bundle_from_api_dict(bundle_dict)
        if bundle.report:
            return job["scanId"], bundle.report
    return None, None


@router.get("/scans/{scan_id}/graph", response_model=ScanGraphResponse)
def tenant_scan_graph(scan_id: str, auth: AuthContext = Depends(require_auth_readonly)) -> ScanGraphResponse:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    bundle = bundle_from_api_dict(bundle_dict)
    if bundle.report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    return build_scan_graph(scan_id=scan_id, report=bundle.report)


@router.get("/hndl/exposure", response_model=HndlExposureResponse)
def tenant_hndl_exposure(
    scan_id: str | None = None,
    auth: AuthContext = Depends(require_auth_readonly),
) -> HndlExposureResponse:
    if scan_id:
        bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
        if bundle_dict is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
        bundle = bundle_from_api_dict(bundle_dict)
        if bundle.report is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
        sid, report = scan_id, bundle.report
    else:
        sid, report = _latest_report(auth)
    if report is None:
        return HndlExposureResponse(scanId=None, totalAssets=0, exposedCount=0, items=[])
    return build_hndl_exposure(report=report, scan_id=sid)


@router.get("/findings/{finding_id}/comments", response_model=FindingCommentListResponse)
def tenant_finding_comments_list(
    finding_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> FindingCommentListResponse:
    comments = list_comments(tenant_id=auth.tenant_id, finding_id=finding_id)
    return FindingCommentListResponse(findingId=finding_id, comments=comments, total=len(comments))


@router.post("/findings/{finding_id}/comments", response_model=FindingCommentListResponse)
def tenant_finding_comments_create(
    finding_id: str,
    body: FindingCommentCreate,
    scan_id: str | None = None,
    auth: AuthContext = Depends(require_auth_write),
) -> FindingCommentListResponse:
    author = auth.email or auth.user_id or "operator"
    create_comment(
        tenant_id=auth.tenant_id,
        finding_id=finding_id,
        scan_id=scan_id,
        author=author,
        body=body.body,
        mentions=body.mentions,
    )
    log_action(
        tenant_id=auth.tenant_id,
        actor=author,
        action="finding_comment_create",
        resource_id=finding_id,
    )
    comments = list_comments(tenant_id=auth.tenant_id, finding_id=finding_id)
    return FindingCommentListResponse(findingId=finding_id, comments=comments, total=len(comments))


@router.delete("/findings/{finding_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def tenant_finding_comments_delete(
    finding_id: str,
    comment_id: str,
    auth: AuthContext = Depends(require_auth_write),
) -> None:
    if not delete_comment(tenant_id=auth.tenant_id, comment_id=comment_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    log_action(
        tenant_id=auth.tenant_id,
        actor=auth.email or auth.user_id or "operator",
        action="finding_comment_delete",
        resource_id=comment_id,
    )


@router.get("/saved-views", response_model=SavedViewListResponse)
def tenant_saved_views_list(auth: AuthContext = Depends(require_auth_readonly)) -> SavedViewListResponse:
    views = list_saved_views(tenant_id=auth.tenant_id, user_id=auth.user_id)
    return SavedViewListResponse(views=views)


@router.put("/saved-views/{view_id}", response_model=SavedViewListResponse)
def tenant_saved_views_upsert(
    view_id: str,
    body: SavedViewCreate,
    auth: AuthContext = Depends(require_auth_write),
) -> SavedViewListResponse:
    upsert_saved_view(
        tenant_id=auth.tenant_id,
        user_id=auth.user_id,
        view_id=view_id,
        name=body.name,
        persona=body.persona,
        filters=body.filters.model_dump(),
    )
    log_action(tenant_id=auth.tenant_id, actor=auth.email or "operator", action="saved_view_upsert", resource_id=view_id)
    return SavedViewListResponse(views=list_saved_views(tenant_id=auth.tenant_id, user_id=auth.user_id))


@router.delete("/saved-views/{view_id}", status_code=status.HTTP_204_NO_CONTENT)
def tenant_saved_views_delete(view_id: str, auth: AuthContext = Depends(require_auth_write)) -> None:
    if not delete_saved_view(tenant_id=auth.tenant_id, view_id=view_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="View not found")


@router.get("/inbox", response_model=InboxResponse)
def tenant_inbox(
    owner: str | None = None,
    auth: AuthContext = Depends(require_auth_readonly),
) -> InboxResponse:
    who = owner or auth.email or auth.user_id or "operator"
    return build_inbox(tenant_id=auth.tenant_id, owner=who)


@router.get("/war-rooms", response_model=list[WarRoom])
def tenant_war_rooms_list(auth: AuthContext = Depends(require_auth_readonly)) -> list[WarRoom]:
    return [WarRoom(**r) for r in list_war_rooms(tenant_id=auth.tenant_id)]


@router.post("/war-rooms", response_model=WarRoom)
def tenant_war_rooms_create(
    body: WarRoomCreate,
    auth: AuthContext = Depends(require_auth_write),
) -> WarRoom:
    row = create_war_room(
        tenant_id=auth.tenant_id,
        title=body.title,
        alert_ids=body.alertIds,
        assignees=body.assignees,
    )
    log_action(tenant_id=auth.tenant_id, actor=auth.email or "operator", action="war_room_create", resource_id=row["id"])
    return WarRoom(**row)


@router.post("/ai/query", response_model=AiQueryResponse)
def tenant_ai_query(body: AiQueryRequest, auth: AuthContext = Depends(require_auth_readonly)) -> AiQueryResponse:
    sid, _ = _latest_report(auth)
    return run_nl_query(
        tenant_id=auth.tenant_id,
        query=body.query,
        persona=body.persona,
        portfolio_context={"latestScanId": sid, "alertCount": len(list_alerts(tenant_id=auth.tenant_id, since_days=7))},
    )


@router.get("/ai/executive-narrative", response_model=ExecutiveNarrativeResponse)
def tenant_executive_narrative(auth: AuthContext = Depends(require_auth_readonly)) -> ExecutiveNarrativeResponse:
    from app.remediation.service import remediation_velocity

    scores = _readiness_scores_for_tenant(tenant_id=auth.tenant_id)
    readiness = scores[-1] if scores else None
    velocity = remediation_velocity(tenant_id=auth.tenant_id)
    summary = {
        "kpis": {"latestReadiness": readiness},
        "remediationVelocity": velocity,
        "latestScanId": next(
            (
                j["scanId"]
                for j in list_jobs_for_tenant(tenant_id=auth.tenant_id, limit=10)
                if j.get("status") == "done"
            ),
            None,
        ),
    }
    return build_executive_narrative(tenant_id=auth.tenant_id, summary=summary)


@router.post("/ai/remediation-pr-draft", response_model=RemediationPrDraftResponse)
def tenant_remediation_pr_draft(
    body: RemediationPrDraftRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> RemediationPrDraftResponse:
    return draft_remediation_pr(remediation_id=body.remediationId, scan_id=body.scanId)


@router.get("/ai/agentic-plan/{remediation_id}", response_model=AgenticPlanResponse)
def tenant_agentic_plan(
    remediation_id: str,
    auth: AuthContext = Depends(require_auth_readonly),
) -> AgenticPlanResponse:
    return build_agentic_plan(remediation_id=remediation_id)


@router.get("/incidents/correlated", response_model=CorrelatedIncidentsResponse)
def tenant_correlated_incidents(auth: AuthContext = Depends(require_auth_readonly)) -> CorrelatedIncidentsResponse:
    alerts = [
        {
            "id": a.get("id"),
            "severity": a.get("severity"),
            "message": a.get("message"),
            "title": a.get("message", "")[:80],
            "category": a.get("rule"),
            "host": (a.get("payload") or {}).get("host"),
            "createdAt": a.get("firedAt"),
        }
        for a in list_alerts(tenant_id=auth.tenant_id, since_days=30, include_resolved=False)
    ]
    return group_alerts(alerts)


@router.get("/cadence/recommendation", response_model=CadenceRecommendation)
def tenant_cadence_recommendation(auth: AuthContext = Depends(require_auth_readonly)) -> CadenceRecommendation:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    schedules = settings.get("defaultCadenceHours")
    return recommend_cadence(tenant_id=auth.tenant_id, current_cadence_hours=schedules)


@router.get("/analytics/anomaly-explanations")
def tenant_anomaly_explanations(auth: AuthContext = Depends(require_auth_readonly)) -> dict[str, Any]:
    scores = _readiness_scores_for_tenant(tenant_id=auth.tenant_id)
    alerts = detect_readiness_anomalies(scores=scores)
    explanations = [
        {
            "message": f"Readiness changed by {a.get('delta', 0):.1f} pts — review latest scan diff for new quantum-vulnerable assets.",
            "delta": a.get("delta"),
            "index": a.get("index"),
        }
        for a in alerts
    ]
    return {"explanations": explanations, "assumptions": ["Based on readiness score series only."]}


@router.get("/analytics/trajectory-forecast")
def tenant_trajectory_forecast(auth: AuthContext = Depends(require_auth_readonly)) -> dict[str, Any]:
    from app.remediation.service import remediation_velocity

    scores = _readiness_scores_for_tenant(tenant_id=auth.tenant_id)
    base = forecast_readiness(scores=scores)
    velocity = remediation_velocity(tenant_id=auth.tenant_id)
    optimistic = min(100.0, (scores[-1] if scores else 0) + velocity.get("closedLast30d", 0) * 2)
    return {
        "currentPace": base,
        "topFiveClosed": {**base, "projected": optimistic},
        "confidenceBand": {"low": max(0, optimistic - 8), "high": min(100, optimistic + 4)},
        "assumptions": ["Top-5 closed projection assumes closing highest-severity backlog items."],
    }


@router.get("/evidence/transparency", response_model=TransparencyLogResponse)
def tenant_evidence_transparency(
    limit: int = Query(default=50, ge=1, le=200),
    auth: AuthContext = Depends(require_auth_readonly),
) -> TransparencyLogResponse:
    return build_transparency_view(limit=limit)


@router.post("/evidence/auditor-packet", response_model=AuditorPacketResponse)
def tenant_auditor_packet(
    body: dict[str, Any],
    auth: AuthContext = Depends(require_auth_readonly),
) -> AuditorPacketResponse:
    scan_ids = body.get("scanIds") or body.get("scan_ids") or []
    if not scan_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="scanIds required")
    for sid in scan_ids:
        if load_scan_bundle(sid, tenant_id=auth.tenant_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scan {sid} not found")
    return build_auditor_packet(tenant_id=auth.tenant_id, scan_ids=scan_ids)


@router.get("/portfolio/rollup", response_model=PortfolioRollupResponse)
def tenant_portfolio_rollup(auth: AuthContext = Depends(require_auth_readonly)) -> PortfolioRollupResponse:
    from app.portfolio.service import portfolio_command_center

    data = portfolio_command_center(tenant_id=auth.tenant_id)
    children = data.get("children") or data.get("tenants") or []
    scores = [c.get("readinessScore") for c in children if c.get("readinessScore") is not None]
    avg = round(sum(scores) / len(scores), 1) if scores else None
    return PortfolioRollupResponse(childCount=len(children), avgReadiness=avg, tenants=children)


@router.get("/benchmarks/percentiles", response_model=PeerPercentileResponse)
def tenant_benchmark_percentiles(auth: AuthContext = Depends(require_auth_readonly)) -> PeerPercentileResponse:
    from app.data.benchmarks import compare_to_benchmark
    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    industry = str(settings.get("industry") or "financial")
    scores = _readiness_scores_for_tenant(tenant_id=auth.tenant_id)
    score = scores[-1] if scores else 0.0
    bench = compare_to_benchmark(score=score, industry=industry)
    return PeerPercentileResponse(
        readinessPercentile=float(bench.get("percentileEstimate")) if bench.get("available") else None,
        velocityPercentile=None,
        sector=industry,
        sampleSize=int(bench.get("sampleSize") or 0),
    )


@router.get("/notification-preferences", response_model=NotificationPreferences)
def tenant_notification_preferences_get(auth: AuthContext = Depends(require_auth_readonly)) -> NotificationPreferences:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    prefs = settings.get("notificationPreferences") or {}
    return NotificationPreferences(**prefs) if prefs else NotificationPreferences()


@router.put("/notification-preferences", response_model=NotificationPreferences)
def tenant_notification_preferences_put(
    body: NotificationPreferences,
    auth: AuthContext = Depends(require_auth_write),
) -> NotificationPreferences:
    upsert_tenant_settings(
        tenant_id=auth.tenant_id,
        settings={"notificationPreferences": body.model_dump()},
    )
    return body
