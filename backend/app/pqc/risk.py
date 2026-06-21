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


def mosca_assessment_for_report(mosca: MoscaAssessment) -> dict[str, Any]:
    """Structured Mosca block for compliance report packs (JSON/PDF)."""
    x = mosca.data_shelf_life_years
    y = mosca.migration_time_years
    z = mosca.years_to_q_day
    holds = mosca.inequality_holds
    return {
        "headline": "Mosca inequality assessment (harvest-now-decrypt-later)",
        "formula": "X + Y > Z",
        "variables": {
            "dataShelfLifeYears": x,
            "migrationTimeYears": y,
            "yearsToQDay": z,
        },
        "sumXY": round(x + y, 2),
        "inequalityHolds": holds,
        "hndlRiskLevel": "elevated" if holds else "moderate",
        "summary": mosca.summary,
        "interpretation": (
            "Under these assumptions, ciphertext captured today may be decrypted after Q-Day "
            "unless migration completes in time — prioritize HNDL-exposed assets."
            if holds
            else "Under these assumptions, migration can complete before Q-Day; "
            "HNDL timeline pressure is moderate but inventory gaps still require action."
        ),
    }


def classified_assets(assets: list[CryptoAsset]) -> list[CryptoAsset]:
    return [asset for asset in assets if asset.kind != "error"]


def coverage_confidence_for_assets(assets: list[CryptoAsset]) -> dict[str, Any]:
    """Method-weighted coverage confidence v2 for scan-time risk reporting."""
    from app.cbom.coverage import compute_coverage_confidence

    inventory = classified_assets(assets)
    sources: list[dict[str, Any]] = []
    for asset in inventory:
        method = str(asset.metadata.get("sourceMethod") or asset.metadata.get("source") or "live_scan")
        sources.append({"sourceType": method})
    components = [
        {
            "kind": asset.kind,
            "verified": asset.metadata.get("verificationStatus") != "unverified-source",
            "verificationStatus": asset.metadata.get("verificationStatus", "verified"),
            "sourceType": asset.metadata.get("sourceMethod") or "live_scan",
        }
        for asset in inventory
    ]
    return compute_coverage_confidence(components=components, sources=sources)


def readiness_assessment(assets: list[CryptoAsset]) -> dict[str, Any]:
    inventory = classified_assets(assets)
    if not inventory:
        return {
            "score": 0.0,
            "band": "No assets discovered",
            "summary": "No cryptographic assets were classified in this scan window.",
            "pqcReadyCount": 0,
            "classifiedCount": 0,
        }

    pqc_ready_count = sum(1 for asset in inventory if asset.pqc_ready)
    safe = sum(1 for asset in inventory if asset.vulnerability.status == "safe")
    at_risk = sum(1 for asset in inventory if asset.vulnerability.status == "at-risk")
    broken = sum(1 for asset in inventory if asset.vulnerability.status == "broken")
    total = len(inventory)

    hybrid_credit = (pqc_ready_count / total) * 20.0
    inventory_baseline = min(30.0, 10.0 + total * 2.5)
    raw = (
        inventory_baseline
        + 100.0 * (safe / total)
        - 12.0 * (at_risk / total)
        - 25.0 * (broken / total)
        + hybrid_credit
    )
    score = round(max(10.0 if total > 0 else 0.0, min(95.0, raw)), 1)

    if pqc_ready_count == total and total > 0:
        band = "PQC-ready"
    elif pqc_ready_count > 0:
        band = "In progress"
    elif score <= 25.0:
        band = "Pre-migration baseline"
    else:
        band = "Partial readiness"

    pct = round(100.0 * pqc_ready_count / total, 1)
    summary = (
        f"{pct}% of {total} discovered endpoints negotiate hybrid/PQC today. "
        f"{at_risk + broken} asset(s) require migration under NIST IR 8547 timelines. "
        "Coverage is endpoint-scoped, not a formal audit."
    )
    coverage = coverage_confidence_for_assets(assets)
    return {
        "score": score,
        "band": band,
        "summary": summary,
        "pqcReadyCount": pqc_ready_count,
        "classifiedCount": total,
        "coverageConfidence": coverage.get("score", 0.0),
        "coverageBand": coverage.get("band", "unknown"),
    }


def readiness_score(assets: list[CryptoAsset]) -> float:
    return float(readiness_assessment(assets)["score"])


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
    reachability = str(asset.metadata.get("reachability") or "").lower()
    reachability_boost = {"confirmed": 1.35, "reachable": 1.15, "available": 1.0}.get(reachability, 1.0)

    base = (severity_weight + hndl_boost + broken_boost + too_late_boost) * kind_weight * reachability_boost
    if mosca.inequality_holds and asset.vulnerability.hndl_exposed:
        base *= 1.25
    if asset.pqc_ready:
        base *= 0.35
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
        if asset.pqc_ready:
            verdict = "Hybrid/PQC key exchange negotiated; maintain configuration and monitor for downgrade"
        elif too_late:
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
                pqc_ready=asset.pqc_ready,
                metadata=asset.metadata,
            )
        )
    return sorted(updated, key=lambda item: item.mosca_priority, reverse=True)


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
    readiness: dict[str, Any] | None = None,
) -> RiskScoreboard:
    inventory = classified_assets(qtangl_assets)
    assessment = readiness or readiness_assessment(qtangl_assets)
    q_vuln = sum(
        1
        for asset in inventory
        if asset.vulnerability.status in {"at-risk", "broken"} and not asset.pqc_ready
    )
    hndl = sum(1 for asset in inventory if asset.vulnerability.hndl_exposed and not asset.pqc_ready)
    score = float(assessment["score"])
    cov = remediation_coverage(backlog_count, len(inventory))

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
        assets_discovered=len(inventory),
        quantum_vulnerable=q_vuln,
        hndl_exposed=hndl,
        readiness_score=score,
        remediation_coverage=cov,
        audit_pack_available=True,
        summary=str(assessment["summary"]),
        readiness_band=str(assessment["band"]),
    )
    return RiskScoreboard(manual=manual_col, qtangl=qtangl_col)


