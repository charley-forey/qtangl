"""GRC framework posture mapping."""

from __future__ import annotations

from typing import Any

FRAMEWORKS = {
    "nist-csf": ["Identify", "Protect", "Detect", "Respond", "Recover"],
    "eu-pqc": ["Inventory", "Risk assessment", "Migration plan", "Verification"],
    "pci-dss": ["Crypto inventory", "Key management", "Monitoring"],
}


def map_scan_to_frameworks(*, report: dict[str, Any]) -> dict[str, Any]:
    score = float(report.get("readinessScore", 0))
    return {
        framework: {
            "coveragePct": min(100, round(score * 0.9 + 5 * index, 1)),
            "gaps": max(0, 5 - index) if score < 70 else 0,
        }
        for index, framework in enumerate(FRAMEWORKS)
    }
