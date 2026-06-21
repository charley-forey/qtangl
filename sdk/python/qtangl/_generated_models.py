"""Auto-generated from backend/docs/openapi.json — do not edit."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

class PqcScanRequest(BaseModel):
    scenarioId: str = Field(default='bank-tls-inventory')
    useFixture: bool = Field(default=True)
    target: str | None = None
    seed: int = Field(default=1234)
    bundleSessionId: str | None = None
    depth: str = Field(default='standard', pattern=r"^(standard|lite)$")
    industry: str | None = None

class ScheduleCreateRequest(BaseModel):
    scenarioId: str = Field(default='production-baseline')
    target: str | None = None
    cadenceHours: int = Field(default=168, ge=1, le=8760)
    notifyEmail: str | None = None
    cloudImportPayload: str | None = None
    jobType: str = Field(default='scan', pattern=r"^(scan|cloud_pull|host_fleet_scan|code_scan|binary_scan)$")
    integrationProvider: str | None = None

class SchedulePatchRequest(BaseModel):
    cadenceHours: int | None = None
    notifyEmail: str | None = None
    active: bool | None = None

class TenantSettingsRequest(BaseModel):
    readinessDropThreshold: float | None = None
    alertOnNewQuantumVulnerable: bool | None = None
    certExpiryDays: int | None = None
    webhookSigningSecret: str | None = None
    autoRetainScans: bool | None = None
    evidenceRetentionMonths: int | None = None
    benchmarkOptIn: bool | None = None
    industry: str | None = None

class VerifyReportRequest(BaseModel):
    reportJson: dict[str, Any]

class CbomConflictResolveRequest(BaseModel):
    resolvedValue: str

class RemediationUpdateRequest(BaseModel):
    remediationId: str
    status: str
    owner: str | None = None
    notes: str | None = None
    targetDate: str | None = None
    assetId: str | None = None

class ProgramCreateRequest(BaseModel):
    sourceType: str = Field(default='manual')
    sourceRef: str
    title: str = Field(default='')
    status: str = Field(default='open')
    notes: str | None = None

class ProgramUpdateRequest(BaseModel):
    status: str | None = None
    owner: str | None = None
    notes: str | None = None
    targetDate: str | None = None

class ProgramVerifyRequest(BaseModel):
    verifyScanId: str | None = None

class ErrorResponse(BaseModel):
    status: str
    message: str

