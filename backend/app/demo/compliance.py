from __future__ import annotations

from typing import Any

from app.demo.store import latest_snapshot, list_resources, list_snapshots


def build_compliance_scorecard(*, scan_id: str | None = None) -> dict[str, Any]:
    snap = latest_snapshot()
    bundle = snap.get("bundle") if snap else {}
    if scan_id and snap and snap.get("scanId") != scan_id:
        for item in reversed(list_snapshots(limit=50)):
            if item.get("scanId") == scan_id:
                bundle = item.get("bundle") or {}
                break
    report = bundle.get("report") or {}
    pack = report.get("compliancePack") or {}
    standards = report.get("standardsSummary") or []
    resources = list_resources()
    targets = {r.compliance_target for r in resources if r.enabled}

    frameworks = []
    for fw in ("nist-ir-8547", "pci-dss", "cmmc"):
        entry = pack.get(fw) or next((s for s in standards if str(s.get("framework", "")).lower() in fw), None)
        score = float(entry.get("score", 0)) if isinstance(entry, dict) else 0.0
        status = str(entry.get("status", "unknown")) if isinstance(entry, dict) else "unknown"
        if status == "unknown":
            status = "pass" if score >= 70 else "fail" if score > 0 else "unknown"
        frameworks.append(
            {
                "framework": fw,
                "status": status,
                "score": score,
                "inScope": fw in targets or fw.replace("-", " ") in str(pack).lower(),
            }
        )
    return {
        "frameworks": frameworks,
        "complianceSummary": report.get("complianceSummary") or {},
        "honestyNotes": report.get("honestyNotes") or [],
    }


def build_portfolio_rollup(*, limit: int = 30) -> dict[str, Any]:
    resources = list_resources(enabled_only=True)
    snaps = list_snapshots(limit=limit)
    by_unit_assets: dict[str, int] = {}
    for resource in resources:
        by_unit_assets[resource.business_unit] = by_unit_assets.get(resource.business_unit, 0) + 1
    units = []
    for unit, asset_count in sorted(by_unit_assets.items()):
        units.append(
            {
                "businessUnit": unit,
                "assetCount": asset_count,
                "readinessScore": None,
                "readinessDelta": None,
            }
        )
    latest = snaps[-1] if snaps else None
    return {
        "units": units,
        "overallReadiness": latest.get("readinessScore") if latest else None,
        "overallBand": latest.get("readinessBand") if latest else None,
        "snapshotCount": len(snaps),
    }
