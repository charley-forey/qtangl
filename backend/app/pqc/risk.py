from __future__ import annotations

from typing import Any

from app.pqc.models import CryptoAsset, MoscaAssessment, RiskScoreboard, ScoreboardColumn
from app.pqc.standards import standards_refs_for_asset


def load_mosca_params(risk_assumptions: dict[str, Any]) -> dict[str, float]:
    return {
        "data_shelf_life_years": float(risk_assumptions.get("dataShelfLifeYears", 10)),
        "migration_time_years": float(risk_assumptions.get("migrationTimeYears", 5)),
        "years_to_q_day": float(risk_assumptions.get("yearsToQDay", 12)),
    }


def assess_mosca(risk_assumptions: dict[str, Any]) -> MoscaAssessment:
    params = load_mosca_params(risk_assumptions)
    x = params["data_shelf_life_years"]
    y = params["migration_time_years"]
    z = params["years_to_q_day"]
    holds = (x + y) > z
    if holds:
        summary = (
            f"Mosca inequality holds: X+Y ({x + y:.1f} yr) > Z ({z:.1f} yr). "
            "Sensitive data may be decrypted after Q-Day if not migrated in time."
        )
    else:
        summary = (
            f"Mosca inequality does not hold: X+Y ({x + y:.1f} yr) ≤ Z ({z:.1f} yr). "
            "There is still time to migrate before Q-Day under these assumptions."
        )
    return MoscaAssessment(
        data_shelf_life_years=x,
        migration_time_years=y,
        years_to_q_day=z,
        inequality_holds=holds,
        summary=summary,
    )


def asset_mosca_priority(
    asset: CryptoAsset,
    *,
    mosca: MoscaAssessment,
    remediation_weights: dict[str, Any],
) -> float:
    severity_weight = {
        "critical": 100,
        "high": 75,
        "medium": 50,
        "low": 25,
        "info": 10,
    }.get(asset.vulnerability.severity, 30)

    hndl_boost = 40 if asset.vulnerability.hndl_exposed else 0
    broken_boost = 30 if asset.vulnerability.status == "broken" else 0
    too_late_boost = 50 if asset.already_too_late else 0
    kind_weight = float(remediation_weights.get("kindWeights", {}).get(asset.kind, 1.0))

    base = (severity_weight + hndl_boost + broken_boost + too_late_boost) * kind_weight
    if mosca.inequality_holds and asset.vulnerability.hndl_exposed:
        base *= 1.25
    return round(base, 2)


def apply_risk_to_assets(
    assets: list[CryptoAsset],
    *,
    risk_assumptions: dict[str, Any],
    remediation_weights: dict[str, Any],
    standards: dict[str, Any],
) -> list[CryptoAsset]:
    mosca = assess_mosca(risk_assumptions)
    x = mosca.data_shelf_life_years
    y = mosca.migration_time_years
    z = mosca.years_to_q_day

    updated: list[CryptoAsset] = []
    for asset in assets:
        too_late = asset.vulnerability.hndl_exposed and (x + y) > z
        if too_late:
            verdict = "HNDL exposure: migration window may be insufficient under Mosca X+Y>Z"
        elif asset.vulnerability.hndl_exposed:
            verdict = "Harvest-now-decrypt-later exposed; prioritize migration"
        elif asset.vulnerability.status == "broken":
            verdict = "Classically broken or deprecated; remediate immediately"
        elif asset.vulnerability.status == "safe":
            verdict = "Post-quantum safe or symmetric adequate"
        else:
            verdict = "Review manually; coverage may be incomplete"

        priority = asset_mosca_priority(
            asset,
            mosca=mosca,
            remediation_weights=remediation_weights,
        )
        refs = standards_refs_for_asset(asset, standards)
        updated.append(
            CryptoAsset(
                id=asset.id,
                kind=asset.kind,
                host=asset.host,
                port=asset.port,
                label=asset.label,
                algorithm=asset.algorithm,
                key_size=asset.key_size,
                validity_days=asset.validity_days,
                san_domains=asset.san_domains,
                negotiated_cipher=asset.negotiated_cipher,
                negotiated_group=asset.negotiated_group,
                tls_version=asset.tls_version,
                vulnerability=asset.vulnerability,
                hndl_verdict=verdict,
                already_too_late=too_late,
                mosca_priority=priority,
                standards_refs=refs,
                metadata=asset.metadata,
            )
        )
    return sorted(updated, key=lambda item: item.mosca_priority, reverse=True)


def readiness_score(assets: list[CryptoAsset]) -> float:
    if not assets:
        return 0.0
    safe = sum(1 for asset in assets if asset.vulnerability.status == "safe")
    at_risk = sum(1 for asset in assets if asset.vulnerability.status == "at-risk")
    broken = sum(1 for asset in assets if asset.vulnerability.status == "broken")
    # Penalize vulnerable and broken; never claim 100% from partial coverage.
    raw = 100.0 * (safe / len(assets)) - 8.0 * at_risk / len(assets) - 20.0 * broken / len(assets)
    return round(max(0.0, min(95.0, raw)), 1)


def remediation_coverage(backlog_count: int, asset_count: int) -> float:
    if asset_count == 0:
        return 0.0
    return round(min(100.0, 100.0 * backlog_count / max(1, asset_count)), 1)


def build_scoreboard(
    *,
    manual: dict[str, Any],
    qtangl_assets: list[CryptoAsset],
    scan_wall_time_seconds: float,
    backlog_count: int,
    use_fixture: bool,
) -> RiskScoreboard:
    q_vuln = sum(
        1
        for asset in qtangl_assets
        if asset.vulnerability.status in {"at-risk", "broken"}
    )
    hndl = sum(1 for asset in qtangl_assets if asset.vulnerability.hndl_exposed)
    score = readiness_score(qtangl_assets)
    cov = remediation_coverage(backlog_count, len(qtangl_assets))

    manual_col = ScoreboardColumn(
        label="Manual spreadsheet",
        scan_wall_time_seconds=float(manual.get("inventoryWeeks", 6)) * 7 * 24 * 3600,
        assets_discovered=int(manual.get("assetsFound", 0)),
        quantum_vulnerable=int(manual.get("quantumVulnerable", 0)),
        hndl_exposed=int(manual.get("hndlExposed", manual.get("quantumVulnerable", 0))),
        readiness_score=float(manual.get("readinessScore", 22)),
        remediation_coverage=float(manual.get("remediationCoverage", 15)),
        audit_pack_available=False,
        summary=str(manual.get("summary", "Weeks of manual inventory; stale the day it ships.")),
    )
    qtangl_col = ScoreboardColumn(
        label="Qtangl scan" + (" (fixture replay)" if use_fixture else " (live)"),
        scan_wall_time_seconds=scan_wall_time_seconds,
        assets_discovered=len(qtangl_assets),
        quantum_vulnerable=q_vuln,
        hndl_exposed=hndl,
        readiness_score=score,
        remediation_coverage=cov,
        audit_pack_available=True,
        summary=(
            f"Discovered {len(qtangl_assets)} cryptographic assets with prioritized remediation backlog. "
            "Coverage is endpoint-scoped, not a formal audit."
        ),
    )
    return RiskScoreboard(manual=manual_col, qtangl=qtangl_col)
