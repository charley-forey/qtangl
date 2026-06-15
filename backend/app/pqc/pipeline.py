from __future__ import annotations

import uuid
from time import perf_counter
from typing import Any, Callable

from app.pqc.handshake import prove_handshake
from app.pqc.models import PqcDataset, ScanBundle, ScanScenario, TimelineEvent
from app.pqc.report import build_migration_report
from app.pqc.risk import apply_risk_to_assets, assess_mosca, build_scoreboard, readiness_assessment, scoreboard_summary_dict
from app.pqc.scanner import scan_fixture, scan_live, flag_key_reuse
from app.pqc.safety import ScanSafetyError, live_scan_enabled
from app.pqc.standards import build_remediation_backlog


def run_pqc_scan(
    dataset: PqcDataset,
    *,
    scenario_id: str,
    use_fixture: bool = True,
    target_override: str | None = None,
    uploaded_rows: list[dict[str, Any]] | None = None,
    seed: int = 1234,
    on_progress: Callable[[TimelineEvent], None] | None = None,
    depth: str = "standard",
    scan_id: str | None = None,
    industry: str | None = None,
    tenant_id: str | None = None,
) -> ScanBundle:
    del seed  # reserved for reproducibility hooks
    started = perf_counter()
    scenario = next(s for s in dataset.scenarios if s.id == scenario_id)
    # Use the caller-supplied id (e.g. the async job id) so the bundle, report,
    # persisted row, poll response, and public verify link all share one scan id.
    scan_id = scan_id or f"scan-{uuid.uuid4()}"
    effective_target = target_override or scenario.target.domain
    scan_coverage: list[dict[str, Any]] = []

    def emit(key: str, label: str, duration_ms: int = 0, status: str = "done") -> None:
        event = TimelineEvent(key=key, label=label, duration_ms=duration_ms, status=status)
        if on_progress:
            on_progress(event)

    if use_fixture:
        assets, timeline, scan_coverage = scan_fixture(dataset, scenario, uploaded_rows=uploaded_rows)
    else:
        if not live_scan_enabled():
            raise ScanSafetyError(
                "Live PQC scanning is disabled. Set QTANGL_PQC_ENABLE_LIVE_SCAN=true "
                "or use fixture mode."
            )
        from app.pqc.scan_context import scan_tenant_context

        with scan_tenant_context(tenant_id):
            assets, timeline, scan_coverage = scan_live(
                scenario,
                target_override=target_override,
                uploaded_rows=uploaded_rows,
                on_progress=on_progress,
            )

    emit("risk", "Applying Mosca HNDL risk model…")
    assets = flag_key_reuse(assets)
    mosca = assess_mosca(dataset.risk_assumptions)
    assets = apply_risk_to_assets(
        assets,
        risk_assumptions=dataset.risk_assumptions,
        remediation_weights=dataset.remediation_weights,
        standards=dataset.standards,
    )
    backlog = build_remediation_backlog(
        assets,
        standards=dataset.standards,
        deadlines=dataset.deadlines,
        remediation_weights=dataset.remediation_weights,
    )

    if depth == "lite":
        assets = assets[: max(5, min(len(assets), 8))]
        backlog = backlog[:3]

    emit("handshake", "Proving post-quantum TLS handshake…")
    handshake = prove_handshake(use_fixture=use_fixture)

    wall = perf_counter() - started
    manual_dict = {
        "inventoryWeeks": scenario.manual_baseline.inventory_weeks,
        "assetsFound": scenario.manual_baseline.assets_found,
        "quantumVulnerable": scenario.manual_baseline.quantum_vulnerable,
        "readinessScore": scenario.manual_baseline.readiness_score,
        "hndlExposed": scenario.manual_baseline.quantum_vulnerable,
        "remediationCoverage": 15,
        "summary": scenario.manual_baseline.summary,
    }
    assessment = readiness_assessment(assets)
    scoreboard = build_scoreboard(
        manual=manual_dict,
        qtangl_assets=assets,
        scan_wall_time_seconds=wall,
        backlog_count=len(backlog),
        use_fixture=use_fixture,
        readiness=assessment,
    )

    report = build_migration_report(
        scan_id=scan_id,
        scenario=scenario,
        assets=assets,
        backlog=backlog,
        mosca=mosca,
        standards=dataset.standards,
        deadlines=dataset.deadlines,
        handshake_proof=handshake,
        target_domain=effective_target,
        scan_coverage=scan_coverage,
        readiness_band=str(assessment["band"]),
        readiness_summary=str(assessment["summary"]),
        scoreboard_summary=scoreboard_summary_dict(scoreboard),
    )
    report.scan_depth = depth
    if depth == "lite":
        report.honesty_notes = list(report.honesty_notes) + [
            "Lite scan: subset of findings only. Contact Qtangl for full endpoint inventory and audit pack.",
        ]

    timeline.append(
        TimelineEvent(
            key="report",
            label=f"Migration report ready ({len(backlog)} remediation items)",
            duration_ms=int(wall * 1000),
            status="done",
        )
    )

    return ScanBundle(
        scan_id=scan_id,
        scenario=scenario,
        assets=assets,
        remediation_backlog=backlog,
        scoreboard=scoreboard,
        handshake_proof=handshake,
        report=report,
        mosca=mosca,
        timeline=timeline,
        details={
            "useFixture": use_fixture,
            "targetOverride": target_override,
            "effectiveTarget": effective_target,
            "totalWallTimeSeconds": round(wall, 4),
            "assetCount": len(assets),
            "scanCoverage": scan_coverage,
            "readinessBand": assessment["band"],
            "pqcReadyCount": assessment["pqcReadyCount"],
            "scanDepth": depth,
            **({"industry": industry} if industry else {}),
        },
    )
