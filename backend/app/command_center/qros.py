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
) -> list[dict[str, Any]]:
    """Rank cross-domain actions by risk-reduction-per-effort."""
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
                "score": 95,
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
        key = action.get("title", action.get("id", ""))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(action)
    return deduped[:12]


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
            "description": "Current posture baseline",
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
                "description": f"Next maturity stage: {maturity.get('nextStageName')}",
            }
        )

    milestones.append(
        {
            "id": "hndl-window",
            "label": "Long-lived secret exposure window",
            "date": (today + timedelta(days=365 * 5)).isoformat(),
            "kind": "exposure",
            "description": (
                "Harvest-now-decrypt-later exposure framing — not a Q-Day prediction."
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
                "description": "Continue existing remediation velocity",
            },
            {
                "id": "accelerated",
                "label": "Accelerated program",
                "readinessDelta": 12,
                "description": "Close critical backlog within 90 days",
            },
        ],
        "framing": (
            "Exposure windows and compliance deadlines — not a prediction of when cryptography breaks."
        ),
    }


def simulate_scenario(*, scenario_id: str, summary: dict[str, Any]) -> dict[str, Any]:
    kpis = summary.get("kpis") or {}
    base = float(kpis.get("latestReadiness") or 0)
    delta_map = {"baseline": 0, "accelerated": 12, "conservative": 4}
    delta = delta_map.get(scenario_id, 0)
    projected = min(100.0, base + delta)
    return {
        "scenarioId": scenario_id,
        "projectedReadiness": projected,
        "confidenceBand": {"low": max(0, projected - 8), "high": min(100, projected + 5)},
        "assumptions": [
            "Projection based on remediation velocity and open critical count",
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


def execute_agentic_action(*, action: str, payload: dict[str, Any], dry_run: bool = True) -> dict[str, Any]:
    steps = {
        "draft_pr": ["Validate remediation item", "Draft PR description", "Open PR (requires approval)"],
        "file_ticket": ["Map finding to integration", "Create ticket draft", "Submit (requires approval)"],
        "schedule_scan": ["Validate authorized domains", "Create schedule", "Confirm cadence"],
    }
    plan = steps.get(action, ["Review action", "Execute with approval"])
    return {
        "action": action,
        "dryRun": dry_run,
        "status": "pending_approval" if not dry_run else "preview",
        "steps": plan,
        "payload": payload,
        "guardrails": [
            "Human-in-the-loop approval required",
            "Allowlisted integrations only",
            "Full audit log entry on execution",
        ],
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


def list_marketplace_tiles(*, installed_ids: list[str] | None = None) -> list[dict[str, Any]]:
    installed = set(installed_ids or [])
    tiles = []
    for tile in MARKETPLACE_TILES:
        row = dict(tile)
        if row["id"] in installed:
            row["installed"] = True
        tiles.append(row)
    return tiles
