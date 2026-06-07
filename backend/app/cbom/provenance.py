from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Literal

VerificationStatus = Literal["verified", "imported", "unverified-source"]
SourceType = Literal["qtangl-scan", "third-party", "upload", "manual"]


@dataclass(slots=True)
class Provenance:
    source_id: str
    source_type: SourceType
    source_label: str
    source_method: str
    ingested_at: str
    verification_status: VerificationStatus

    def to_dict(self) -> dict[str, Any]:
        return {
            "sourceId": self.source_id,
            "sourceType": self.source_type,
            "sourceLabel": self.source_label,
            "sourceMethod": self.source_method,
            "ingestedAt": self.ingested_at,
            "verificationStatus": self.verification_status,
        }

    def cyclonedx_properties(self) -> list[dict[str, str]]:
        d = self.to_dict()
        return [
            {"name": "qtangl:sourceId", "value": d["sourceId"]},
            {"name": "qtangl:sourceType", "value": d["sourceType"]},
            {"name": "qtangl:sourceLabel", "value": d["sourceLabel"]},
            {"name": "qtangl:sourceMethod", "value": d["sourceMethod"]},
            {"name": "qtangl:verificationStatus", "value": d["verificationStatus"]},
            {"name": "qtangl:ingestedAt", "value": d["ingestedAt"]},
        ]


@dataclass(slots=True)
class NormalizedComponent:
    bom_ref: str
    name: str
    component_type: str
    algorithm: str
    key_size: int | None
    location: str
    host: str
    kind: str
    vulnerability_status: str
    severity: str
    pqc_replacement: str
    raw: dict[str, Any] = field(default_factory=dict)
    provenance: Provenance | None = None

    def dedupe_fields(self) -> dict[str, Any]:
        return {
            "algorithm": self.algorithm.lower().strip(),
            "keySize": self.key_size,
            "vulnerabilityStatus": self.vulnerability_status,
        }


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
