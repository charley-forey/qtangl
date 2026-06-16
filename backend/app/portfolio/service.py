from __future__ import annotations

from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import PortfolioTarget as PortfolioTargetRow
from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle


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
    """Roll up readiness by business unit from recent scans."""
    targets = {t["target"]: t for t in list_portfolio(tenant_id=tenant_id)}
    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=50)
    by_unit: dict[str, list[float]] = {}
    entries: list[dict[str, Any]] = []

    scores_by_target: dict[str, list[float]] = {}

    for scan in scans:
        if scan.get("status") != "done":
            continue
        bundle = load_scan_bundle(scan["scanId"], tenant_id=tenant_id)
        if not bundle:
            continue
        report = bundle.get("report", {})
        score = float(report.get("readinessScore", 0))
        target = str(report.get("targetDomain", ""))
        unit = "default"
        for t in targets.values():
            if t["target"] in target or target in t["target"]:
                unit = t["businessUnit"]
                break
        by_unit.setdefault(unit, []).append(score)
        scores_by_target.setdefault(target, []).append(score)
        readiness_delta = None
        target_history = scores_by_target[target]
        if len(target_history) >= 2:
            readiness_delta = round(target_history[0] - target_history[1], 1)
        entries.append(
            {
                "scanId": scan["scanId"],
                "target": target,
                "businessUnit": unit,
                "readinessScore": score,
                "readinessBand": report.get("readinessBand", ""),
                "readinessDelta": readiness_delta,
            }
        )

    bu_deltas: dict[str, float | None] = {}
    for unit in by_unit:
        unit_entries = [e for e in entries if e["businessUnit"] == unit and e.get("readinessDelta") is not None]
        if unit_entries:
            bu_deltas[unit] = round(
                sum(float(e["readinessDelta"]) for e in unit_entries) / len(unit_entries),
                1,
            )

    rollup = {
        unit: round(sum(scores) / len(scores), 1) if scores else 0.0
        for unit, scores in by_unit.items()
    }
    overall = round(sum(rollup.values()) / len(rollup), 1) if rollup else 0.0
    return {
        "overallReadiness": overall,
        "byBusinessUnit": rollup,
        "businessUnitDeltas": bu_deltas,
        "scans": entries[:25],
    }


def portfolio_command_center(*, tenant_id: str) -> dict[str, Any]:
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
        "highRiskTargets": high_risk[:10],
        "recommendedActions": [
            "Prioritize high-risk units for 30-day remediation sprint.",
            "Require signed board pack for each target below readiness threshold.",
            "Track weekly readiness delta and unresolved critical findings.",
        ],
    }


def weekly_executive_digest(*, tenant_id: str) -> dict[str, Any]:
    rollup = readiness_rollup(tenant_id=tenant_id)
    scans = rollup.get("scans", [])
    if not scans:
        return {
            "headline": "No scans completed this week.",
            "wins": [],
            "risks": ["Portfolio has no recent evidence."],
            "nextWeekFocus": ["Run baseline scans for all portfolio targets."],
            "sinceLastBoardMeeting": "No board meeting baseline recorded.",
            "topCryptoRisks": [],
            "narrative": "Establish a baseline scan to unlock executive digest insights.",
        }
    improving = sorted(scans, key=lambda row: float(row.get("readinessScore", 0)), reverse=True)[:3]
    lagging = sorted(scans, key=lambda row: float(row.get("readinessScore", 0)))[:3]
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
        "nextWeekFocus": [
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
