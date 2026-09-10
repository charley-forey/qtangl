"""Quantum Readiness Operating System — decision spine, runway, and platform APIs."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from app.command_center.inbox import build_inbox


def _now_iso() -> str:
    return datetime.now(tz=UTC).isoformat()


def build_next_actions(
    *,
    tenant_id: str,
    owner: str,
    recommendations: list[dict[str, Any]] | None = None,
    alerts: list[dict[str, Any]] | None = None,
    readiness: float | None = None,
    open_critical: int = 0,
    remediation_velocity: dict[str, Any] | None = None,
    snoozed_ids: set[str] | None = None,
    dismissed_ids: set[str] | None = None,
) -> list[dict[str, Any]]:
    """Rank cross-domain actions by risk-reduction-per-effort."""
    snoozed = snoozed_ids or set()
    dismissed = dismissed_ids or set()
    velocity = remediation_velocity or {}
    closed_30 = int(velocity.get("closedLast30d") or velocity.get("closedCount") or 0)
    open_count = int(velocity.get("openCount") or 0)
    velocity_bonus = min(15, closed_30 * 2) if open_count > closed_30 else 0

    actions: list[dict[str, Any]] = []

    for rec in recommendations or []:
        priority = int(rec.get("priority") or 50)
        actions.append(
            {
                "id": f"rec-{rec.get('id', priority)}",
                "kind": "recommendation",
                "title": rec.get("what") or rec.get("title") or "Review recommendation",
                "impact": rec.get("soWhat") or "Improves posture when addressed",
                "effort": "medium",
                "score": max(1, 120 - priority),
                "owner": owner,
                "deepLink": (rec.get("proof") or {}).get("deepLink") or "/command-center?tab=overview",
                "cta": {"label": "Review", "action": "navigate"},
            }
        )

    for alert in alerts or []:
        if alert.get("resolved"):
            continue
        sev = str(alert.get("severity") or "info").lower()
        sev_score = {"critical": 100, "high": 80, "medium": 50, "low": 20}.get(sev, 10)
        actions.append(
            {
                "id": f"alert-{alert.get('id', sev_score)}",
                "kind": "alert",
                "title": alert.get("title") or alert.get("message") or "Unresolved alert",
                "impact": "Active monitor signal requires triage",
                "effort": "low",
                "score": sev_score,
                "owner": owner,
                "deepLink": "/command-center?tab=monitor",
                "cta": {"label": "Triage", "action": "navigate"},
            }
        )

    try:
        inbox = build_inbox(tenant_id=tenant_id, owner=owner, limit=10)
        for item in inbox.items[:5]:
            actions.append(
                {
                    "id": f"inbox-{item.id}",
                    "kind": item.kind,
                    "title": item.title,
                    "impact": "Assigned work item in your queue",
                    "effort": "medium",
                    "score": 70 if (item.severity or "").lower() in {"critical", "high"} else 45,
                    "owner": item.owner or owner,
                    "deepLink": item.deepLink or "/command-center?tab=remediate",
                    "cta": {"label": "Open", "action": "navigate"},
                }
            )
    except Exception:
        pass

    if open_critical > 0:
        actions.append(
            {
                "id": "critical-backlog",
                "kind": "remediation",
                "title": f"Address {open_critical} open critical finding(s)",
                "impact": "Highest-severity inventory items from latest scan",
                "effort": "high",
                "score": 95 + velocity_bonus,
                "owner": owner,
                "deepLink": "/command-center?tab=remediate",
                "cta": {"label": "Remediate", "action": "navigate"},
            }
        )

    if readiness is not None and readiness < 60:
        actions.append(
            {
                "id": "baseline-scan",
                "kind": "assess",
                "title": "Run a baseline inventory scan",
                "impact": "Refresh signed evidence for current posture",
                "effort": "low",
                "score": 85,
                "owner": owner,
                "deepLink": "/command-center?tab=scans",
                "cta": {"label": "Scan", "action": "navigate"},
            }
        )

    actions.sort(key=lambda a: a.get("score", 0), reverse=True)
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for action in actions:
        aid = str(action.get("id", ""))
        if aid in dismissed or aid in snoozed:
            continue
        key = action.get("title", aid)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(action)
    return deduped[:12]


def load_nba_state(*, settings: dict[str, Any]) -> tuple[set[str], set[str]]:
    state = settings.get("qrosNbaState") or {}
    dismissed = set(state.get("dismissed") or [])
    snoozed = set()
    now = datetime.now(tz=UTC)
    for action_id, until in (state.get("snoozed") or {}).items():
        try:
            expiry = datetime.fromisoformat(until)
            if expiry.tzinfo is not None and expiry > now:
                snoozed.add(action_id)
        except (TypeError, ValueError):
            continue
    return dismissed, snoozed


def mutate_nba_state(
    *,
    settings: dict[str, Any],
    action_id: str,
    op: str,
    owner: str | None = None,
    snooze_hours: int = 24,
) -> dict[str, Any]:
    state = dict(settings.get("qrosNbaState") or {})
    dismissed = list(state.get("dismissed") or [])
    snoozed = dict(state.get("snoozed") or {})
    assigned = dict(state.get("assigned") or {})
    if op == "dismiss" and action_id not in dismissed:
        dismissed.append(action_id)
    elif op == "snooze":
        until = (datetime.now(tz=UTC) + timedelta(hours=snooze_hours)).isoformat()
        snoozed[action_id] = until
    elif op == "assign" and owner:
        assigned[action_id] = owner
    return {"dismissed": dismissed, "snoozed": snoozed, "assigned": assigned}


def build_morning_briefing(
    *,
    tenant_id: str,
    persona: str,
    owner: str,
    summary: dict[str, Any],
) -> dict[str, Any]:
    kpis = summary.get("kpis") or {}
    delta = kpis.get("delta")
    readiness = kpis.get("latestReadiness")
    critical = kpis.get("openCritical") or 0
    headlines: list[str] = []

    if delta is not None:
        direction = "improved" if delta >= 0 else "declined"
        headlines.append(f"Readiness {direction} by {abs(delta)} points since the prior scan.")
    elif readiness is not None:
        headlines.append(f"Current readiness score is {readiness}.")

    if critical:
        headlines.append(f"{critical} critical finding(s) remain open in the latest inventory.")

    alerts = summary.get("alerts") or []
    open_alerts = [a for a in alerts if not a.get("resolved")]
    if open_alerts:
        headlines.append(f"{len(open_alerts)} monitor alert(s) need attention.")

    if not headlines:
        headlines.append("No material posture changes since your last visit.")

    focus = headlines[0]
    if persona == "executive":
        focus = f"Executive summary: {focus} Inventory aid — not a formal audit."

    return {
        "generatedAt": _now_iso(),
        "persona": persona,
        "headline": focus,
        "bullets": headlines[:3],
        "nextActions": build_next_actions(
            tenant_id=tenant_id,
            owner=owner,
            recommendations=summary.get("recommendations"),
            alerts=alerts,
            readiness=readiness,
            open_critical=int(critical),
            remediation_velocity=summary.get("remediationVelocity"),
        )[:3],
        "methodNote": (
            "Qtangl quantifies quantum-vulnerable exposure from inventory — "
            "algorithms are not broken today."
        ),
    }


def build_runway(*, summary: dict[str, Any]) -> dict[str, Any]:
    today = datetime.now(tz=UTC).date()
    milestones: list[dict[str, Any]] = [
        {
            "id": "today",
            "label": "Today",
            "date": today.isoformat(),
            "kind": "marker",
            "description": "Planning date; not a measurement of current posture",
        }
    ]

    forecast = summary.get("forecast") or {}
    if forecast.get("targetDate"):
        milestones.append(
            {
                "id": "forecast-target",
                "label": "Trajectory target",
                "date": str(forecast["targetDate"])[:10],
                "kind": "forecast",
                "description": forecast.get("summary") or "Projected readiness path",
            }
        )

    maturity = summary.get("maturity") or {}
    if maturity.get("nextStageName"):
        milestones.append(
            {
                "id": "maturity-next",
                "label": maturity.get("nextStageName"),
                "date": (today + timedelta(days=90)).isoformat(),
                "kind": "maturity",
                "description": f"Illustrative 90-day planning horizon for {maturity.get('nextStageName')}; not a measured completion date",
            }
        )

    milestones.append(
        {
            "id": "hndl-window",
            "label": "Illustrative five-year retention horizon",
            "date": (today + timedelta(days=365 * 5)).isoformat(),
            "kind": "exposure",
            "description": (
                "Planning example assumes five-year data retention; not measured exposure or a Q-Day prediction."
            ),
        }
    )

    return {
        "milestones": milestones,
        "scenarios": [
            {
                "id": "baseline",
                "label": "Current pace",
                "readinessDelta": 0,
                "description": "Keep the latest readiness score unchanged for comparison",
            },
            {
                "id": "accelerated",
                "label": "Accelerated program",
                "readinessDelta": (
                    simulate_scenario(scenario_id="accelerated", summary=summary)["projectedReadiness"]
                    - simulate_scenario(scenario_id="baseline", summary=summary)["projectedReadiness"]
                ),
                "description": "Illustrative uplift based on recorded remediation closures",
            },
        ],
        "framing": (
            "Illustrative planning horizons and available trajectory targets — not compliance deadlines or a prediction of when cryptography breaks."
        ),
    }


def simulate_scenario(*, scenario_id: str, summary: dict[str, Any]) -> dict[str, Any]:
    kpis = summary.get("kpis") or {}
    base = float(kpis.get("latestReadiness") or 0)
    velocity = summary.get("remediationVelocity") or {}
    closed = int(velocity.get("closedLast30d") or velocity.get("closedCount") or 0)
    delta_map = {"baseline": 0, "accelerated": min(20, 8 + closed), "conservative": 4}
    delta = delta_map.get(scenario_id, 0)
    projected = min(100.0, base + delta)
    return {
        "scenarioId": scenario_id,
        "projectedReadiness": projected,
        "confidenceBand": {"low": max(0, projected - 8), "high": min(100, projected + 5)},
        "assumptions": [
            "Illustrative scenario adjustment to latest readiness; not a validated forecast",
            "Accelerated adjustment uses recorded remediation closures; critical count is not modeled",
            "The band is a fixed illustrative range, not a statistical confidence interval",
            *(["No measured readiness available; a zero baseline is assumed"] if kpis.get("latestReadiness") is None else []),
            "Inventory aid — not a formal audit",
        ],
    }


def build_digital_twin(*, graph: dict[str, Any], selected_node_id: str | None = None) -> dict[str, Any]:
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    blast: set[str] = set()
    if selected_node_id:
        blast.add(selected_node_id)
        for edge in edges:
            if edge.get("source") == selected_node_id:
                blast.add(edge.get("target", ""))
            if edge.get("target") == selected_node_id:
                blast.add(edge.get("source", ""))
        blast.discard("")
    return {
        "graph": graph,
        "selectedNodeId": selected_node_id,
        "blastRadius": sorted(blast),
        "simulationNote": (
            "Blast-radius model from scan dependency graph — illustrative sequencing aid."
        ),
    }


def build_board_deck_payload(*, summary: dict[str, Any], narrative: str) -> dict[str, Any]:
    kpis = summary.get("kpis") or {}
    return {
        "title": "Quantum Readiness Executive Brief",
        "generatedAt": _now_iso(),
        "slides": [
            {"title": "Posture at a glance", "body": f"Readiness: {kpis.get('latestReadiness', '—')}"},
            {"title": "Executive narrative", "body": narrative[:4000]},
            {
                "title": "Method note",
                "body": (
                    "Qtangl is an inventory aid. Verification confirms report integrity — "
                    "not complete estate coverage."
                ),
            },
        ],
        "formats": ["pdf", "json"],
    }


def execute_agentic_action(
    *,
    tenant_id: str,
    action: str,
    payload: dict[str, Any],
    dry_run: bool = True,
    actor_email: str | None = None,
) -> dict[str, Any]:
    remediation_id = str(payload.get("remediationId") or "")
    scan_id = str(payload.get("scanId") or "")
    provider = str(payload.get("provider") or "jira")

    if dry_run:
        steps = {
            "draft_pr": ["Generate illustrative remediation draft", "Manually validate configuration and review files before use"],
            "file_ticket": ["Map finding to integration", "Create ticket draft", "Submit (requires approval)"],
            "schedule_scan": ["Validate authorized domains", "Create schedule", "Confirm cadence"],
        }
        plan = steps.get(action, ["Review action", "Execute with approval"])
        return {
            "action": action,
            "dryRun": True,
            "status": "preview",
            "steps": plan,
            "payload": payload,
            "guardrails": _agentic_guardrails(),
        }

    if action == "draft_pr":
        from app.command_center.ai import draft_remediation_pr
        from app.store.scan_jobs import load_scan_bundle

        item: dict[str, Any] = {}
        if scan_id:
            bundle = load_scan_bundle(scan_id, tenant_id=tenant_id) or {}
            backlog = bundle.get("remediationBacklog") or []
            item = next((r for r in backlog if r.get("id") == remediation_id), {})
        draft = draft_remediation_pr(
            remediation_id=remediation_id or "remediation",
            scan_id=scan_id or "scan",
            title=str(item.get("title") or ""),
            algorithm=str(item.get("algorithm") or ""),
        )
        return {
            "action": action,
            "dryRun": False,
            "status": "completed",
            "steps": ["Draft generated — review files before opening PR"],
            "payload": payload,
            "result": draft.model_dump(),
            "guardrails": _agentic_guardrails(),
        }

    if action == "file_ticket":
        from app.integrations.service import list_integrations, push_remediation_ticket
        from app.store.scan_jobs import load_scan_bundle

        if not scan_id or not remediation_id:
            return _agentic_error(action, payload, "scanId and remediationId required")
        bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
        if not bundle:
            return _agentic_error(action, payload, "Scan not found")
        item = next(
            (r for r in (bundle.get("remediationBacklog") or []) if r.get("id") == remediation_id),
            None,
        )
        if not item:
            return _agentic_error(action, payload, "Remediation item not found")
        configured = {row["provider"] for row in list_integrations(tenant_id=tenant_id)}
        use_provider = provider if provider in configured else next(iter(configured), "")
        if not use_provider:
            return _agentic_error(action, payload, "No ITSM integration configured")
        result = push_remediation_ticket(
            tenant_id=tenant_id,
            provider=use_provider,
            item=item,
            scan_id=scan_id,
        )
        return {
            "action": action,
            "dryRun": False,
            "status": "completed" if result.get("sent") else "failed",
            "steps": [f"Ticket push via {use_provider}"],
            "payload": payload,
            "result": result,
            "guardrails": _agentic_guardrails(),
        }

    if action == "schedule_scan":
        from fastapi import HTTPException
        from app.monitoring.batch_schedules import create_batch_schedules
        from app.pqc.safety import resolve_scannable
        from app.store.scan_jobs import load_scan_bundle

        if not scan_id:
            return _agentic_error(action, payload, "Select a completed inventory scan before scheduling")
        bundle = load_scan_bundle(scan_id, tenant_id=tenant_id)
        if not bundle:
            return _agentic_error(action, payload, "Scan not found")
        report = bundle.get("report") or {}
        target = report.get("targetDomain")
        scenario_id = report.get("scenarioId")
        if not target or not scenario_id:
            return _agentic_error(action, payload, "Selected scan has no domain target or scenario to schedule")
        cadence = payload.get("cadenceHours", 168)
        if isinstance(cadence, bool) or not isinstance(cadence, int) or not 1 <= cadence <= 8760:
            return _agentic_error(action, payload, "cadenceHours must be an integer between 1 and 8760")
        try:
            authorized = resolve_scannable(str(target), port=443, tenant_id=tenant_id)
            result = create_batch_schedules(
                tenant_id=tenant_id,
                scenario_id=str(scenario_id),
                targets=[authorized.host],
                cadence_hours=cadence,
                notify_email=actor_email,
            )
            return {
                "action": action,
                "dryRun": False,
                "status": "completed",
                "steps": [f"{result['summary']}: {authorized.host}"],
                "payload": payload,
                "result": result,
                "guardrails": _agentic_guardrails(),
            }
        except HTTPException as exc:
            return _agentic_error(action, payload, str(exc.detail))
        except Exception as exc:
            return _agentic_error(action, payload, str(exc))

    return _agentic_error(action, payload, f"Unknown action: {action}")


def _agentic_guardrails() -> list[str]:
    return [
        "Human-in-the-loop approval required",
        "Allowlisted integrations only",
        "Full audit log entry on execution",
        "Automates workflow — does not fix crypto or attest compliance",
    ]


def _agentic_error(action: str, payload: dict[str, Any], message: str) -> dict[str, Any]:
    return {
        "action": action,
        "dryRun": False,
        "status": "failed",
        "steps": [message],
        "payload": payload,
        "guardrails": _agentic_guardrails(),
    }


MARKETPLACE_TILES: list[dict[str, Any]] = [
    {
        "id": "portfolio-rollup",
        "name": "Portfolio rollup",
        "publisher": "Qtangl",
        "description": "MSSP child-tenant readiness heatmap",
        "category": "portfolio",
        "installed": True,
    },
    {
        "id": "peer-benchmark",
        "name": "Peer benchmark",
        "publisher": "Qtangl",
        "description": "Percentile readiness vs peer cohort",
        "category": "insights",
        "installed": True,
    },
    {
        "id": "webhook-builder",
        "name": "Webhook builder",
        "publisher": "Qtangl",
        "description": "Custom event routing to SIEM/SOAR",
        "category": "integrations",
        "installed": False,
    },
]


def install_marketplace_tile(*, installed_ids: list[str] | None, tile_id: str) -> list[str]:
    ids = [tile["id"] for tile in list_marketplace_tiles(installed_ids=installed_ids) if tile["installed"]]
    if tile_id not in ids:
        ids.append(tile_id)
    return ids


def list_marketplace_tiles(*, installed_ids: list[str] | None = None) -> list[dict[str, Any]]:
    installed = (
        {t["id"] for t in MARKETPLACE_TILES if t.get("installed")}
        if installed_ids is None else set(installed_ids)
    )
    tiles = []
    for tile in MARKETPLACE_TILES:
        row = dict(tile)
        row["installed"] = row["id"] in installed
        tiles.append(row)
    return tiles


def uninstall_marketplace_tile(*, installed_ids: list[str] | None, tile_id: str) -> list[str]:
    return [
        tile["id"] for tile in list_marketplace_tiles(installed_ids=installed_ids)
        if tile["installed"] and tile["id"] != tile_id
    ]
