from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import TenantIntegration as IntegrationRow

logger = logging.getLogger(__name__)

SUPPORTED_PROVIDERS = {"jira", "servicenow", "linear"}
_SYNC_STATE: dict[str, dict[str, dict[str, Any]]] = {}


def list_integrations(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = session.query(IntegrationRow).filter(IntegrationRow.tenant_id == tenant_id).all()
        return [_row_to_dict(row) for row in rows]


def upsert_integration(
    *,
    tenant_id: str,
    provider: str,
    config: dict[str, Any],
) -> dict[str, Any]:
    if provider not in SUPPORTED_PROVIDERS:
        raise ValueError(f"Unsupported provider: {provider}")
    if not persistence_enabled():
        return {"provider": provider, "configured": True}
    import uuid

    row_id = f"int-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        existing = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == provider)
            .one_or_none()
        )
        if existing:
            existing.config_json = json.dumps(config)
            row = existing
        else:
            row = IntegrationRow(
                id=row_id,
                tenant_id=tenant_id,
                provider=provider,
                config_json=json.dumps(config),
            )
            session.add(row)
        session.flush()
        return _row_to_dict(row)


def push_remediation_ticket(
    *,
    tenant_id: str,
    provider: str,
    item: dict[str, Any],
    scan_id: str,
) -> dict[str, Any]:
    if not persistence_enabled():
        return {"sent": False, "reason": "persistence_required"}
    with db_session() as session:
        row = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == provider)
            .one_or_none()
        )
        if row is None:
            return {"sent": False, "reason": "integration_not_configured"}
        config = json.loads(row.config_json or "{}")

    if provider == "jira":
        result = _push_jira(config, item, scan_id)
    elif provider == "servicenow":
        result = _push_servicenow(config, item, scan_id)
    elif provider == "linear":
        result = _push_linear(config, item, scan_id)
    else:
        return {"sent": False, "reason": "unsupported_provider"}
    if result.get("sent"):
        _SYNC_STATE.setdefault(tenant_id, {})[str(item.get("id"))] = {
            "provider": provider,
            "externalRef": result.get("externalRef", ""),
            "status": "pushed",
            "scanId": scan_id,
        }
    return result


def pull_ticket_status(
    *,
    tenant_id: str,
    remediation_id: str,
) -> dict[str, Any]:
    tenant = _SYNC_STATE.get(tenant_id, {})
    row = tenant.get(remediation_id)
    if not row:
        return {"found": False, "reason": "not_synced"}
    # Placeholder sync pull until provider-specific GET APIs are wired.
    return {"found": True, **row, "lastPulled": __import__("datetime").datetime.utcnow().isoformat()}


def _push_jira(config: dict[str, Any], item: dict[str, Any], scan_id: str) -> dict[str, Any]:
    base = config.get("baseUrl", "").rstrip("/")
    email = config.get("email", "")
    token = config.get("apiToken", "")
    project = config.get("projectKey", "SEC")
    if not base or not token:
        return {"sent": False, "reason": "missing_jira_config"}
    payload = {
        "fields": {
            "project": {"key": project},
            "summary": f"[PQC] {item.get('title', 'Remediation')}",
            "description": (
                f"Qtangl scan {scan_id}\n\n"
                f"Action: {item.get('action', item.get('summary', ''))}\n"
                f"Severity: {item.get('severity', '')}\n"
                f"PQC algorithm: {item.get('pqcAlgorithm', '')}\n"
            ),
            "issuetype": {"name": config.get("issueType", "Task")},
        }
    }
    import base64

    auth = base64.b64encode(f"{email}:{token}".encode()).decode()
    result = _http_json(
        f"{base}/rest/api/3/issue",
        payload,
        headers={"Authorization": f"Basic {auth}"},
    )
    result["externalRef"] = f"{project}-{item.get('id', '')}"
    return result


def _push_servicenow(config: dict[str, Any], item: dict[str, Any], scan_id: str) -> dict[str, Any]:
    instance = config.get("instanceUrl", "").rstrip("/")
    user = config.get("username", "")
    password = config.get("password", "")
    table = config.get("table", "incident")
    if not instance or not user:
        return {"sent": False, "reason": "missing_servicenow_config"}
    payload = {
        "short_description": f"[PQC] {item.get('title', 'Remediation')}",
        "description": f"Scan {scan_id}: {item.get('summary', '')}",
        "urgency": "2" if item.get("severity") in {"critical", "high"} else "3",
    }
    import base64

    auth = base64.b64encode(f"{user}:{password}".encode()).decode()
    result = _http_json(
        f"{instance}/api/now/table/{table}",
        payload,
        headers={"Authorization": f"Basic {auth}"},
    )
    result["externalRef"] = f"{table}:{item.get('id', '')}"
    return result


def _push_linear(config: dict[str, Any], item: dict[str, Any], scan_id: str) -> dict[str, Any]:
    api_key = config.get("apiKey", "")
    team_id = config.get("teamId", "")
    if not api_key or not team_id:
        return {"sent": False, "reason": "missing_linear_config"}
    query = """
    mutation CreateIssue($teamId: String!, $title: String!, $description: String!) {
      issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
        success
      }
    }
    """
    payload = {
        "query": query,
        "variables": {
            "teamId": team_id,
            "title": f"[PQC] {item.get('title', 'Remediation')}",
            "description": f"Scan {scan_id}: {item.get('summary', '')}",
        },
    }
    result = _http_json(
        "https://api.linear.app/graphql",
        payload,
        headers={"Authorization": api_key},
    )
    result["externalRef"] = f"linear:{item.get('id', '')}"
    return result


def _http_json(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return {"sent": True, "statusCode": response.status}
    except urllib.error.HTTPError as exc:
        logger.warning("Integration push failed: HTTP %s", exc.code)
        return {"sent": False, "reason": f"HTTP {exc.code}"}
    except Exception as exc:
        logger.warning("Integration push failed: %s", exc)
        return {"sent": False, "reason": str(exc)}


def _row_to_dict(row: IntegrationRow) -> dict[str, Any]:
    config = json.loads(row.config_json or "{}")
    safe = {k: v for k, v in config.items() if k not in {"apiToken", "password", "apiKey"}}
    return {
        "id": row.id,
        "provider": row.provider,
        "configured": bool(config),
        "config": safe,
    }
