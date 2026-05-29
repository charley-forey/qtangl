from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

AssetKind = Literal[
    "tls",
    "ssh",
    "jwks",
    "email",
    "code_signing",
    "document_signing",
    "discovery",
    "error",
]
VulnStatus = Literal["broken", "at-risk", "safe", "unknown"]
Severity = Literal["critical", "high", "medium", "low", "info"]
ScanJobStatus = Literal["running", "done", "error"]


@dataclass(slots=True)
class QuantumVulnerability:
    algorithm: str
    key_size: int | None
    shor_logical_qubits: int | None
    classical_security_bits: int | None
    status: VulnStatus
    hndl_exposed: bool
    pqc_replacement: str
    severity: Severity
    summary: str


@dataclass(slots=True)
class CryptoAsset:
    id: str
    kind: AssetKind
    host: str
    port: int | None
    label: str
    algorithm: str
    key_size: int | None
    validity_days: int | None
    san_domains: list[str]
    negotiated_cipher: str | None
    negotiated_group: str | None
    tls_version: str | None
    vulnerability: QuantumVulnerability
    hndl_verdict: str
    already_too_late: bool
    mosca_priority: float
    standards_refs: list[str]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class ManualBaseline:
    inventory_weeks: int
    assets_found: int
    quantum_vulnerable: int
    readiness_score: float
    summary: str


@dataclass(slots=True)
class ScanTarget:
    domain: str
    ports: list[int]
    persona: str
    organization: str
    mandate: str


@dataclass(slots=True)
class ScanScenario:
    id: str
    title: str
    summary: str
    target: ScanTarget
    manual_baseline: ManualBaseline
  # fixture asset ids to include when use_fixture
    fixture_asset_ids: list[str] = field(default_factory=list)


@dataclass(slots=True)
class HandshakeProof:
    mode: Literal["live", "replayed", "fixture"]
    server: str
    port: int
    tls_version: str
    hybrid_group: str
    kem_algorithm: str
    client_hello_hex: str
    named_groups: list[str]
    cipher_suites: list[str]
    summary: str
    captured_at: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class RemediationItem:
    id: str
    asset_id: str
    priority: int
    title: str
    action: str
    pqc_algorithm: str
    deadline: str
    effort_days: int
    standards_refs: list[str]
    severity: Severity
    summary: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class ScoreboardColumn:
    label: str
    scan_wall_time_seconds: float
    assets_discovered: int
    quantum_vulnerable: int
    hndl_exposed: int
    readiness_score: float
    remediation_coverage: float
    audit_pack_available: bool
    summary: str


@dataclass(slots=True)
class RiskScoreboard:
    manual: ScoreboardColumn
    qtangl: ScoreboardColumn


@dataclass(slots=True)
class MoscaAssessment:
    data_shelf_life_years: float
    migration_time_years: float
    years_to_q_day: float
    inequality_holds: bool
    summary: str


@dataclass(slots=True)
class TimelineEvent:
    key: str
    label: str
    duration_ms: int
    status: Literal["done", "replayed", "skipped", "running", "error"]


@dataclass(slots=True)
class MigrationReport:
    scan_id: str
    scenario_id: str
    target_domain: str
    generated_at: str
    readiness_score: float
    coverage_confidence: float
    mosca: MoscaAssessment
    assets: list[CryptoAsset]
    remediation_backlog: list[RemediationItem]
    standards_summary: list[dict[str, Any]]
    honesty_notes: list[str]


@dataclass(slots=True)
class PqcDataset:
    inventory: list[CryptoAsset]
    scenarios: list[ScanScenario]
    handshake_trace: HandshakeProof
    deadlines: dict[str, Any]
    standards: dict[str, Any]
    risk_assumptions: dict[str, Any]
    remediation_weights: dict[str, Any]


@dataclass(slots=True)
class ScanBundle:
    scan_id: str
    scenario: ScanScenario
    assets: list[CryptoAsset]
    remediation_backlog: list[RemediationItem]
    scoreboard: RiskScoreboard
    handshake_proof: HandshakeProof
    report: MigrationReport
    mosca: MoscaAssessment
    timeline: list[TimelineEvent]
    details: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class ScanJob:
    scan_id: str
    status: ScanJobStatus
    bundle: ScanBundle | None
    timeline: list[TimelineEvent]
    error: str | None
    created_at: float
    updated_at: float
