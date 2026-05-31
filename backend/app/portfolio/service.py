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
        entries.append(
            {
                "scanId": scan["scanId"],
                "target": target,
                "businessUnit": unit,
                "readinessScore": score,
                "readinessBand": report.get("readinessBand", ""),
            }
        )

    rollup = {
        unit: round(sum(scores) / len(scores), 1) if scores else 0.0
        for unit, scores in by_unit.items()
    }
    overall = round(sum(rollup.values()) / len(rollup), 1) if rollup else 0.0
    return {"overallReadiness": overall, "byBusinessUnit": rollup, "scans": entries[:25]}


def _row_to_dict(row: PortfolioTargetRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "target": row.target,
        "businessUnit": row.business_unit,
        "label": row.label,
    }
