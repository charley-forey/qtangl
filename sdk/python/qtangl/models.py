from __future__ import annotations

from typing import Any

from qtangl._generated_models import (
    CbomConflictResolveRequest,
    ErrorResponse,
    PqcScanRequest,
    ProgramCreateRequest,
    ProgramUpdateRequest,
    ProgramVerifyRequest,
    RemediationUpdateRequest,
    ScheduleCreateRequest,
    SchedulePatchRequest,
    TenantSettingsRequest,
    VerifyReportRequest,
)

JsonDict = dict[str, Any]

__all__ = [
    "CbomConflictResolveRequest",
    "ErrorResponse",
    "JsonDict",
    "PqcScanRequest",
    "ProgramCreateRequest",
    "ProgramUpdateRequest",
    "ProgramVerifyRequest",
    "RemediationUpdateRequest",
    "ScheduleCreateRequest",
    "SchedulePatchRequest",
    "TenantSettingsRequest",
    "VerifyReportRequest",
]
