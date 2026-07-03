from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

_memory_alerts: dict[str, list[dict[str, Any]]] = {}


def persist_alert(
    *,
    tenant_id: str,
    rule: str,
    severity: str,
    message: str,
    source: str,
    payload: dict[str, Any] | None = None,
) -> str:
    """Store a fired alert for dashboard inbox (DB or in-memory fallback)."""
    alert_id = f"alert-{uuid.uuid4().hex[:16]}"
    now = datetime.now(timezone.utc)
    record = {
        "id": alert_id,
        "tenantId": tenant_id,
        "rule": rule,
        "type": rule,
        "severity": severity,
        "message": message,
        "source": source,
        "payload": payload or {},
        "firedAt": now.isoformat(),
        "readAt": None,
        "actionUrl": _action_url_for_rule(rule, payload or {}),
    }

    from app.db.config import persistence_enabled

    if persistence_enabled():
        try:
            from app.db.engine import db_session
            from app.db.models import TenantAlert

            with db_session() as session:
                row = TenantAlert(
                    id=alert_id,
                    tenant_id=tenant_id,
                    rule=rule,
                    severity=severity,
                    message=message,
                    source=source,
                    payload_json=json.dumps(payload or {}),
                    fired_at=now,
                )
                session.add(row)
        except Exception:
            _memory_alerts.setdefault(tenant_id, []).append(record)
    else:
        _memory_alerts.setdefault(tenant_id, []).append(record)

    return alert_id


def list_alerts(
    *,
    tenant_id: str,
    since_days: int = 30,
    unread_only: bool = False,
    include_resolved: bool = False,
) -> list[dict[str, Any]]:
    since = datetime.now(timezone.utc) - timedelta(days=since_days)
    out: list[dict[str, Any]] = []

    from app.db.config import persistence_enabled

    if persistence_enabled():
        try:
            from app.db.engine import db_session
            from app.db.models import TenantAlert

            with db_session() as session:
                q = session.query(TenantAlert).filter(
                    TenantAlert.tenant_id == tenant_id,
                    TenantAlert.fired_at >= since,
                )
                if unread_only:
                    q = q.filter(TenantAlert.read_at.is_(None))
                if not include_resolved:
                    q = q.filter(TenantAlert.resolved_at.is_(None))
                rows = q.order_by(TenantAlert.fired_at.desc()).limit(100).all()
                for row in rows:
                    payload = {}
                    try:
                        payload = json.loads(row.payload_json or "{}")
                    except json.JSONDecodeError:
                        pass
                    out.append(
                        {
                            "id": row.id,
                            "rule": row.rule,
                            "type": row.rule,
                            "severity": row.severity,
                            "message": row.message,
                            "source": row.source,
                            "payload": payload,
                            "firedAt": row.fired_at.isoformat() if row.fired_at else None,
                            "readAt": row.read_at.isoformat() if row.read_at else None,
                            "resolvedAt": row.resolved_at.isoformat() if row.resolved_at else None,
                            "actionUrl": _action_url_for_rule(row.rule, payload),
                        }
                    )
                return out
        except Exception:
            pass

    for item in _memory_alerts.get(tenant_id, []):
        fired = item.get("firedAt")
        if fired:
            try:
                if datetime.fromisoformat(fired.replace("Z", "+00:00")) < since:
                    continue
            except ValueError:
                pass
        if unread_only and item.get("readAt"):
            continue
        if not include_resolved and item.get("resolvedAt"):
            continue
        out.append(item)
    out.sort(key=lambda a: a.get("firedAt") or "", reverse=True)
    return out[:100]


def mark_alert_read(*, tenant_id: str, alert_id: str) -> bool:
    now = datetime.now(timezone.utc)
    from app.db.config import persistence_enabled

    if persistence_enabled():
        try:
            from app.db.engine import db_session
            from app.db.models import TenantAlert

            with db_session() as session:
                row = (
                    session.query(TenantAlert)
                    .filter(TenantAlert.tenant_id == tenant_id, TenantAlert.id == alert_id)
                    .one_or_none()
                )
                if row is None:
                    return False
                row.read_at = now
                return True
        except Exception:
            pass

    for item in _memory_alerts.get(tenant_id, []):
        if item.get("id") == alert_id:
            item["readAt"] = now.isoformat()
            return True
    return False


def mark_all_alerts_read(*, tenant_id: str) -> int:
    count = 0
    for alert in list_alerts(tenant_id=tenant_id, unread_only=True, include_resolved=True):
        if mark_alert_read(tenant_id=tenant_id, alert_id=str(alert["id"])):
            count += 1
    return count


