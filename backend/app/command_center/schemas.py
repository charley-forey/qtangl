"""OpenAPI-first Pydantic contracts for Command Center Next Wave endpoints."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import AfterValidator, BaseModel, Field, model_validator


# --- Scan dependency graph ---


class GraphNode(BaseModel):
    id: str
    label: str
    kind: Literal["host", "service", "cert", "algorithm"]
    quantumVulnerable: bool = False
    severity: str | None = None
    drillTarget: str | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    kind: str = "depends_on"


class ScanGraphResponse(BaseModel):
    scanId: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    nodeCount: int
    truncated: bool = False
    assumptions: list[str] = Field(default_factory=list)


# --- HNDL exposure ---


class HndlAssetExposure(BaseModel):
    assetId: str
    host: str | None = None
    algorithm: str | None = None
    exposureScore: float
    exposureBand: Literal["low", "moderate", "elevated", "critical"]
    hndlExposed: bool
    forwardSecrecy: bool | None = None
    dataSensitivity: str | None = None
    verdict: str | None = None


class HndlExposureResponse(BaseModel):
    scanId: str | None = None
    totalAssets: int
    exposedCount: int
    items: list[HndlAssetExposure]
    framing: str = (
        "Exposure window quantification based on long-lived secrets and algorithm class — "
        "not a prediction of when cryptography breaks."
    )
    assumptions: list[str] = Field(default_factory=list)


# --- Finding comments ---


class FindingCommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=8000)
    mentions: list[str] = Field(default_factory=list, max_length=20)


class FindingComment(BaseModel):
    id: str
    findingId: str
    scanId: str | None = None
    author: str
    body: str
    mentions: list[str] = Field(default_factory=list)
    createdAt: str
    updatedAt: str | None = None


class FindingCommentListResponse(BaseModel):
    findingId: str
    comments: list[FindingComment]
    total: int


# --- Saved views ---


class SavedViewFilters(BaseModel):
    tab: str | None = None
    severity: str | None = None
    businessUnit: str | None = None
    scanSource: str | None = None
    query: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)


class SavedViewCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    persona: str | None = None
    filters: SavedViewFilters


class SavedView(SavedViewCreate):
    id: str
    createdAt: str
    updatedAt: str


class SavedViewListResponse(BaseModel):
    views: list[SavedView]


# --- Assignment inbox ---


class InboxItem(BaseModel):
    id: str
    kind: Literal["remediation", "alert", "scan"]
    title: str
    status: str | None = None
    owner: str | None = None
    dueAt: str | None = None
    deepLink: str | None = None
    severity: str | None = None


class InboxResponse(BaseModel):
    owner: str
    items: list[InboxItem]
    total: int


# --- War room ---


class WarRoomCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    alertIds: list[str] = Field(default_factory=list, max_length=50)
    assignees: list[str] = Field(default_factory=list, max_length=20)


class WarRoom(BaseModel):
    id: str
    title: str
    status: Literal["active", "resolved"]
    alertIds: list[str]
    assignees: list[str]
    shareToken: str | None = None
    createdAt: str
    updatedAt: str


# --- AI ---


class AiQueryRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    persona: str = "operator"


class AiCitation(BaseModel):
    kind: str
    ref: str
    label: str


class AiQueryResponse(BaseModel):
    answer: str
    intent: str
    filters: dict[str, Any] = Field(default_factory=dict)
    citations: list[AiCitation] = Field(default_factory=list)
    confidence: Literal["low", "medium", "high"] = "medium"
    assumptions: list[str] = Field(default_factory=list)
    guardrailPassed: bool = True


class ExecutiveNarrativeResponse(BaseModel):
    narrative: str
    citations: list[AiCitation] = Field(default_factory=list)
    confidence: Literal["low", "medium", "high"] = "medium"
    assumptions: list[str] = Field(default_factory=list)


class RemediationPrDraftRequest(BaseModel):
    remediationId: str
    scanId: str


class RemediationPrDraftResponse(BaseModel):
    remediationId: str
    title: str
    description: str
    files: list[dict[str, str]] = Field(default_factory=list)
    checklist: list[str] = Field(default_factory=list)


class AgenticPlanStep(BaseModel):
    id: str
    label: str
    status: Literal["pending", "approved", "completed", "skipped"] = "pending"
    requiresApproval: bool = True


class AgenticPlanResponse(BaseModel):
    remediationId: str
    steps: list[AgenticPlanStep]
    assumptions: list[str] = Field(default_factory=list)


# --- Correlation / incidents ---


class CorrelatedIncident(BaseModel):
    id: str
    title: str
    alertIds: list[str]
    correlationKeys: list[str]
    severity: str
    summary: str
    createdAt: str


class CorrelatedIncidentsResponse(BaseModel):
    incidents: list[CorrelatedIncident]


# --- Cadence ---


class CadenceRecommendation(BaseModel):
    currentCadenceHours: int | None = None
    recommendedCadenceHours: int
    volatilityScore: float
    rationale: str
    assumptions: list[str] = Field(default_factory=list)


# --- Trust ---


class TransparencyEntry(BaseModel):
    seq: int
    contentHash: str
    entryHash: str
    scanId: str | None = None
    createdAt: str | None = None


class TransparencyLogResponse(BaseModel):
    rootHash: str | None = None
    entries: list[TransparencyEntry]
    total: int
    verifyInstructions: str


class AuditorPacketResponse(BaseModel):
    scanIds: list[str]
    bundleUrls: list[str]
    verifyCli: str
    caveats: list[str]


# --- Portfolio / benchmarks ---


class PortfolioRollupResponse(BaseModel):
    childCount: int
    avgReadiness: float | None = None
    tenants: list[dict[str, Any]]
    assumptions: list[str] = Field(default_factory=list)


class PeerPercentileResponse(BaseModel):
    readinessPercentile: float | None = None
    velocityPercentile: float | None = None
    sector: str | None = None
    sampleSize: int
    assumptions: list[str] = Field(default_factory=list)


# --- Notifications ---


class NotificationPreferences(BaseModel):
    channels: dict[str, bool] = Field(default_factory=dict)
    digestCadenceHours: int = 24
    quietHoursStart: int | None = Field(default=None, ge=0, le=23)
    quietHoursEnd: int | None = Field(default=None, ge=0, le=23)
    minSeverity: str = "medium"
    pushEnabled: bool = False


# --- QROS (Quantum Readiness Operating System) ---


class NextBestAction(BaseModel):
    id: str
    kind: str
    title: str
    impact: str
    effort: str = "medium"
    score: int = 0
    owner: str | None = None
    deepLink: str | None = None
    cta: dict[str, str] = Field(default_factory=dict)


class NextBestActionResponse(BaseModel):
    actions: list[NextBestAction]
    generatedAt: str


class MorningBriefingResponse(BaseModel):
    generatedAt: str
    persona: str
    headline: str
    bullets: list[str]
    nextActions: list[NextBestAction]
    methodNote: str


class RunwayMilestone(BaseModel):
    id: str
    label: str
    date: str
    kind: str
    description: str


class RunwayScenario(BaseModel):
    id: str
    label: str
    readinessDelta: int
    description: str


class RunwayResponse(BaseModel):
    milestones: list[RunwayMilestone]
    scenarios: list[RunwayScenario]
    framing: str


class ScenarioSimRequest(BaseModel):
    scenarioId: str = "baseline"


class ScenarioSimResponse(BaseModel):
    scenarioId: str
    projectedReadiness: float
    confidenceBand: dict[str, float]
    assumptions: list[str]


class DigitalTwinResponse(BaseModel):
    graph: dict[str, Any]
    selectedNodeId: str | None = None
    blastRadius: list[str]
    simulationNote: str


class BoardDeckResponse(BaseModel):
    title: str
    generatedAt: str
    slides: list[dict[str, str]]
    formats: list[str]


class AgenticActionRequest(BaseModel):
    action: str = Field(min_length=1, max_length=64)
    payload: dict[str, Any] = Field(default_factory=dict)
    dryRun: bool = True
    approved: bool = False


class AgenticActionResponse(BaseModel):
    action: str
    dryRun: bool
    status: str
    steps: list[str]
    payload: dict[str, Any] = Field(default_factory=dict)
    guardrails: list[str] = Field(default_factory=list)


class MarketplaceTile(BaseModel):
    id: str
    name: str
    publisher: str
    description: str
    category: str
    installed: bool = False


class MarketplaceResponse(BaseModel):
    tiles: list[MarketplaceTile]


def _briefing_recipient(value: str) -> str:
    from email.errors import HeaderParseError
    from email.headerregistry import Address

    value = value.strip()
    if not value.isascii() or len(value) > 254 or "\r" in value or "\n" in value:
        raise ValueError("Use a valid ASCII email address.")
    try:
        address = Address(addr_spec=value)
    except (ValueError, IndexError, HeaderParseError) as exc:
        raise ValueError("Use a valid email address.") from exc
    if not address.username or not address.domain or address.addr_spec != value:
        raise ValueError("Use an email address without a display name.")
    return value


BriefingRecipient = Annotated[str, AfterValidator(_briefing_recipient)]


class PushBriefingRequest(BaseModel):
    channels: list[Literal["email", "slack", "teams", "webhook"]] = Field(default_factory=lambda: ["email"], min_length=1, max_length=4)
    recipients: list[BriefingRecipient] = Field(default_factory=list, max_length=50)
    cadenceHours: int = Field(default=24, ge=1, le=168)
    enabled: bool = False

    @model_validator(mode="after")
    def validate_recipients(self):
        self.channels = list(dict.fromkeys(self.channels))
        self.recipients = list(dict.fromkeys(self.recipients))
        if self.enabled and "email" in self.channels and not self.recipients:
            raise ValueError("Email delivery requires at least one recipient.")
        return self


class NbaActionRequest(BaseModel):
    op: Literal["snooze", "dismiss", "assign"] = "dismiss"
    owner: str | None = None
    snoozeHours: int = Field(default=24, ge=1, le=168)


class MarketplaceInstallRequest(BaseModel):
    tileId: str = Field(min_length=1, max_length=64)

