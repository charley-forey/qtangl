from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from app.integrations.sync_store import get_sync
from app.remediation.program import update_program_item
from app.remediation.verify import map_external_status

router = APIRouter(tags=["integrations"])


@router.post("/integrations/jira/webhook")
async def jira_webhook(request: Request) -> dict[str, Any]:
    """Optional fast-path for Jira issue_updated events."""
    body = await request.json()
    issue = body.get("issue") or {}
    key = issue.get("key")
    fields = issue.get("fields") or {}
    status_name = (fields.get("status") or {}).get("name", "")
    tenant_id = str(body.get("tenantId") or request.headers.get("X-Qtangl-Tenant", ""))
    remediation_id = str(body.get("remediationId") or "")
    if not tenant_id or not remediation_id or not key:
        return {"status": "ignored"}
    sync = get_sync(tenant_id=tenant_id, remediation_id=remediation_id)
    if not sync:
        return {"status": "not_synced"}
    mapped = map_external_status("jira", status_name)
    program_item_id = sync.get("programItemId")
    if program_item_id:
        update_program_item(
            tenant_id=tenant_id,
            item_id=program_item_id,
            status=mapped,
            actor="jira_webhook",
        )
    return {"status": "ok", "mappedStatus": mapped}


@router.post("/integrations/slack/actions")
async def slack_inbound_action(request: Request) -> dict[str, Any]:
    """Inbound Slack interactive actions — ack/assign alerts."""
    body = await request.json()
    action = str(body.get("action") or body.get("callback_id") or "")
    tenant_id = str(body.get("tenantId") or request.headers.get("X-Qtangl-Tenant", ""))
    alert_id = str(body.get("alertId") or body.get("alert_id") or "")
    assignee = str(body.get("assignee") or body.get("user", {}).get("name", ""))
    if not tenant_id or not alert_id:
        return {"status": "ignored"}
    if action in {"ack", "acknowledge", "mark_read"}:
        from app.store.tenant_alerts import mark_alert_read

        mark_alert_read(tenant_id=tenant_id, alert_id=alert_id)
        return {"status": "ok", "action": "ack"}
    if action in {"assign", "assign_alert"}:
        from app.audit.service import log_action

        log_action(
            tenant_id=tenant_id,
            action="slack_assign_alert",
            actor=assignee or "slack",
            resource_id=alert_id,
            detail={"assignee": assignee},
        )
        return {"status": "ok", "action": "assign", "assignee": assignee}
    return {"status": "ignored", "reason": "unknown_action"}


@router.post("/integrations/teams/actions")
async def teams_inbound_action(request: Request) -> dict[str, Any]:
    """Inbound Microsoft Teams action payloads — same semantics as Slack."""
    return await slack_inbound_action(request)
