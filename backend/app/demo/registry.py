from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

AssetKind = Literal["tls", "jwks", "ssh", "db_tls", "email", "code_signing"]
Posture = Literal["classical", "hybrid", "pqc"]
ComplianceTarget = Literal["nist-ir-8547", "pci-dss", "cmmc", "general"]
ActiveEvent = Literal["cert_expiry", "downgrade", "key_reuse", "harvested", "none"]

POSTURES: tuple[Posture, ...] = ("classical", "hybrid", "pqc")
COMPLIANCE_TARGETS: tuple[ComplianceTarget, ...] = ("nist-ir-8547", "pci-dss", "cmmc", "general")
ASSET_KINDS: tuple[AssetKind, ...] = ("tls", "jwks", "ssh", "db_tls", "email", "code_signing")


@dataclass(slots=True)
class DemoResource:
    id: str
    label: str
    kind: AssetKind
    host: str
    port: int | None
    business_unit: str
    posture: Posture
    compliance_target: ComplianceTarget
    enabled: bool = True
    active_events: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "kind": self.kind,
            "host": self.host,
            "port": self.port,
            "businessUnit": self.business_unit,
            "posture": self.posture,
            "complianceTarget": self.compliance_target,
            "enabled": self.enabled,
            "activeEvents": list(self.active_events),
        }

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> DemoResource:
        return cls(
            id=str(payload["id"]),
            label=str(payload.get("label") or payload["id"]),
            kind=payload.get("kind", "tls"),  # type: ignore[arg-type]
            host=str(payload.get("host", "")),
            port=int(payload["port"]) if payload.get("port") is not None else None,
            business_unit=str(payload.get("businessUnit") or payload.get("business_unit") or "default"),
            posture=payload.get("posture", "classical"),  # type: ignore[arg-type]
            compliance_target=payload.get("complianceTarget") or payload.get("compliance_target") or "general",  # type: ignore[arg-type]
            enabled=bool(payload.get("enabled", True)),
            active_events=list(payload.get("activeEvents") or payload.get("active_events") or []),
        )


def posture_crypto(*, kind: AssetKind, posture: Posture) -> dict[str, Any]:
    """Map posture to concrete crypto fields for uploaded_rows."""
    if posture == "pqc":
        if kind in {"tls", "db_tls", "email"}:
            return {
                "algorithm": "ML-KEM-768",
                "keySize": 768,
                "negotiatedGroup": "mlkem768",
                "negotiatedCipher": "TLS_AES_256_GCM_SHA384",
                "tlsVersion": "TLSv1.3",
                "pqcReady": True,
            }
        if kind == "jwks":
            return {"algorithm": "ML-DSA-65", "keySize": 65, "pqcReady": True}
        if kind == "code_signing":
            return {"algorithm": "ML-DSA-65", "keySize": 65, "pqcReady": True}
        return {"algorithm": "ML-KEM-768", "keySize": 768, "pqcReady": True}

    if posture == "hybrid":
        return {
            "algorithm": "X25519MLKEM768",
            "keySize": 768,
            "negotiatedGroup": "x25519mlkem768",
            "negotiatedCipher": "TLS_AES_256_GCM_SHA384",
            "tlsVersion": "TLSv1.3",
            "pqcReady": True,
        }

    # classical
    if kind in {"jwks", "code_signing"}:
        return {"algorithm": "RS256", "keySize": 2048, "pqcReady": False}
    if kind == "ssh":
        return {"algorithm": "ECDSA-P256", "keySize": 256, "pqcReady": False}
    return {
        "algorithm": "RSA-2048",
        "keySize": 2048,
        "negotiatedCipher": "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
        "negotiatedGroup": "secp256r1",
        "tlsVersion": "TLSv1.2",
        "pqcReady": False,
    }


def apply_events_to_row(row: dict[str, Any], events: list[str]) -> dict[str, Any]:
    """Apply transient adversary events to an uploaded_rows payload."""
    payload = dict(row)
    if "cert_expiry" in events:
        payload["validityDays"] = 7
    if "downgrade" in events:
        payload["algorithm"] = "RSA-1024"
        payload["keySize"] = 1024
        payload["pqcReady"] = False
    if "key_reuse" in events:
        payload["metadata"] = {**(payload.get("metadata") or {}), "keyReusePeers": ["peer-shared-spki"]}
    if "harvested" in events:
        payload["metadata"] = {**(payload.get("metadata") or {}), "hndlHarvested": True}
    return payload


def resource_to_uploaded_row(resource: DemoResource) -> dict[str, Any]:
    crypto = posture_crypto(kind=resource.kind, posture=resource.posture)
    row: dict[str, Any] = {
        "id": resource.id,
        "kind": resource.kind,
        "host": resource.host,
        "port": resource.port,
        "label": resource.label,
        **crypto,
        "metadata": {"businessUnit": resource.business_unit, "complianceTarget": resource.compliance_target},
    }
    if resource.active_events:
        row = apply_events_to_row(row, resource.active_events)
    return row
