from __future__ import annotations

from typing import Any

from app.pqc.models import CryptoAsset, MigrationReport


def compute_findings_delta(
    report: MigrationReport,
    *,
    manual_assets_found: int | None = None,
    manual_quantum_vulnerable: int | None = None,
) -> dict[str, Any]:
    """Compare Qtangl discovery to manual baseline / scoreboard."""
    sb = report.scoreboard_summary or {}
    manual = sb.get("manual") or sb.get("qtangl") or {}
    qtangl = sb.get("qtangl") or manual

    manual_count = manual_assets_found
    if manual_count is None:
        manual_count = int(manual.get("assets_discovered") or manual.get("assetsDiscovered") or 0)
    manual_qv = manual_quantum_vulnerable
    if manual_qv is None:
        manual_qv = int(manual.get("quantum_vulnerable") or manual.get("quantumVulnerable") or 0)

    qtangl_count = len(report.assets)
    qtangl_qv = sum(
        1
        for a in report.assets
        if a.vulnerability.status in {"at-risk", "broken"} and not a.pqc_ready
    )
    qtangl_hndl = sum(1 for a in report.assets if a.vulnerability.hndl_exposed)

    net_new = max(0, qtangl_count - manual_count)
    missed_hndl = max(0, qtangl_hndl - int(manual.get("hndl_exposed") or manual.get("hndlExposed") or 0))

    critical_net_new = sum(
        1
        for a in report.assets
        if a.vulnerability.severity in {"critical", "high"}
        and a.vulnerability.status in {"at-risk", "broken"}
    )

    summary_parts: list[str] = []
    if net_new > 0:
        summary_parts.append(
            f"Qtangl discovered {net_new} asset(s) beyond the customer manual baseline ({manual_count})."
        )
    else:
        summary_parts.append(
            f"Qtangl classified {qtangl_count} asset(s) vs manual baseline of {manual_count}."
        )
    if missed_hndl > 0:
        summary_parts.append(f"{missed_hndl} HNDL-exposed asset(s) were not reflected in manual counts.")
    if qtangl_qv > manual_qv:
        summary_parts.append(
            f"Quantum-vulnerable count: manual {manual_qv} → Qtangl {qtangl_qv}."
        )

    return {
        "manualAssetsFound": manual_count,
        "manualQuantumVulnerable": manual_qv,
        "qtanglAssetsFound": qtangl_count,
        "qtanglQuantumVulnerable": qtangl_qv,
        "qtanglHndlExposed": qtangl_hndl,
        "netNewAssets": net_new,
        "missedHndlInManual": missed_hndl,
        "criticalNetNew": critical_net_new,
        "summary": " ".join(summary_parts),
        "qtanglWallTimeSeconds": float(
            qtangl.get("scan_wall_time_seconds") or qtangl.get("scanWallTimeSeconds") or 0
        ),
        "manualWallTimeSeconds": float(
            manual.get("scan_wall_time_seconds") or manual.get("scanWallTimeSeconds") or 0
        ),
    }


def attach_findings_delta(report: MigrationReport) -> dict[str, Any]:
    delta = compute_findings_delta(report)
    exec_sum = dict(report.executive_summary or {})
    exec_sum["findingsDelta"] = delta
    return exec_sum
