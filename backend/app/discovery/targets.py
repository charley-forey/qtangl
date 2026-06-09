from __future__ import annotations

import json
import uuid
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import CodeScanTarget, ImageScanTarget


def list_code_targets(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(CodeScanTarget).filter(CodeScanTarget.tenant_id == tenant_id).all()
        return [_code_row(r) for r in rows]


def create_code_target(
    *,
    tenant_id: str,
    owner: str,
    repo: str,
    provider: str = "github",
    default_ref: str = "HEAD",
) -> dict[str, Any]:
    target_id = f"code-{uuid.uuid4().hex[:12]}"
    if not persistence_enabled():
        return {"id": target_id, "owner": owner, "repo": repo, "provider": provider}
    with db_session() as session:
        row = CodeScanTarget(
            id=target_id,
            tenant_id=tenant_id,
            provider=provider,
            owner=owner,
            repo=repo,
            default_ref=default_ref,
        )
        session.add(row)
        session.flush()
        return _code_row(row)


def list_image_targets(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(ImageScanTarget).filter(ImageScanTarget.tenant_id == tenant_id).all()
        return [_image_row(r) for r in rows]


def create_image_target(
    *,
    tenant_id: str,
    image_ref: str,
    registry: str = "ecr",
    integration_id: str | None = None,
) -> dict[str, Any]:
    target_id = f"img-{uuid.uuid4().hex[:12]}"
    if not persistence_enabled():
        return {"id": target_id, "imageRef": image_ref, "registry": registry}
    with db_session() as session:
        row = ImageScanTarget(
            id=target_id,
            tenant_id=tenant_id,
            registry=registry,
            image_ref=image_ref,
            integration_id=integration_id,
        )
        session.add(row)
        session.flush()
        return _image_row(row)


def _code_row(row: CodeScanTarget) -> dict[str, Any]:
    return {
        "id": row.id,
        "provider": row.provider,
        "owner": row.owner,
        "repo": row.repo,
        "defaultRef": row.default_ref,
        "active": row.active,
        "lastScanJobId": row.last_scan_job_id,
    }


def _image_row(row: ImageScanTarget) -> dict[str, Any]:
    return {
        "id": row.id,
        "registry": row.registry,
        "imageRef": row.image_ref,
        "active": row.active,
        "lastScanJobId": row.last_scan_job_id,
    }
