from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from app.auth import AuthContext, require_auth_operator

from app.integrations.sync_store import get_sync
from app.remediation.program import update_program_item
from app.remediation.verify import map_external_status

router = APIRouter(tags=["integrations"])


@router.post("/integrations/jira/webhook")
async def jira_webhook(
    request: Request, auth: AuthContext = Depends(require_auth_operator),
) -> dict[str, Any]:
    """Authenticated relay for Jira issue_updated events; not a native webhook verifier."""
    body = await _tenant_payload(request, auth)
    issue = body.get("issue") or {}
    if not isinstance(issue, dict):
        raise HTTPException(status_code=400, detail="Expected issue to be a JSON object.")
    key = issue.get("key")
    fields = issue.get("fields") or {}
    if not isinstance(fields, dict) or not isinstance(fields.get("status") or {}, dict):
        raise HTTPException(status_code=400, detail="Expected issue fields and status to be JSON objects.")
    status_name = (fields.get("status") or {}).get("name", "")
    tenant_id = auth.tenant_id
    remediation_id = str(body.get("remediationId") or "")
    if not tenant_id or not remediation_id or not key:
        return {"status": "ignored"}
    sync = get_sync(tenant_id=tenant_id, remediation_id=remediation_id)
    if not sync or sync.get("provider") != "jira" or sync.get("externalRef") != key:
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
async def slack_inbound_action(
    request: Request, auth: AuthContext = Depends(require_auth_operator),
) -> dict[str, Any]:
    """Authenticated Slack relay; native Slack signatures are not verified here."""
    return await _alert_action(request, auth, "slack")


async def _tenant_payload(request: Request, auth: AuthContext) -> dict[str, Any]:
    try:
        body = await request.json()
    except ValueError:
        raise HTTPException(status_code=400, detail="Expected a JSON object.") from None
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="Expected a JSON object.")
    for tenant in (body.get("tenantId"), request.headers.get("X-Qtangl-Tenant")):
        if tenant is not None and tenant != auth.tenant_id:
            raise HTTPException(status_code=403, detail="Tenant does not match authenticated credentials.")
    return body


async def _alert_action(request: Request, auth: AuthContext, provider: str) -> dict[str, Any]:
    body = await _tenant_payload(request, auth)
    action = str(body.get("action") or body.get("callback_id") or "")
    tenant_id = auth.tenant_id
    alert_id = str(body.get("alertId") or body.get("alert_id") or "")
    user = body.get("user")
    assignee = str(body.get("assignee") or (user.get("name", "") if isinstance(user, dict) else ""))
    if not tenant_id or not alert_id:
        return {"status": "ignored"}
    if action in {"ack", "acknowledge", "mark_read"}:
        from app.store.tenant_alerts import mark_alert_read

        if not mark_alert_read(tenant_id=tenant_id, alert_id=alert_id):
            raise HTTPException(status_code=404, detail="Alert not found.")
        return {"status": "ok", "action": "ack"}
    if action in {"assign", "assign_alert"}:
        from app.audit.service import log_action

        log_action(
            tenant_id=tenant_id,
            action=f"{provider}_assign_alert",
            actor=auth.user_id or auth.api_key_id or provider,
            resource_id=alert_id,
            detail={"assignee": assignee},
        )
        return {"status": "ok", "action": "assign", "assignee": assignee}
    return {"status": "ignored", "reason": "unknown_action"}


@router.post("/integrations/teams/actions")
async def teams_inbound_action(
    request: Request, auth: AuthContext = Depends(require_auth_operator),
) -> dict[str, Any]:
    """Authenticated Teams relay; native Bot Framework JWTs are not accepted."""
    return await _alert_action(request, auth, "teams")
