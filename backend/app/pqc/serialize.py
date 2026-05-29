from __future__ import annotations

from dataclasses import asdict
from typing import Any

from app.pqc.models import (
    CryptoAsset,
    HandshakeProof,
    MigrationReport,
    MoscaAssessment,
    RemediationItem,
    RiskScoreboard,
    ScanBundle,
    ScanScenario,
    TimelineEvent,
)
from app.pqc.vulnerability import vulnerability_dict


def serialize_asset(asset: CryptoAsset) -> dict[str, Any]:
    payload = asdict(asset)
    payload["vulnerability"] = vulnerability_dict(asset.vulnerability)
    return payload


def serialize_scenario(scenario: ScanScenario) -> dict[str, Any]:
    payload = asdict(scenario)
    payload["target"] = asdict(scenario.target)
    payload["manualBaseline"] = asdict(scenario.manual_baseline)
    return payload


def serialize_handshake(proof: HandshakeProof) -> dict[str, Any]:
    return asdict(proof)


def serialize_scoreboard(scoreboard: RiskScoreboard) -> dict[str, Any]:
    return {
        "manual": asdict(scoreboard.manual),
        "qtangl": asdict(scoreboard.qtangl),
    }


def serialize_remediation(item: RemediationItem) -> dict[str, Any]:
    return asdict(item)


def serialize_mosca(mosca: MoscaAssessment) -> dict[str, Any]:
    return asdict(mosca)


def serialize_timeline(events: list[TimelineEvent]) -> list[dict[str, Any]]:
    return [asdict(event) for event in events]


def serialize_report(report: MigrationReport) -> dict[str, Any]:
    from app.pqc.report import report_to_json

    return report_to_json(report)


def serialize_bundle(bundle: ScanBundle) -> dict[str, Any]:
    return {
        "scanId": bundle.scan_id,
        "scenario": serialize_scenario(bundle.scenario),
        "assets": [serialize_asset(asset) for asset in bundle.assets],
        "remediationBacklog": [serialize_remediation(item) for item in bundle.remediation_backlog],
        "scoreboard": serialize_scoreboard(bundle.scoreboard),
        "handshakeProof": serialize_handshake(bundle.handshake_proof),
        "report": serialize_report(bundle.report),
        "mosca": serialize_mosca(bundle.mosca),
        "timeline": serialize_timeline(bundle.timeline),
        "details": bundle.details,
    }
