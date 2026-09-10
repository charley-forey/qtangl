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
from app.command_center.qros import (
    build_board_deck_payload,
    build_digital_twin,
    build_morning_briefing,
    build_next_actions,
    build_runway,
    execute_agentic_action,
    install_marketplace_tile,
    list_marketplace_tiles,
    load_nba_state,
    mutate_nba_state,
    simulate_scenario,
    uninstall_marketplace_tile,
)
from app.command_center.qros_pdf import build_qros_board_pdf
from app.command_center.qros_push import deliver_morning_briefing, save_briefing_preferences, qros_summary_snapshot as _qros_summary_snapshot
from app.command_center.schemas import (
    AgenticPlanResponse,
    AgenticActionRequest,
    AgenticActionResponse,
    AiQueryRequest,
    AiQueryResponse,
    AuditorPacketResponse,
    BoardDeckResponse,
    CadenceRecommendation,
    CorrelatedIncidentsResponse,
    DigitalTwinResponse,
    ExecutiveNarrativeResponse,
    FindingCommentCreate,
    FindingCommentListResponse,
    HndlExposureResponse,
    InboxResponse,
    MarketplaceResponse,
    MarketplaceTile,
    MarketplaceInstallRequest,
    MorningBriefingResponse,
    NbaActionRequest,
    NextBestActionResponse,
    NotificationPreferences,
    PeerPercentileResponse,
    PortfolioRollupResponse,
    PushBriefingRequest,
    RemediationPrDraftRequest,
    RemediationPrDraftResponse,
    RunwayResponse,
    SavedViewCreate,
    SavedViewListResponse,
    ScanGraphResponse,
    ScenarioSimRequest,
    ScenarioSimResponse,
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




@router.get("/qros/next-actions", response_model=NextBestActionResponse)
def tenant_qros_next_actions(
    auth: AuthContext = Depends(require_auth_readonly),
) -> NextBestActionResponse:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    dismissed, snoozed = load_nba_state(settings=settings)
    summary = _qros_summary_snapshot(tenant_id=auth.tenant_id, role=auth.role or "operator")
    owner = auth.email or auth.user_id or "operator"
    actions = build_next_actions(
        tenant_id=auth.tenant_id,
        owner=owner,
        recommendations=summary.get("recommendations"),
        alerts=summary.get("alerts"),
        readiness=summary["kpis"].get("latestReadiness"),
        open_critical=int(summary["kpis"].get("openCritical") or 0),
        remediation_velocity=summary.get("remediationVelocity"),
        snoozed_ids=snoozed,
        dismissed_ids=dismissed,
    )
    assigned = (settings.get("qrosNbaState") or {}).get("assigned") or {}
    for action in actions:
        if assigned.get(action["id"]):
            action["owner"] = assigned[action["id"]]
    from datetime import UTC, datetime

    return NextBestActionResponse(
        actions=actions,
        generatedAt=datetime.now(tz=UTC).isoformat(),
    )


@router.post("/qros/next-actions/{action_id}/mutate")
def tenant_qros_nba_mutate(
    action_id: str,
    body: NbaActionRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict[str, Any]:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    nba_state = mutate_nba_state(
        settings=settings,
        action_id=action_id,
        op=body.op,
        owner=body.owner or auth.email,
        snooze_hours=body.snoozeHours,
    )
    upsert_tenant_settings(tenant_id=auth.tenant_id, settings={"qrosNbaState": nba_state})
    log_action(
        tenant_id=auth.tenant_id,
        actor=auth.email or "operator",
        action=f"qros_nba_{body.op}",
        resource_id=action_id,
    )
    return {"status": "success", "actionId": action_id, "op": body.op}


@router.get("/qros/morning-briefing", response_model=MorningBriefingResponse)
def tenant_qros_morning_briefing(
    persona: str = Query(default="operator"),
    auth: AuthContext = Depends(require_auth_readonly),
) -> MorningBriefingResponse:
    summary = _qros_summary_snapshot(tenant_id=auth.tenant_id, role=auth.role or "operator")
    owner = auth.email or auth.user_id or "operator"
    return MorningBriefingResponse(**build_morning_briefing(
        tenant_id=auth.tenant_id,
        persona=persona,
        owner=owner,
        summary=summary,
    ))


@router.get("/qros/runway", response_model=RunwayResponse)
def tenant_qros_runway(auth: AuthContext = Depends(require_auth_readonly)) -> RunwayResponse:
    summary = _qros_summary_snapshot(tenant_id=auth.tenant_id, role=auth.role or "operator")
    return RunwayResponse(**build_runway(summary=summary))


@router.post("/qros/scenario/simulate", response_model=ScenarioSimResponse)
def tenant_qros_scenario_simulate(
    body: ScenarioSimRequest,
    auth: AuthContext = Depends(require_auth_readonly),
) -> ScenarioSimResponse:
    summary = _qros_summary_snapshot(tenant_id=auth.tenant_id, role=auth.role or "operator")
    return ScenarioSimResponse(**simulate_scenario(scenario_id=body.scenarioId, summary=summary))


@router.get("/qros/digital-twin/{scan_id}", response_model=DigitalTwinResponse)
def tenant_qros_digital_twin(
    scan_id: str,
    selected_node_id: str | None = Query(default=None, alias="selectedNodeId"),
    auth: AuthContext = Depends(require_auth_readonly),
) -> DigitalTwinResponse:
    bundle_dict = load_scan_bundle(scan_id, tenant_id=auth.tenant_id)
    if bundle_dict is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    bundle = bundle_from_api_dict(bundle_dict)
    if bundle.report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    graph = build_scan_graph(scan_id=scan_id, report=bundle.report).model_dump()
    return DigitalTwinResponse(**build_digital_twin(graph=graph, selected_node_id=selected_node_id))


@router.post("/qros/board-deck")
def tenant_qros_board_deck(
    format: str | None = Query(default=None, alias="format"),
    auth: AuthContext = Depends(require_auth_readonly),
):
    from fastapi.responses import Response

    summary = _qros_summary_snapshot(tenant_id=auth.tenant_id, role=auth.role or "operator")
    narrative_resp = build_executive_narrative(
        tenant_id=auth.tenant_id,
        summary={
            "kpis": summary["kpis"],
            "remediationVelocity": summary.get("remediationVelocity") or {},
            "latestScanId": summary.get("latestScanId"),
        },
    )
    payload = build_board_deck_payload(summary=summary, narrative=narrative_resp.narrative)
    if format == "pdf":
        pdf_bytes = build_qros_board_pdf(title=payload["title"], slides=payload["slides"])
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="qros-executive-brief.pdf"'},
        )
    return BoardDeckResponse(**payload)


@router.post("/qros/agentic/execute", response_model=AgenticActionResponse)
def tenant_qros_agentic_execute(
    body: AgenticActionRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> AgenticActionResponse:
    if not body.dryRun and not body.approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="approved=true required for non-dry-run execution",
        )
    result = execute_agentic_action(
        action=body.action,
        payload=body.payload,
        dry_run=body.dryRun,
        tenant_id=auth.tenant_id,
        actor_email=auth.email,
    )
    if not body.dryRun and body.approved:
        log_action(
            tenant_id=auth.tenant_id,
            actor=auth.email or "operator",
            action=f"qros_agentic_{body.action}",
            resource_id=str(body.payload.get("remediationId") or body.payload.get("scanId") or ""),
        )
    return AgenticActionResponse(**result)


@router.get("/qros/marketplace/tiles", response_model=MarketplaceResponse)
def tenant_qros_marketplace_tiles(auth: AuthContext = Depends(require_auth_readonly)) -> MarketplaceResponse:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    installed = settings.get("installedTiles")
    tiles = [MarketplaceTile(**t) for t in list_marketplace_tiles(installed_ids=installed)]
    return MarketplaceResponse(tiles=tiles)


@router.post("/qros/marketplace/tiles/{tile_id}/install")
def tenant_qros_marketplace_install(
    tile_id: str,
    auth: AuthContext = Depends(require_auth_write),
) -> MarketplaceResponse:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    installed = install_marketplace_tile(
        installed_ids=settings.get("installedTiles"),
        tile_id=tile_id,
    )
    upsert_tenant_settings(tenant_id=auth.tenant_id, settings={"installedTiles": installed})
    tiles = [MarketplaceTile(**t) for t in list_marketplace_tiles(installed_ids=installed)]
    return MarketplaceResponse(tiles=tiles)


@router.delete("/qros/marketplace/tiles/{tile_id}/install", status_code=status.HTTP_204_NO_CONTENT)
def tenant_qros_marketplace_uninstall(
    tile_id: str,
    auth: AuthContext = Depends(require_auth_write),
) -> None:
    settings = get_tenant_settings_raw(tenant_id=auth.tenant_id)
    installed = uninstall_marketplace_tile(
        installed_ids=settings.get("installedTiles"),
        tile_id=tile_id,
    )
    upsert_tenant_settings(tenant_id=auth.tenant_id, settings={"installedTiles": installed})


@router.post("/qros/push-briefing/send")
def tenant_qros_push_briefing_send(
    body: PushBriefingRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict[str, Any]:
    summary = _qros_summary_snapshot(tenant_id=auth.tenant_id, role=auth.role or "operator")
    owner = auth.email or auth.user_id or "operator"
    briefing = build_morning_briefing(
        tenant_id=auth.tenant_id,
        persona="operator",
        owner=owner,
        summary=summary,
    )
    delivery = deliver_morning_briefing(
        tenant_id=auth.tenant_id,
        briefing=briefing,
        channels=body.channels,
        recipients=[str(email) for email in body.recipients],
        signing_secret=str(get_tenant_settings_raw(tenant_id=auth.tenant_id).get("webhookSigningSecret") or ""),
    )
    log_action(
        tenant_id=auth.tenant_id,
        actor=auth.email or "operator",
        action="qros_push_briefing_attempted",
        resource_id=str(delivery.get("delivered", 0)),
    )
    outcome = "success" if delivery["attempted"] and delivery["delivered"] == delivery["attempted"] else "partial" if delivery["delivered"] else "failed"
    return {"status": outcome, "delivery": delivery}


@router.post("/qros/push-briefing")
def tenant_qros_push_briefing(
    body: PushBriefingRequest,
    auth: AuthContext = Depends(require_auth_write),
) -> dict[str, Any]:
    from app.db.config import persistence_enabled
    from app.monitoring.scheduler_state import scheduler_metrics
    import time

    if not persistence_enabled():
        raise HTTPException(status_code=503, detail="Briefing preferences require persistent storage.")
    if body.enabled:
        from app.command_center.qros_push import briefing_destinations
        from app.notifications.email import smtp_configured

        health = scheduler_metrics()
        tick = health.get("lastTickAt")
        if not health.get("schedulerEnabled") or not health.get("redisEnabled") or not tick or time.time() - float(tick) > max(180, float(health["intervalSec"]) * 3):
            raise HTTPException(status_code=503, detail="The briefing scheduler is unavailable. Try again when the worker is healthy.")
        _, _, errors = briefing_destinations(tenant_id=auth.tenant_id, channels=body.channels, recipients=body.recipients)
        if "email" in body.channels and not smtp_configured():
            errors.append("Email delivery is unavailable until SMTP is configured.")
        if errors:
            raise HTTPException(status_code=422, detail=" ".join(errors))
    saved = save_briefing_preferences(tenant_id=auth.tenant_id, preferences=body.model_dump(mode="json"))
    log_action(
        tenant_id=auth.tenant_id,
        actor=auth.email or "operator",
        action="qros_push_briefing_configured",
        resource_id=",".join(body.channels),
    )
    return {"status": "success", **saved}


@router.get("/qros/push-briefing")
def tenant_qros_push_briefing_preferences(
    auth: AuthContext = Depends(require_auth_readonly),
) -> dict[str, Any]:
    from app.command_center.briefing_schedule import briefing_schedule_outcome

    stored = get_tenant_settings_raw(tenant_id=auth.tenant_id).get("pushBriefing") or {}
    configured = bool(stored.get("revision") and stored.get("firstRunAt"))
    return {
        "channels": stored.get("channels", ["email"]),
        "recipients": stored.get("recipients", []),
        "cadenceHours": stored.get("cadenceHours", 24),
        "enabled": bool(stored.get("enabled") and configured),
        "firstRunAt": stored.get("firstRunAt"),
        "requiresSave": bool(stored.get("enabled") and not configured),
        "lastDelivery": briefing_schedule_outcome(tenant_id=auth.tenant_id, revision=stored["revision"]) if configured else None,
    }
