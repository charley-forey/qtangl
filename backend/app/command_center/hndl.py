"""Harvest-now-decrypt-later exposure scoring for Command Center."""

from __future__ import annotations

from typing import Any

from app.command_center.schemas import HndlAssetExposure, HndlExposureResponse
from app.pqc.models import MigrationReport


def _band(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "elevated"
    if score >= 25:
        return "moderate"
    return "low"


def _score_asset(asset: Any) -> float:
    vuln = asset.vulnerability
    score = 0.0
    if vuln.hndl_exposed:
        score += 40
    if vuln.status == "broken":
        score += 30
    elif vuln.status == "at-risk":
        score += 15
    sev = str(vuln.severity or "").lower()
    if sev == "critical":
        score += 25
    elif sev == "high":
        score += 15
    elif sev == "medium":
        score += 8
    if getattr(asset, "already_too_late", False):
        score += 20
    algo = (asset.algorithm or "").upper()
    if "RSA" in algo or "ECDSA" in algo or "ECDH" in algo:
        score += 10
    return min(100.0, score)


def build_hndl_exposure(
    *,
    report: MigrationReport,
    scan_id: str | None = None,
    limit: int = 200,
) -> HndlExposureResponse:
    items: list[HndlAssetExposure] = []
    for asset in report.assets:
        score = _score_asset(asset)
        items.append(
            HndlAssetExposure(
                assetId=asset.id,
                host=asset.host or None,
                algorithm=asset.algorithm or None,
                exposureScore=round(score, 1),
                exposureBand=_band(score),  # type: ignore[arg-type]
                hndlExposed=bool(asset.vulnerability.hndl_exposed),
                forwardSecrecy=bool(asset.metadata.get("forwardSecrecy")) if asset.metadata else None,
                dataSensitivity=str(asset.metadata.get("dataClass") or asset.metadata.get("dataSensitivity") or "") or None,
                verdict=asset.hndl_verdict or asset.vulnerability.summary or None,
            )
        )
    items.sort(key=lambda x: x.exposureScore, reverse=True)
    exposed = sum(1 for i in items if i.hndlExposed)
    return HndlExposureResponse(
        scanId=scan_id,
        totalAssets=len(items),
        exposedCount=exposed,
        items=items[:limit],
        assumptions=[
            "Scores weight long-lived asymmetric keys and HNDL flags from inventory.",
            "This quantifies exposure window — not when a quantum computer breaks cryptography.",
        ],
    )
