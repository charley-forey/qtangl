from __future__ import annotations

import hashlib
import re
from typing import Any

from app.cbom.provenance import NormalizedComponent, Provenance, utc_now_iso
from app.pqc.vulnerability import classify_algorithm

_VENDOR_SOURCE_MAP = {
    "keyfactor": ("third-party", "Keyfactor"),
    "sandboxaq": ("third-party", "SandboxAQ"),
    "ibm": ("third-party", "IBM Quantum Safe"),
    "fortanix": ("third-party", "Fortanix"),
    "qtangl": ("qtangl-scan", "Qtangl scan"),
}


def _props(component: dict[str, Any]) -> dict[str, str]:
    out: dict[str, str] = {}
    for item in component.get("properties") or []:
        if isinstance(item, dict) and "name" in item:
            out[str(item["name"])] = str(item.get("value", ""))
    return out


def _normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.lower().strip())


def infer_source_label(document: dict[str, Any], *, override: str | None = None) -> tuple[str, str]:
    if override:
        return "third-party", override
    tools = (document.get("metadata") or {}).get("tools") or []
    for tool in tools:
        if not isinstance(tool, dict):
            continue
        vendor = str(tool.get("vendor", "")).lower()
        name = str(tool.get("name", "")).lower()
        for key, (stype, label) in _VENDOR_SOURCE_MAP.items():
            if key in vendor or key in name:
                return stype, label
    props = {
        item["name"]: item["value"]
        for item in (document.get("metadata") or {}).get("properties", [])
        if isinstance(item, dict) and "name" in item
    }
    if props.get("qtangl:scanId"):
        return "qtangl-scan", "Qtangl scan export"
    return "third-party", "External CBOM upload"


def extract_algorithm(component: dict[str, Any], props: dict[str, str]) -> tuple[str, int | None]:
    if props.get("qtangl:algorithm"):
        alg = props["qtangl:algorithm"]
        ks = props.get("qtangl:keySize")
        return alg, int(ks) if ks and ks.isdigit() else None

    crypto = component.get("cryptoProperties") or {}
    if isinstance(crypto, dict):
        asset_type = crypto.get("assetType", "")
        if asset_type == "certificate":
            cert = crypto.get("certificateProperties") or {}
            sig = str(cert.get("signatureAlgorithm") or cert.get("subjectPublicKeyAlgorithm") or "")
            if sig:
                return sig, None
        related = crypto.get("relatedCryptoMaterialProperties") or {}
        if isinstance(related, dict):
            alg = str(related.get("algorithm") or related.get("algorithmRef") or "")
            if alg:
                return alg, None

    version = component.get("version")
    if isinstance(version, str) and version:
        return version, None
    return component.get("name", "unknown"), None


def extract_location(component: dict[str, Any], props: dict[str, str]) -> tuple[str, str, str]:
    host = props.get("qtangl:host") or props.get("location") or ""
    kind = props.get("qtangl:kind") or "imported"
    if not host:
        crypto = component.get("cryptoProperties") or {}
        cert = (crypto.get("certificateProperties") or {}) if isinstance(crypto, dict) else {}
        host = str(cert.get("subjectName") or cert.get("issuerName") or "")
    location = host or component.get("name", "")
    return location, host or location, kind


def component_dedupe_key(component: NormalizedComponent) -> str:
    name = _normalize_name(component.name)
    alg = _normalize_name(component.algorithm)
    if component.bom_ref:
        raw = f"bomref:{component.bom_ref}"
    else:
        raw = f"{name}|{component.component_type}|{alg}|{component.location}"
    return hashlib.sha256(raw.encode()).hexdigest()


def parse_cyclonedx_document(
    document: dict[str, Any],
    *,
    source_id: str,
    source_type: str,
    source_label: str,
    source_method: str = "cbom-upload",
    verification_status: str = "unverified-source",
) -> list[NormalizedComponent]:
    ingested_at = utc_now_iso()
    provenance = Provenance(
        source_id=source_id,
        source_type=source_type,  # type: ignore[arg-type]
        source_label=source_label,
        source_method=source_method,
        ingested_at=ingested_at,
        verification_status=verification_status,  # type: ignore[arg-type]
    )
    results: list[NormalizedComponent] = []
    for index, component in enumerate(document.get("components") or []):
        if not isinstance(component, dict):
            continue
        props = _props(component)
        algorithm, key_size = extract_algorithm(component, props)
        vuln = classify_algorithm(algorithm, key_size=key_size)
        location, host, kind = extract_location(component, props)
        name = str(component.get("name") or component.get("bom-ref") or f"component-{index}")
        bom_ref = str(component.get("bom-ref") or f"import:{source_id}:{index}")
        ctype = str(component.get("type") or "cryptographic-asset")
        if props.get("qtangl:vulnerabilityStatus"):
            vuln_status = props["qtangl:vulnerabilityStatus"]
        else:
            vuln_status = vuln.status
        severity = props.get("qtangl:severity") or vuln.severity
        pqc = props.get("qtangl:pqcReplacement") or vuln.pqc_replacement
        results.append(
            NormalizedComponent(
                bom_ref=bom_ref,
                name=name,
                component_type=ctype,
                algorithm=algorithm,
                key_size=key_size,
                location=location,
                host=host,
                kind=kind,
                vulnerability_status=vuln_status,
                severity=severity,
                pqc_replacement=pqc,
                raw=component,
                provenance=provenance,
            )
        )
    return results


def normalized_from_crypto_asset(asset_dict: dict[str, Any], *, source_id: str, scan_id: str) -> NormalizedComponent:
    vuln = asset_dict.get("vulnerability") or {}
    provenance = Provenance(
        source_id=source_id,
        source_type="qtangl-scan",
        source_label="Qtangl agentless scan",
        source_method="qtangl-scan",
        ingested_at=utc_now_iso(),
        verification_status="verified",
    )
    return NormalizedComponent(
        bom_ref=f"qtangl:asset:{asset_dict.get('id', '')}",
        name=str(asset_dict.get("label") or asset_dict.get("id")),
        component_type="cryptographic-asset",
        algorithm=str(asset_dict.get("algorithm") or "unknown"),
        key_size=asset_dict.get("keySize"),
        location=str(asset_dict.get("host") or ""),
        host=str(asset_dict.get("host") or ""),
        kind=str(asset_dict.get("kind") or "tls"),
        vulnerability_status=str(vuln.get("status") or "unknown"),
        severity=str(vuln.get("severity") or "info"),
        pqc_replacement=str(vuln.get("pqcReplacement") or ""),
        raw=asset_dict,
        provenance=provenance,
    )
