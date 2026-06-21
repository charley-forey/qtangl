from __future__ import annotations

from typing import Any

from app.pqc.models import MigrationReport, RemediationItem


def simulate_remediation_scenarios(report: MigrationReport) -> list[dict[str, Any]]:
    """Static what-if scenarios for PDF executive sections."""
    base = float(report.readiness_score)
    backlog = list(report.remediation_backlog)

    def project(items: list[RemediationItem]) -> float:
        if not items:
            return base
        boost = min(35.0, sum(4.0 for item in items if item.severity in {"critical", "high"}) + 2.0 * len(items))
        return round(min(95.0, base + boost), 1)

    top3 = backlog[:3]
    critical = [item for item in backlog if item.severity in {"critical", "high"}]
    scenarios = [
        {"label": "Top 3 backlog items", "items": len(top3), "projectedScore": project(top3)},
        {"label": "All critical/high items", "items": len(critical), "projectedScore": project(critical)},
        {"label": "Full backlog complete", "items": len(backlog), "projectedScore": project(backlog)},
    ]
    for row in scenarios:
        row["delta"] = round(float(row["projectedScore"]) - base, 1)
        row["currentScore"] = base
    return scenarios
