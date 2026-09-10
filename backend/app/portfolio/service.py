from __future__ import annotations

from math import isfinite
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import PortfolioTarget as PortfolioTargetRow
from app.pqc.safety import normalize_host
from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle


def _target_host(target: str) -> str:
    try:
        return normalize_host(target)
    except ValueError:
        return ""


def list_portfolio(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(PortfolioTargetRow).filter(PortfolioTargetRow.tenant_id == tenant_id).all()
        return [_row_to_dict(row) for row in rows]


def add_portfolio_target(
    *,
    tenant_id: str,
    target: str,
    business_unit: str = "default",
    label: str | None = None,
) -> dict[str, Any]:
    import uuid

    if not persistence_enabled():
        return {"target": target, "businessUnit": business_unit}
    row_id = f"port-{uuid.uuid4()}"
    with db_session() as session:
        row = PortfolioTargetRow(
            id=row_id,
            tenant_id=tenant_id,
            target=target,
            business_unit=business_unit,
            label=label or target,
        )
        session.add(row)
        session.flush()
        return _row_to_dict(row)


def readiness_rollup(*, tenant_id: str) -> dict[str, Any]:
    """Average the latest report per target, using older reports only for deltas."""
    units_by_target: dict[str, set[str]] = {}
    for item in list_portfolio(tenant_id=tenant_id):
        host = _target_host(item["target"])
        if host:
            units_by_target.setdefault(host, set()).add(item["businessUnit"])
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=50)
    by_unit: dict[str, list[float]] = {}

    latest_by_target: dict[str, dict[str, Any]] = {}
    compared_targets: set[str] = set()

    for scan in scans:
        if scan.get("status") != "done":
            continue
        bundle = load_scan_bundle(scan["scanId"], tenant_id=tenant_id)
        if not bundle:
            continue
        report = bundle.get("report", {})
        raw_score = report.get("readinessScore")
        score = float(raw_score) if isinstance(raw_score, (int, float)) and not isinstance(raw_score, bool) else None
        if score is not None and (not isfinite(score) or not 0 <= score <= 100):
            score = None
        target = _target_host(str(report.get("targetDomain") or ""))
        if not target:
            continue
        if target in latest_by_target:
            latest = latest_by_target[target]
            if target not in compared_targets and latest["readinessScore"] is not None and score is not None:
                latest["readinessDelta"] = round(latest["readinessScore"] - score, 1)
            compared_targets.add(target)
            continue
        units = units_by_target.get(target, set())
        unit = next(iter(units)) if len(units) == 1 else "unassigned"
        by_unit.setdefault(unit, [])
        if score is not None:
            by_unit[unit].append(score)
        latest_by_target[target] = {
            "scanId": scan["scanId"],
            "target": target,
            "businessUnit": unit,
            "readinessScore": score,
            "readinessBand": report.get("readinessBand", ""),
            "readinessDelta": None,
        }

    entries = list(latest_by_target.values())

    bu_deltas: dict[str, float | None] = {}
    for unit in by_unit:
        unit_entries = [e for e in entries if e["businessUnit"] == unit and e.get("readinessDelta") is not None]
        if unit_entries:
            bu_deltas[unit] = round(
                sum(float(e["readinessDelta"]) for e in unit_entries) / len(unit_entries),
                1,
            )

    rollup = {
        unit: round(sum(scores) / len(scores), 1) if scores else None
        for unit, scores in by_unit.items()
    }
    current_scores = [score for scores in by_unit.values() for score in scores]
    overall = round(sum(current_scores) / len(current_scores), 1) if current_scores else None
    return {
        "overallReadiness": overall,
        "byBusinessUnit": rollup,
        "businessUnitDeltas": bu_deltas,
        "scans": entries,
        "scoreScope": "Latest completed report per target within the 50 most recent scan jobs; equal weight per scored target.",
    }


def portfolio_command_center(*, tenant_id: str) -> dict[str, Any]:
    from app.recommendations.service import recommendation_action_strings

    rollup = readiness_rollup(tenant_id=tenant_id)
    scans = rollup.get("scans", [])
    high_risk = [
        row
        for row in scans
        if str(row.get("readinessBand", "")).lower() in {"lagging", "critical", "high-risk"}
    ]
    return {
        "overallReadiness": rollup.get("overallReadiness", 0),
        "businessUnits": rollup.get("byBusinessUnit", {}),
        "businessUnitDeltas": rollup.get("businessUnitDeltas", {}),
        "scoreScope": rollup.get("scoreScope"),
        "highRiskTargets": high_risk[:10],
        "recommendedActions": recommendation_action_strings(tenant_id=tenant_id),
    }


def weekly_executive_digest(*, tenant_id: str) -> dict[str, Any]:
    from app.recommendations.service import recommendation_action_strings

    rollup = readiness_rollup(tenant_id=tenant_id)
    scans = rollup.get("scans", [])
    focus = recommendation_action_strings(tenant_id=tenant_id, role="executive")
    scored_scans = [row for row in scans if row.get("readinessScore") is not None]
    if not scored_scans:
        return {
            "headline": "Portfolio readiness is unavailable.",
            "wins": [],
            "risks": ["Portfolio has no recent evidence."],
            "nextWeekFocus": focus[:3] or ["Run baseline scans for all portfolio targets."],
            "sinceLastBoardMeeting": "No board meeting baseline recorded.",
            "topCryptoRisks": [],
            "narrative": "Establish a baseline scan to unlock executive digest insights.",
        }
    improving = sorted(scored_scans, key=lambda row: float(row["readinessScore"]), reverse=True)[:3]
    lagging = sorted(scored_scans, key=lambda row: float(row["readinessScore"]))[:3]
    top_risks = [
        f"{row.get('target')}: readiness {row.get('readinessScore')} ({row.get('readinessBand', 'unknown')})"
        for row in lagging
    ]
    overall = rollup.get("overallReadiness", 0)
    bu_deltas = rollup.get("businessUnitDeltas") or {}
    delta_bits = [f"{unit}: {delta:+.1f}" for unit, delta in bu_deltas.items() if delta is not None][:3]
    narrative = (
        f"Portfolio readiness stands at {overall}. "
        f"{'Business unit movement: ' + ', '.join(delta_bits) + '. ' if delta_bits else ''}"
        "Focus remediation on lagging targets and validate board evidence exports weekly."
    )
    return {
        "headline": f"Portfolio readiness is {overall}.",
        "wins": [f"{row.get('target')}: score {row.get('readinessScore')}" for row in improving],
        "risks": [f"{row.get('target')}: score {row.get('readinessScore')}" for row in lagging],
        "nextWeekFocus": focus[:3]
        or [
            "Close top critical remediation items in lagging targets.",
            "Validate board/auditor report provenance on all executive exports.",
        ],
        "sinceLastBoardMeeting": (
            f"Overall readiness moved to {overall} across {len(scans)} tracked target(s)."
        ),
        "topCryptoRisks": top_risks,
        "narrative": narrative,
    }


def _row_to_dict(row: PortfolioTargetRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "target": row.target,
        "businessUnit": row.business_unit,
        "label": row.label,
    }
