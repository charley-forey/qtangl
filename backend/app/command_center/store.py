"""Persistence for comments, saved views, and war rooms."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import FindingCommentRow, SavedViewRow, WarRoomRow


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


# In-memory fallbacks for dev without Postgres
_MEM_COMMENTS: dict[str, list[dict[str, Any]]] = {}
_MEM_VIEWS: dict[str, list[dict[str, Any]]] = {}
_MEM_WAR_ROOMS: dict[str, list[dict[str, Any]]] = {}


def list_comments(*, tenant_id: str, finding_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return list(_MEM_COMMENTS.get(f"{tenant_id}:{finding_id}", []))
    with db_session() as session:
        rows = (
            session.query(FindingCommentRow)
            .filter(
                FindingCommentRow.tenant_id == tenant_id,
                FindingCommentRow.finding_id == finding_id,
            )
            .order_by(FindingCommentRow.created_at.asc())
            .all()
        )
        return [_comment_row(r) for r in rows]


def create_comment(
    *,
    tenant_id: str,
    finding_id: str,
    scan_id: str | None,
    author: str,
    body: str,
    mentions: list[str],
) -> dict[str, Any]:
    now = _utcnow()
    cid = f"fc_{uuid.uuid4().hex[:16]}"
    payload = {
        "id": cid,
        "findingId": finding_id,
        "scanId": scan_id,
        "author": author,
        "body": body,
        "mentions": mentions,
        "createdAt": now.isoformat(),
        "updatedAt": None,
    }
    if not persistence_enabled():
        key = f"{tenant_id}:{finding_id}"
        _MEM_COMMENTS.setdefault(key, []).append(payload)
        return payload
    with db_session() as session:
        row = FindingCommentRow(
            id=cid,
            tenant_id=tenant_id,
            finding_id=finding_id,
            scan_id=scan_id,
            author=author,
            body=body,
            mentions_json=json.dumps(mentions),
            created_at=now,
            updated_at=now,
        )
        session.add(row)
        session.commit()
        return _comment_row(row)


def delete_comment(*, tenant_id: str, comment_id: str) -> bool:
    if not persistence_enabled():
        for key, items in _MEM_COMMENTS.items():
            if not key.startswith(f"{tenant_id}:"):
                continue
            for i, item in enumerate(items):
                if item["id"] == comment_id:
                    items.pop(i)
                    return True
        return False
    with db_session() as session:
        row = session.get(FindingCommentRow, comment_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        session.delete(row)
        session.commit()
        return True


def _comment_row(row: FindingCommentRow) -> dict[str, Any]:
    mentions = json.loads(row.mentions_json or "[]")
    return {
        "id": row.id,
        "findingId": row.finding_id,
        "scanId": row.scan_id,
        "author": row.author,
        "body": row.body,
        "mentions": mentions,
        "createdAt": _iso(row.created_at) or "",
        "updatedAt": _iso(row.updated_at),
    }


def list_saved_views(*, tenant_id: str, user_id: str | None = None) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return list(_MEM_VIEWS.get(tenant_id, []))
    with db_session() as session:
        q = session.query(SavedViewRow).filter(SavedViewRow.tenant_id == tenant_id)
        if user_id:
            q = q.filter(SavedViewRow.user_id == user_id)
        rows = q.order_by(SavedViewRow.updated_at.desc()).all()
        return [_view_row(r) for r in rows]


def upsert_saved_view(
    *,
    tenant_id: str,
    user_id: str | None,
    view_id: str | None,
    name: str,
    persona: str | None,
    filters: dict[str, Any],
) -> dict[str, Any]:
    now = _utcnow()
    vid = view_id or f"sv_{uuid.uuid4().hex[:16]}"
    if not persistence_enabled():
        views = _MEM_VIEWS.setdefault(tenant_id, [])
        for i, v in enumerate(views):
            if v["id"] == vid:
                views[i] = {
                    **v,
                    "name": name,
                    "persona": persona,
                    "filters": filters,
                    "updatedAt": now.isoformat(),
                }
                return views[i]
        payload = {
            "id": vid,
            "name": name,
            "persona": persona,
            "filters": filters,
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
        }
        views.append(payload)
        return payload
    with db_session() as session:
        row = session.get(SavedViewRow, vid)
        if row is None:
            row = SavedViewRow(
                id=vid,
                tenant_id=tenant_id,
                user_id=user_id,
                name=name,
                persona=persona,
                filters_json=json.dumps(filters),
                created_at=now,
                updated_at=now,
            )
            session.add(row)
        else:
            if row.tenant_id != tenant_id:
                raise ValueError("tenant_mismatch")
            row.name = name
            row.persona = persona
            row.filters_json = json.dumps(filters)
            row.updated_at = now
        session.commit()
        return _view_row(row)


def delete_saved_view(*, tenant_id: str, view_id: str) -> bool:
    if not persistence_enabled():
        views = _MEM_VIEWS.get(tenant_id, [])
        for i, v in enumerate(views):
            if v["id"] == view_id:
                views.pop(i)
                return True
        return False
    with db_session() as session:
        row = session.get(SavedViewRow, view_id)
        if row is None or row.tenant_id != tenant_id:
            return False
        session.delete(row)
        session.commit()
        return True


def _view_row(row: SavedViewRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "name": row.name,
        "persona": row.persona,
        "filters": json.loads(row.filters_json or "{}"),
        "createdAt": _iso(row.created_at) or "",
        "updatedAt": _iso(row.updated_at) or "",
    }


def list_war_rooms(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return list(_MEM_WAR_ROOMS.get(tenant_id, []))
    with db_session() as session:
        rows = (
            session.query(WarRoomRow)
            .filter(WarRoomRow.tenant_id == tenant_id)
            .order_by(WarRoomRow.updated_at.desc())
            .all()
        )
        return [_war_room_row(r) for r in rows]


def create_war_room(
    *,
    tenant_id: str,
    title: str,
    alert_ids: list[str],
    assignees: list[str],
) -> dict[str, Any]:
    now = _utcnow()
    wid = f"wr_{uuid.uuid4().hex[:16]}"
    token = uuid.uuid4().hex
    payload = {
        "id": wid,
        "title": title,
        "status": "active",
        "alertIds": alert_ids,
        "assignees": assignees,
        "shareToken": token,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
    }
    if not persistence_enabled():
        _MEM_WAR_ROOMS.setdefault(tenant_id, []).append(payload)
        return payload
    with db_session() as session:
        row = WarRoomRow(
            id=wid,
            tenant_id=tenant_id,
            title=title,
            status="active",
            alert_ids_json=json.dumps(alert_ids),
            assignees_json=json.dumps(assignees),
            share_token=token,
            created_at=now,
            updated_at=now,
        )
        session.add(row)
        session.commit()
        return _war_room_row(row)


def _war_room_row(row: WarRoomRow) -> dict[str, Any]:
    return {
        "id": row.id,
        "title": row.title,
        "status": row.status,
        "alertIds": json.loads(row.alert_ids_json or "[]"),
        "assignees": json.loads(row.assignees_json or "[]"),
        "shareToken": row.share_token,
        "createdAt": _iso(row.created_at) or "",
        "updatedAt": _iso(row.updated_at) or "",
    }