_RESOLVABLE_RULES = {
    "new_quantum_vulnerable",
    "algorithm_degraded",
    "cert_expiring_30d",
    "cert_expiring_assets",
    "readiness_drop",
}


def resolve_alerts_for_remediation(
    *,
    tenant_id: str,
    scan_id: str,
    remediation_id: str,
    verify_scan_id: str,
) -> int:
    """Mark matching unresolved alerts as verified after successful fix verification."""
    return resolve_alerts_for_scan(
        tenant_id=tenant_id,
        scan_id=scan_id,
        remediation_id=remediation_id,
        resolved_by=verify_scan_id,
        reason="verified",
    )


def resolve_alerts_for_scan(
    *,
    tenant_id: str,
    scan_id: str,
    remediation_id: str | None = None,
    resolved_by: str | None = None,
    reason: str = "verified",
) -> int:
    now = datetime.now(timezone.utc)
    count = 0
    from app.db.config import persistence_enabled

    if persistence_enabled():
        try:
            from app.db.engine import db_session
            from app.db.models import TenantAlert

            with db_session() as session:
                q = session.query(TenantAlert).filter(
                    TenantAlert.tenant_id == tenant_id,
                    TenantAlert.resolved_at.is_(None),
                )
                rows = q.all()
                for row in rows:
                    if row.rule not in _RESOLVABLE_RULES:
                        continue
                    try:
                        payload = json.loads(row.payload_json or "{}")
                    except json.JSONDecodeError:
                        payload = {}
                    alert_scan = payload.get("scanId") or payload.get("scan_id")
                    if alert_scan and str(alert_scan) != str(scan_id):
                        continue
                    if remediation_id:
                        alert_rem = payload.get("remediationId") or payload.get("remediation_id")
                        if alert_rem and str(alert_rem) != str(remediation_id):
                            continue
                    row.resolved_at = now
                    row.resolved_by = resolved_by
                    row.resolution = reason
                    count += 1
                return count
        except Exception:
            pass

    for item in _memory_alerts.get(tenant_id, []):
        if item.get("resolvedAt"):
            continue
        if item.get("rule") not in _RESOLVABLE_RULES:
            continue
        payload = item.get("payload") or {}
        alert_scan = payload.get("scanId") or payload.get("scan_id")
        if alert_scan and str(alert_scan) != str(scan_id):
            continue
        if remediation_id:
            alert_rem = payload.get("remediationId") or payload.get("remediation_id")
            if alert_rem and str(alert_rem) != str(remediation_id):
                continue
        item["resolvedAt"] = now.isoformat()
        item["resolvedBy"] = resolved_by
        item["resolution"] = reason
        count += 1
    return count


def _action_url_for_rule(rule: str, payload: dict[str, Any]) -> str:
    scan_id = payload.get("scanId") or payload.get("scan_id")
    remediation_id = payload.get("remediationId") or payload.get("remediation_id")

    def remediate_url() -> str:
        params = ["tab=remediate"]
        if scan_id:
            params.append(f"scanId={scan_id}")
        if remediation_id:
            params.append(f"remediationId={remediation_id}")
        return f"/command-center?{'&'.join(params)}"

    if rule in {"new_quantum_vulnerable", "algorithm_degraded"}:
        return remediate_url()
    if rule in {"readiness_drop", "scan_diff_info"}:
        if scan_id:
            return f"/command-center?tab=scans&scanId={scan_id}"
        return "/command-center?tab=scans"
    if rule.startswith("cbom_") or rule.startswith("drift_"):
        action = "&action=drift" if rule.startswith("drift_") else ""
        return f"/command-center?tab=monitor{action}"
    if rule in {"cert_expiring_30d", "cert_expiring_assets"}:
        return remediate_url()
    return "/command-center?tab=overview"


def _top_critical_remediation_id(bundle_report: dict[str, Any] | None) -> str | None:
    if not bundle_report:
        return None
    backlog = bundle_report.get("remediationBacklog") or bundle_report.get("remediation_backlog") or []
    for item in backlog:
        if isinstance(item, dict):
            sev = str(item.get("severity", "")).lower()
            if sev in {"critical", "high"}:
                return str(item.get("id") or "")
        else:
            sev = str(getattr(item, "severity", "")).lower()
            if sev in {"critical", "high"}:
                return str(getattr(item, "id", "") or "")
    if backlog:
        first = backlog[0]
        if isinstance(first, dict):
            return str(first.get("id") or "")
        return str(getattr(first, "id", "") or "")
    return None