def crypto_agility_score(assets: list[CryptoAsset]) -> float:
    """How quickly keys/algorithms can be rotated — distinct from readiness."""
    inventory = classified_assets(assets)
    if not inventory:
        return 0.0
    pqc_ready = sum(1 for asset in inventory if asset.pqc_ready)
    short_lived = sum(1 for asset in inventory if (asset.validity_days or 365) <= 90)
    modern_tls = sum(
        1
        for asset in inventory
        if asset.tls_version and asset.tls_version.startswith("TLS 1.3")
    )
    score = (
        30.0 * (pqc_ready / len(inventory))
        + 25.0 * (short_lived / len(inventory))
        + 25.0 * (modern_tls / max(1, sum(1 for a in inventory if a.kind == "tls")))
        + 20.0 * (1.0 - sum(1 for a in inventory if a.vulnerability.status == "broken") / len(inventory))
    )
    return round(min(100.0, score), 1)


def crypto_agility_breakdown(assets: list[Any]) -> dict[str, Any]:
    """Sub-factors for scoring transparency appendix."""
    from app.pqc.risk import classified_assets

    inventory = classified_assets(assets)
    if not inventory:
        return {"score": 0.0, "interpretation": "No classified assets."}
    pqc_ready = sum(1 for asset in inventory if asset.pqc_ready)
    short_lived = sum(1 for asset in inventory if (asset.validity_days or 365) <= 90)
    tls_assets = [a for a in inventory if a.kind == "tls"]
    modern_tls = sum(1 for asset in tls_assets if asset.tls_version and asset.tls_version.startswith("TLS 1.3"))
    broken = sum(1 for asset in inventory if asset.vulnerability.status == "broken")
    reuse = sum(1 for asset in inventory if asset.metadata.get("keyReusePeers"))
    score = (
        30.0 * (pqc_ready / len(inventory))
        + 25.0 * (short_lived / len(inventory))
        + 25.0 * (modern_tls / max(1, len(tls_assets)))
        + 20.0 * (1.0 - broken / len(inventory))
    )
    interpretation = "Moderate agility"
    if reuse >= 2:
        interpretation = f"Low agility — shared keys across {reuse} endpoint(s)"
    elif score >= 70:
        interpretation = "High agility — strong PQC/TLS modernization signals"
    return {
        "score": round(min(100.0, score), 1),
        "pqcReadyShare": round(100.0 * pqc_ready / len(inventory), 1),
        "shortLivedShare": round(100.0 * short_lived / len(inventory), 1),
        "modernTlsShare": round(100.0 * modern_tls / max(1, len(tls_assets)), 1),
        "keyReuseEndpoints": reuse,
        "interpretation": interpretation,
    }


def readiness_formula_breakdown(assets: list[Any]) -> dict[str, Any]:
    """Expose readiness math for PDF methodology appendix."""
    from app.pqc.risk import classified_assets

    inventory = classified_assets(assets)
    if not inventory:
        return {"score": 0.0, "inventoryBaseline": 0.0, "hybridCredit": 0.0, "classifiedCount": 0}
    pqc_ready = sum(1 for asset in inventory if asset.pqc_ready)
    safe = sum(1 for asset in inventory if asset.vulnerability.status == "safe")
    at_risk = sum(1 for asset in inventory if asset.vulnerability.status == "at-risk")
    broken = sum(1 for asset in inventory if asset.vulnerability.status == "broken")
    total = len(inventory)
    hybrid_credit = (pqc_ready / total) * 20.0
    inventory_baseline = min(30.0, 10.0 + total * 2.5)
    raw = (
        inventory_baseline
        + 100.0 * (safe / total)
        - 12.0 * (at_risk / total)
        - 25.0 * (broken / total)
        + hybrid_credit
    )
    return {
        "score": round(max(10.0, min(95.0, raw)), 1),
        "inventoryBaseline": round(inventory_baseline, 1),
        "hybridCredit": round(hybrid_credit, 1),
        "safeCount": safe,
        "atRiskCount": at_risk,
        "brokenCount": broken,
        "classifiedCount": total,
        "pqcReadyCount": pqc_ready,
    }


def scoreboard_summary_dict(scoreboard: RiskScoreboard) -> dict[str, Any]:
    from dataclasses import asdict

    return {
        "manual": asdict(scoreboard.manual),
        "qtangl": asdict(scoreboard.qtangl),
    }
