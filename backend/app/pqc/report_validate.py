from __future__ import annotations

import re
from typing import Any

from app.pqc.models import MigrationReport


def validate_report_coherence(
    report: MigrationReport,
    *,
    strict: bool = True,
) -> list[str]:
    """Return human-readable coherence issues. Empty list means OK."""
    issues: list[str] = []
    asset_count = len(report.assets)
    backlog_count = len(report.remediation_backlog)
    exec_sum = report.executive_summary or {}
    priorities = list(exec_sum.get("topPriorities") or [])
    summary_text = report.readiness_summary or ""

    if asset_count == 0 and not report.scan_coverage:
        issues.append("No classified assets and no scan_coverage explaining empty inventory.")

    endpoint_match = re.search(r"(\d+)\s+discovered endpoints", summary_text, re.I)
    if endpoint_match and asset_count > 0:
        mentioned = int(endpoint_match.group(1))
        if mentioned != asset_count:
            issues.append(
                f"Readiness summary mentions {mentioned} endpoints but inventory has {asset_count} assets."
            )
    elif endpoint_match and asset_count == 0:
        issues.append(
            f"Readiness summary references {endpoint_match.group(1)} endpoints but assets list is empty."
        )

    if priorities and backlog_count == 0:
        issues.append(
            f"Executive summary lists {len(priorities)} priorities but remediation backlog is empty."
        )
    elif priorities and backlog_count < len(priorities):
        issues.append(
            f"Remediation backlog ({backlog_count}) has fewer items than top priorities ({len(priorities)})."
        )

    if asset_count > 0:
        vuln_exec = sum(
            1
            for a in report.assets
            if a.vulnerability.status in {"at-risk", "broken"} and not a.pqc_ready
        )
        exec_text = _executive_asset_counts(report)
        if exec_text and exec_text.get("vuln") != vuln_exec:
            issues.append(
                f"Executive narrative cites {exec_text.get('vuln')} vulnerable assets "
                f"but inventory counts {vuln_exec}."
            )

    sb = report.scoreboard_summary or {}
    qtangl = sb.get("qtangl") or {}
    wall = float(qtangl.get("scan_wall_time_seconds") or qtangl.get("scanWallTimeSeconds") or 0)
    if wall > 86400 * 30:
        issues.append(f"Scoreboard Qtangl wall time ({wall:.0f}s) is not human-readable.")

    handshake = report.handshake_proof
    if handshake and handshake.mode == "fixture" and strict:
        if report.target_domain and "openquantumsafe" not in handshake.server:
            issues.append(
                "Fixture handshake appendix present for non-demo target; omit or add disclaimer."
            )

    return issues


def _executive_asset_counts(report: MigrationReport) -> dict[str, int] | None:
    total = len(report.assets)
    if total == 0:
        return None
    vuln = sum(
        1
        for asset in report.assets
        if asset.vulnerability.status in {"at-risk", "broken"} and not asset.pqc_ready
    )
    pqc_ready = sum(1 for asset in report.assets if asset.pqc_ready)
    return {"total": total, "vuln": vuln, "pqc_ready": pqc_ready}


def coherence_http_headers(issues: list[str]) -> dict[str, str]:
    if not issues:
        return {}
    joined = "; ".join(issues[:5])
    if len(issues) > 5:
        joined += f" (+{len(issues) - 5} more)"
    return {"X-Qtangl-Report-Invalid-Reason": joined[:500]}
