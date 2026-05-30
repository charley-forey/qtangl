from __future__ import annotations

import uuid
from time import perf_counter
from typing import Any, Callable

from app.pqc.handshake import prove_handshake
from app.pqc.models import PqcDataset, ScanBundle, ScanScenario, TimelineEvent
from app.pqc.report import build_migration_report
from app.pqc.risk import apply_risk_to_assets, assess_mosca, build_scoreboard
from app.pqc.scanner import scan_fixture, scan_live
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
) -> ScanBundle:
    del seed  # reserved for reproducibility hooks
    started = perf_counter()
    scenario = next(s for s in dataset.scenarios if s.id == scenario_id)
    scan_id = f"scan-{uuid.uuid4()}"

    def emit(key: str, label: str, duration_ms: int = 0, status: str = "done") -> None:
        event = TimelineEvent(key=key, label=label, duration_ms=duration_ms, status=status)
        if on_progress:
            on_progress(event)

    if use_fixture:
        assets, timeline = scan_fixture(dataset, scenario, uploaded_rows=uploaded_rows)
    else:
        if not live_scan_enabled():
            raise ScanSafetyError(
                "Live PQC scanning is disabled. Set QTANGL_PQC_ENABLE_LIVE_SCAN=true "
                "or use fixture mode."
            )
        assets, timeline = scan_live(
            scenario,
            target_override=target_override,
            uploaded_rows=uploaded_rows,
            on_progress=on_progress,
        )

    emit("risk", "Applying Mosca HNDL risk model…")
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
    scoreboard = build_scoreboard(
        manual=manual_dict,
        qtangl_assets=assets,
        scan_wall_time_seconds=wall,
        backlog_count=len(backlog),
        use_fixture=use_fixture,
    )

    report = build_migration_report(
        scan_id=scan_id,
        scenario=scenario,
        assets=assets,
        backlog=backlog,
        mosca=mosca,
        standards=dataset.standards,
        deadlines=dataset.deadlines,
    )

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
            "totalWallTimeSeconds": round(wall, 4),
            "assetCount": len(assets),
        },
    )
