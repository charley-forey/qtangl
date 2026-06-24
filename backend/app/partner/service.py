"""Partner / MSP multi-tenant hierarchy."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import PartnerChildTenant as PartnerRow, Tenant


def list_child_tenants(*, parent_tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(PartnerRow).filter(PartnerRow.parent_tenant_id == parent_tenant_id).all()
        return [_row_to_dict(row) for row in rows]


def list_child_tenants_with_names(*, parent_tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(PartnerRow, Tenant.name)
            .outerjoin(Tenant, Tenant.id == PartnerRow.child_tenant_id)
            .filter(PartnerRow.parent_tenant_id == parent_tenant_id)
            .all()
        )
        result: list[dict[str, Any]] = []
        for row, tenant_name in rows:
            item = _row_to_dict(row)
            item["childTenantName"] = tenant_name or row.child_tenant_id
            result.append(item)
        return result


def link_child_tenant(*, parent_tenant_id: str, child_tenant_id: str, label: str = "") -> dict[str, Any]:
    if not persistence_enabled():
        return {"parentTenantId": parent_tenant_id, "childTenantId": child_tenant_id}
    with db_session() as session:
        row = PartnerRow(
            id=f"partner-{uuid.uuid4().hex[:12]}",
            parent_tenant_id=parent_tenant_id,
            child_tenant_id=child_tenant_id,
            label=label,
            created_at=datetime.now(timezone.utc),
        )
        session.add(row)
        session.flush()
        return _row_to_dict(row)


def unlink_child_tenant(*, parent_tenant_id: str, child_tenant_id: str) -> bool:
    if not persistence_enabled():
        return False
    with db_session() as session:
        row = (
            session.query(PartnerRow)
            .filter(
                PartnerRow.parent_tenant_id == parent_tenant_id,
                PartnerRow.child_tenant_id == child_tenant_id,
            )
            .one_or_none()
        )
        if row is None:
            return False
        session.delete(row)
        session.flush()
        return True


def update_child_label(
    *,
    parent_tenant_id: str,
    child_tenant_id: str,
    label: str,
) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = (
            session.query(PartnerRow)
            .filter(
                PartnerRow.parent_tenant_id == parent_tenant_id,
                PartnerRow.child_tenant_id == child_tenant_id,
            )
            .one_or_none()
        )
        if row is None:
            return None
        row.label = label
        session.flush()
        return _row_to_dict(row)


def partner_can_manage_tenant(*, parent_tenant_id: str, child_tenant_id: str) -> bool:
    if parent_tenant_id == child_tenant_id:
        return True
    children = {c["childTenantId"] for c in list_child_tenants(parent_tenant_id=parent_tenant_id)}
    return child_tenant_id in children


def _row_to_dict(row: PartnerRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "parentTenantId": row.parent_tenant_id,
        "childTenantId": row.child_tenant_id,
        "label": row.label,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }
