from __future__ import annotations

import csv
import json
import os
from pathlib import Path
from typing import Any

from app.pqc.models import (
    CryptoAsset,
    HandshakeProof,
    ManualBaseline,
    PqcDataset,
    QuantumVulnerability,
    ScanScenario,
    ScanTarget,
)
from app.pqc.standards import default_standards
from app.pqc.vulnerability import classify_algorithm, vulnerability_dict

MODULE_DIR = Path(__file__).resolve().parent
BACKEND_FIXTURES_DIR = MODULE_DIR / "fixtures"


def _candidate_data_dirs() -> list[Path]:
    configured = os.getenv("QTANGL_PQC_DATA_DIR")
    candidates: list[Path] = []
    if configured:
        candidates.append(Path(configured))
    current = Path(__file__).resolve()
    for parent in current.parents:
        candidates.append(parent / "demos" / "pqc_migration" / "data")
    candidates.append(BACKEND_FIXTURES_DIR)
    return candidates


def _resolve_data_dir() -> Path:
    for candidate in _candidate_data_dirs():
        if (candidate / "inventory.json").exists():
            return candidate
    return BACKEND_FIXTURES_DIR


def get_data_dir() -> Path:
    return _resolve_data_dir()


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _build_vulnerability(payload: dict[str, Any]) -> QuantumVulnerability:
    return QuantumVulnerability(
        algorithm=payload["algorithm"],
        key_size=payload.get("keySize"),
        shor_logical_qubits=payload.get("shorLogicalQubits"),
        classical_security_bits=payload.get("classicalSecurityBits"),
        status=payload.get("status", "unknown"),
        hndl_exposed=bool(payload.get("hndlExposed", False)),
        pqc_replacement=payload.get("pqcReplacement", ""),
        severity=payload.get("severity", "medium"),
        summary=payload.get("summary", ""),
    )


def _build_asset(payload: dict[str, Any]) -> CryptoAsset:
    vuln_payload = payload.get("vulnerability")
    if vuln_payload:
        vulnerability = _build_vulnerability(vuln_payload)
    else:
        vulnerability = classify_algorithm(
            payload.get("algorithm", "unknown"),
            key_size=payload.get("keySize"),
            context=payload.get("kind", "tls"),
        )
    return CryptoAsset(
        id=payload["id"],
        kind=payload.get("kind", "tls"),
        host=payload.get("host", ""),
        port=payload.get("port"),
        label=payload.get("label", payload["id"]),
        algorithm=payload.get("algorithm", vulnerability.algorithm),
        key_size=payload.get("keySize", vulnerability.key_size),
        validity_days=payload.get("validityDays"),
        san_domains=list(payload.get("sanDomains", [])),
        negotiated_cipher=payload.get("negotiatedCipher"),
        negotiated_group=payload.get("negotiatedGroup"),
        tls_version=payload.get("tlsVersion"),
        vulnerability=vulnerability,
        hndl_verdict=payload.get("hndlVerdict", ""),
        already_too_late=bool(payload.get("alreadyTooLate", False)),
        mosca_priority=float(payload.get("moscaPriority", 0)),
        standards_refs=list(payload.get("standardsRefs", [])),
        metadata={
            key: value
            for key, value in payload.items()
            if key
            not in {
                "id",
                "kind",
                "host",
                "port",
                "label",
                "algorithm",
                "keySize",
                "validityDays",
                "sanDomains",
                "negotiatedCipher",
                "negotiatedGroup",
                "tlsVersion",
                "vulnerability",
                "hndlVerdict",
                "alreadyTooLate",
                "moscaPriority",
                "standardsRefs",
            }
        },
    )


def _build_target(payload: dict[str, Any]) -> ScanTarget:
    return ScanTarget(
        domain=payload["domain"],
        ports=[int(port) for port in payload.get("ports", [443])],
        persona=payload.get("persona", "CISO"),
        organization=payload.get("organization", ""),
        mandate=payload.get("mandate", ""),
    )


def _build_scenario(payload: dict[str, Any]) -> ScanScenario:
    manual = payload.get("manualBaseline", {})
    return ScanScenario(
        id=payload["id"],
        title=payload["title"],
        summary=payload["summary"],
        target=_build_target(payload["target"]),
        manual_baseline=ManualBaseline(
            inventory_weeks=int(manual.get("inventoryWeeks", 6)),
            assets_found=int(manual.get("assetsFound", 0)),
            quantum_vulnerable=int(manual.get("quantumVulnerable", 0)),
            readiness_score=float(manual.get("readinessScore", 20)),
            summary=str(manual.get("summary", "")),
        ),
        fixture_asset_ids=list(payload.get("fixtureAssetIds", [])),
    )


