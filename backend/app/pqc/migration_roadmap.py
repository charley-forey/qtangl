from __future__ import annotations

from typing import Any

from app.pqc.models import CryptoAsset, RemediationItem


def build_migration_roadmap(
    assets: list[CryptoAsset],
    backlog: list[RemediationItem],
    deadlines: dict[str, Any],
) -> list[dict[str, Any]]:
    """Data-driven migration timeline from findings + remediation deadlines."""
    milestones: list[dict[str, Any]] = []
    seen: set[str] = set()

    for item in backlog[:12]:
        deadline = item.deadline or str(deadlines.get("default", "2030"))
        key = f"{deadline}:{item.title[:40]}"
        if key in seen:
            continue
        seen.add(key)
        milestones.append(
            {
                "label": item.title,
                "deadline": deadline,
                "severity": item.severity,
                "effortDays": item.effort_days,
                "pqcAlgorithm": item.pqc_algorithm,
            }
        )

    for ref_id, label in (
        ("nist-ir-8547", "NIST IR 8547 transition"),
        ("cnsa-2.0", "CNSA 2.0"),
        ("nsm-10", "NSM-10"),
    ):
        deadline = str(deadlines.get(ref_id, deadlines.get("default", "2030")))
        if ref_id not in seen:
            milestones.append({"label": label, "deadline": deadline, "severity": "info", "framework": ref_id})
            seen.add(ref_id)

    hndl_count = sum(1 for a in assets if a.vulnerability.hndl_exposed)
    if hndl_count:
        milestones.insert(
            0,
            {
                "label": f"Prioritize {hndl_count} HNDL-exposed asset(s)",
                "deadline": "Immediate",
                "severity": "critical",
            },
        )

    return milestones[:15]
