from __future__ import annotations

import json
from dataclasses import asdict
from typing import Any

from app.cbom.adapter import component_dedupe_key, parse_cyclonedx_document
from app.cbom.provenance import NormalizedComponent, Provenance, utc_now_iso
from app.pqc.cbom import CBOM_FORMAT, CBOM_SCHEMA_ID
from app.pqc.models import CryptoAsset, QuantumVulnerability
from app.pqc.risk import readiness_assessment
from app.pqc.vulnerability import classify_algorithm

CONFLICT_FIELDS = ("algorithm", "keySize", "vulnerabilityStatus")


def detect_conflicts(
    existing: NormalizedComponent,
    incoming: NormalizedComponent,
) -> list[dict[str, Any]]:
    conflicts: list[dict[str, Any]] = []
    for field in CONFLICT_FIELDS:
        a = existing.dedupe_fields().get(field if field != "keySize" else "keySize")
        b = incoming.dedupe_fields().get(field if field != "keySize" else "keySize")
        if a != b:
            conflicts.append(
                {
                    "field": field,
                    "valueA": a,
                    "valueB": b,
                    "sourceA": existing.provenance.source_id if existing.provenance else "",
                    "sourceB": incoming.provenance.source_id if incoming.provenance else "",
                }
            )
    return conflicts


def component_to_crypto_asset(component: NormalizedComponent) -> CryptoAsset:
    vuln = classify_algorithm(component.algorithm, key_size=component.key_size)
    if component.vulnerability_status in {"broken", "at-risk", "safe", "unknown"}:
        vuln = QuantumVulnerability(
            algorithm=component.algorithm,
            key_size=component.key_size,
            shor_logical_qubits=vuln.shor_logical_qubits,
            classical_security_bits=vuln.classical_security_bits,
            status=component.vulnerability_status,  # type: ignore[arg-type]
            hndl_exposed=vuln.hndl_exposed,
            pqc_replacement=component.pqc_replacement or vuln.pqc_replacement,
            severity=component.severity if component.severity in {"critical", "high", "medium", "low", "info"} else vuln.severity,  # type: ignore[arg-type]
            summary=vuln.summary,
        )
    asset_id = component.bom_ref.replace(":", "-")[:80]
    return CryptoAsset(
        id=asset_id,
        kind=component.kind if component.kind in {"tls", "jwks", "ssh", "email", "upload", "error", "imported"} else "imported",  # type: ignore[arg-type]
        host=component.host or component.location,
        port=None,
        label=component.name,
        algorithm=component.algorithm,
        key_size=component.key_size,
        validity_days=None,
        san_domains=[],
        negotiated_cipher=None,
        negotiated_group=None,
        tls_version=None,
        vulnerability=vuln,
        hndl_verdict="exposed" if vuln.hndl_exposed else "not-exposed",
        already_too_late=False,
        mosca_priority=50.0,
        standards_refs=[],
        pqc_ready=vuln.status == "safe",
        metadata={"verificationStatus": component.provenance.verification_status if component.provenance else "unverified-source"},
    )


def aggregated_readiness(components: list[NormalizedComponent]) -> dict[str, Any]:
    assets = [component_to_crypto_asset(c) for c in components]
    base = readiness_assessment(assets)
    total = len(components)
    if total == 0:
        return {
            **base,
            "label": "Aggregated CBOM (no components)",
            "coverageConfidence": 0.0,
            "verifiedCount": 0,
            "importedCount": 0,
            "unverifiedCount": 0,
        }
    verified = sum(1 for c in components if c.provenance and c.provenance.verification_status == "verified")
    imported = sum(1 for c in components if c.provenance and c.provenance.verification_status == "imported")
    unverified = total - verified - imported
    verified_pct = round(100.0 * verified / total, 1)
    coverage = round(min(95.0, 40.0 + verified_pct * 0.55 + imported * 0.3), 1)
    if unverified > 0:
        coverage = round(coverage * (verified + imported) / total if total else 0, 1)
    return {
        **base,
        "label": "Aggregated CBOM readiness (includes unverified-source data where noted)",
        "coverageConfidence": coverage,
        "verifiedCount": verified,
        "importedCount": imported,
        "unverifiedCount": unverified,
        "verifiedPct": verified_pct,
    }


