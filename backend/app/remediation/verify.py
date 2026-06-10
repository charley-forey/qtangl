from __future__ import annotations

import hashlib
import os
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import RemediationProgramItem, VerificationProof
from app.remediation.program import get_program_item, update_program_item
from app.remediation.service import verify_remediation_fix
from app.store.scan_jobs import load_scan_bundle

def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _map_jira_status(name: str) -> str:
    lower = name.lower()
    if lower in {"done", "closed", "resolved", "complete"}:
        return "done"
    if lower in {"in progress", "in review", "implementing"}:
        return "in_progress"
    return "open"


def map_external_status(provider: str, external_status: str) -> str:
    if provider == "jira":
        return _map_jira_status(external_status)
    if provider == "servicenow":
        lower = external_status.lower()
        if lower in {"closed", "resolved", "complete", "3"}:
            return "done"
        if lower in {"in progress", "work in progress", "2"}:
            return "in_progress"
    return "open"


def verify_program_item(
    *,
    tenant_id: str,
    item_id: str,
    verify_scan_id: str | None = None,
) -> dict[str, Any]:
    item = get_program_item(tenant_id=tenant_id, item_id=item_id)
    if not item:
        return {"ok": False, "reason": "not_found"}

    source_type = item.get("sourceType", "external")
    if source_type == "external":
        scan_id = item.get("scanId")
        remediation_id = item.get("remediationId")
        if not scan_id or not remediation_id or not verify_scan_id:
            return {"ok": False, "reason": "missing_scan_or_verify_id"}
        result = verify_remediation_fix(
            tenant_id=tenant_id,
            baseline_scan_id=scan_id,
            remediation_id=remediation_id,
            verify_scan_id=verify_scan_id,
        )
        if result.get("verified"):
            update_program_item(tenant_id=tenant_id, item_id=item_id, status="done")
        return {"ok": True, "sourceType": "external", **result}

    if source_type == "host_finding":
        from app.discovery.jobs import create_discovery_job

        job_id = create_discovery_job(
            tenant_id=tenant_id,
            job_type="host_fleet_scan",
            payload={"tenantId": tenant_id, "verifyFor": item_id},
            target_id=item.get("sourceRef"),
        )
        if persistence_enabled():
            with db_session() as session:
                row = session.get(RemediationProgramItem, item_id)
                if row:
                    row.verify_job_id = job_id
                    row.updated_at = _utcnow()
        return {"ok": True, "sourceType": "host_finding", "verifyJobId": job_id, "async": True}

    if source_type in {"code_finding", "binary_finding"}:
        from app.discovery.jobs import create_discovery_job

        job_type = "code_scan" if source_type == "code_finding" else "binary_scan"
        job_id = create_discovery_job(
            tenant_id=tenant_id,
            job_type=job_type,
            payload={"tenantId": tenant_id, "verifyFor": item_id},
            target_id=item.get("sourceRef"),
        )
        if persistence_enabled():
            with db_session() as session:
                row = session.get(RemediationProgramItem, item_id)
                if row:
                    row.verify_job_id = job_id
                    row.updated_at = _utcnow()
        return {"ok": True, "sourceType": source_type, "verifyJobId": job_id, "async": True}

    return {"ok": False, "reason": "unsupported_source_type"}


def record_verification_proof(
    *,
    tenant_id: str,
    program_item_id: str,
    verify_job_id: str | None = None,
    verify_scan_id: str | None = None,
    evidence_payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not persistence_enabled():
        return {"id": "proof-mem"}
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    verify_url = f"{base}/verify?scanId={verify_scan_id}" if verify_scan_id else None
    evidence_hash = ""
    if evidence_payload:
        import json

        evidence_hash = hashlib.sha256(
            json.dumps(evidence_payload, sort_keys=True).encode()
        ).hexdigest()
    proof_id = f"proof-{uuid.uuid4().hex[:12]}"
    now = _utcnow()
    with db_session() as session:
        row = VerificationProof(
            id=proof_id,
            tenant_id=tenant_id,
            program_item_id=program_item_id,
            verify_job_id=verify_job_id,
            verify_scan_id=verify_scan_id,
            evidence_hash=evidence_hash,
            verify_url=verify_url,
            confirmed_at=now,
            created_at=now,
        )
        session.add(row)
        session.flush()
    return {"id": proof_id, "verifyUrl": verify_url, "evidenceHash": evidence_hash}


def auto_close_on_verify_delta(
    *,
    tenant_id: str,
    program_item_id: str,
    delta: dict[str, Any],
) -> bool:
    removed = int(delta.get("removedCount", 0))
    if removed <= 0:
        return False
    update_program_item(tenant_id=tenant_id, item_id=program_item_id, status="done")
    record_verification_proof(
        tenant_id=tenant_id,
        program_item_id=program_item_id,
        evidence_payload=delta,
    )
    return True