def _build_handshake(payload: dict[str, Any]) -> HandshakeProof:
    return HandshakeProof(
        mode=payload.get("mode", "fixture"),
        server=payload.get("server", "test.openquantumsafe.org"),
        port=int(payload.get("port", 4433)),
        tls_version=payload.get("tlsVersion", "TLSv1.3"),
        hybrid_group=payload.get("hybridGroup", "X25519MLKEM768"),
        kem_algorithm=payload.get("kemAlgorithm", "ML-KEM-768"),
        client_hello_hex=payload.get("clientHelloHex", ""),
        named_groups=list(payload.get("namedGroups", [])),
        cipher_suites=list(payload.get("cipherSuites", [])),
        summary=payload.get("summary", ""),
        captured_at=payload.get("capturedAt", ""),
        metadata=dict(payload.get("metadata", {})),
    )


def load_inventory() -> list[CryptoAsset]:
    return [_build_asset(item) for item in _read_json(get_data_dir() / "inventory.json")]


def load_scenarios() -> list[ScanScenario]:
    scenarios_dir = get_data_dir() / "scenarios"
    scenarios: list[ScanScenario] = []
    if scenarios_dir.exists():
        for path in sorted(scenarios_dir.glob("*.json")):
            scenarios.append(_build_scenario(_read_json(path)))
    return scenarios


def load_scenario(scenario_id: str) -> ScanScenario:
    for scenario in load_scenarios():
        if scenario.id == scenario_id:
            return scenario
    raise KeyError(f"Unknown PQC scenario: {scenario_id}")


def load_handshake_trace() -> HandshakeProof:
    path = get_data_dir() / "handshake_trace.json"
    if path.exists():
        return _build_handshake(_read_json(path))
    return _build_handshake(
        {
            "mode": "fixture",
            "server": "test.openquantumsafe.org",
            "port": 4433,
            "hybridGroup": "X25519MLKEM768",
            "summary": "Fixture handshake trace for demo replay.",
        }
    )


def load_deadlines() -> dict[str, Any]:
    path = get_data_dir() / "deadlines.json"
    if path.exists():
        return _read_json(path)
    return {"default": "2030-12-31", "immediate": "Immediate"}


def load_standards() -> dict[str, Any]:
    path = get_data_dir() / "standards.json"
    if path.exists():
        return _read_json(path)
    return default_standards()


def load_risk_assumptions() -> dict[str, Any]:
    path = get_data_dir() / "risk_assumptions.json"
    if path.exists():
        return _read_json(path)
    return {
        "dataShelfLifeYears": 10,
        "migrationTimeYears": 5,
        "yearsToQDay": 12,
    }


def load_remediation_weights() -> dict[str, Any]:
    path = get_data_dir() / "remediation_weights.json"
    if path.exists():
        return _read_json(path)
    return {"effortDays": {"tls": 45, "jwks": 30, "ssh": 21, "email": 60, "default": 30}}


def load_dataset() -> PqcDataset:
    return PqcDataset(
        inventory=load_inventory(),
        scenarios=load_scenarios(),
        handshake_trace=load_handshake_trace(),
        deadlines=load_deadlines(),
        standards=load_standards(),
        risk_assumptions=load_risk_assumptions(),
        remediation_weights=load_remediation_weights(),
    )


def parse_uploaded_bundle_csv(csv_text: str) -> list[dict[str, Any]]:
    reader = csv.DictReader(csv_text.splitlines())
    required = {"host", "port", "kind"}
    if not reader.fieldnames or not required.issubset(set(reader.fieldnames)):
        raise ValueError("Upload CSV must include columns: host, port, kind")
    rows: list[dict[str, Any]] = []
    for row in reader:
        rows.append(
            {
                "host": str(row["host"]).strip(),
                "port": int(row["port"]),
                "kind": str(row.get("kind") or "tls").strip(),
                "label": str(row.get("label") or row["host"]).strip(),
            }
        )
    return rows


def parse_uploaded_bundle_pem(pem_text: str) -> list[dict[str, Any]]:
    blocks = [block.strip() for block in pem_text.split("-----END CERTIFICATE-----") if block.strip()]
    rows: list[dict[str, Any]] = []
    for index, block in enumerate(blocks):
        if "BEGIN CERTIFICATE" not in block:
            block = f"-----BEGIN CERTIFICATE-----\n{block}"
        pem = f"{block}\n-----END CERTIFICATE-----\n"
        try:
            from cryptography import x509
            from cryptography.hazmat.backends import default_backend

            cert = x509.load_pem_x509_certificate(pem.encode("utf-8"), default_backend())
            pub = cert.public_key()
            key_size = getattr(pub, "key_size", None)
            algo = type(pub).__name__.replace("PublicKey", "")
            vuln = classify_algorithm(algo, key_size=key_size, context="tls")
            rows.append(
                {
                    "host": f"uploaded-cert-{index + 1}",
                    "port": None,
                    "kind": "tls",
                    "label": f"Uploaded certificate {index + 1}",
                    "algorithm": vuln.algorithm,
                    "keySize": key_size,
                    "vulnerability": vulnerability_dict(vuln),
                    "pem": pem,
                }
            )
        except Exception as exc:
            rows.append(
                {
                    "host": f"uploaded-cert-{index + 1}",
                    "port": None,
                    "kind": "error",
                    "label": f"Uploaded certificate {index + 1}",
                    "algorithm": "parse-error",
                    "error": str(exc),
                }
            )
    return rows