def export_aggregate_cbom(
    components: list[NormalizedComponent],
    *,
    tenant_id: str,
    spec_version: str = "1.6",
) -> dict[str, Any]:
    cdx_components: list[dict[str, Any]] = []
    for comp in sorted(components, key=lambda c: c.bom_ref):
        props = []
        if comp.provenance:
            props.extend(comp.provenance.cyclonedx_properties())
        props.extend(
            [
                {"name": "qtangl:algorithm", "value": comp.algorithm},
                {"name": "qtangl:keySize", "value": str(comp.key_size or "")},
                {"name": "qtangl:vulnerabilityStatus", "value": comp.vulnerability_status},
                {"name": "qtangl:severity", "value": comp.severity},
                {"name": "qtangl:pqcReplacement", "value": comp.pqc_replacement},
                {"name": "qtangl:host", "value": comp.host},
                {"name": "qtangl:kind", "value": comp.kind},
            ]
        )
        cdx_components.append(
            {
                "type": "cryptographic-asset",
                "bom-ref": comp.bom_ref,
                "name": comp.name,
                "version": comp.algorithm,
                "properties": props,
            }
        )
    return {
        "bomFormat": CBOM_FORMAT,
        "specVersion": spec_version,
        "serialNumber": f"urn:uuid:qtangl-aggregate-{tenant_id}",
        "version": 1,
        "metadata": {
            "timestamp": utc_now_iso(),
            "tools": [{"vendor": "Qtangl", "name": "cbom-aggregator", "version": "0.1.0"}],
            "properties": [
                {"name": "qtangl:cbomSchemaId", "value": CBOM_SCHEMA_ID},
                {"name": "qtangl:tenantId", "value": tenant_id},
                {"name": "qtangl:aggregate", "value": "true"},
            ],
        },
        "components": cdx_components,
    }


def row_to_normalized(row: Any) -> NormalizedComponent:
    provenance = None
    if row.provenance_json:
        data = json.loads(row.provenance_json)
        provenance = Provenance(
            source_id=data["sourceId"],
            source_type=data["sourceType"],
            source_label=data["sourceLabel"],
            source_method=data["sourceMethod"],
            ingested_at=data["ingestedAt"],
            verification_status=data["verificationStatus"],
        )
    raw = json.loads(row.component_json) if row.component_json else {}
    return NormalizedComponent(
        bom_ref=row.bom_ref,
        name=row.name,
        component_type=row.component_type,
        algorithm=row.algorithm,
        key_size=row.key_size,
        location=row.location,
        host=row.host,
        kind=row.kind,
        vulnerability_status=row.vulnerability_status,
        severity=row.severity,
        pqc_replacement=row.pqc_replacement,
        raw=raw,
        provenance=provenance,
    )


def normalized_to_row_fields(component: NormalizedComponent, *, tenant_id: str, source_id: str, ingest_job_id: str) -> dict[str, Any]:
    key = component_dedupe_key(component)
    prov = component.provenance.to_dict() if component.provenance else {}
    return {
        "tenant_id": tenant_id,
        "component_key": key,
        "bom_ref": component.bom_ref,
        "name": component.name,
        "component_type": component.component_type,
        "algorithm": component.algorithm,
        "key_size": component.key_size,
        "location": component.location,
        "host": component.host,
        "kind": component.kind,
        "vulnerability_status": component.vulnerability_status,
        "severity": component.severity,
        "pqc_replacement": component.pqc_replacement,
        "verification_status": prov.get("verificationStatus", "unverified-source"),
        "provenance_json": json.dumps(prov),
        "source_id": source_id,
        "ingest_job_id": ingest_job_id,
        "component_json": json.dumps(component.raw),
    }
