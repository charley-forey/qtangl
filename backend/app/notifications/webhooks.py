from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any

from app.notifications.webhook_dlq import (
    get_dead_letter,
    mark_replayed,
    record_dead_letter,
)

# Re-export for tenant API
from app.notifications.webhook_dlq import list_dead_letters  # noqa: F401

logger = logging.getLogger(__name__)

_MAX_RETRIES = 3
_BACKOFF_SEC = [0.5, 1.0, 2.0]


def deliver_webhook(
    url: str,
    payload: dict[str, Any],
    *,
    signing_secret: str = "",
    tenant_id: str | None = None,
) -> dict[str, Any]:
    """POST JSON to tenant webhook URL with optional HMAC signing and retries."""
    body_payload = payload
    if "hooks.slack.com" in url:
        body_payload = _slack_payload(payload)
    body = json.dumps(body_payload).encode("utf-8")
    headers = {"Content-Type": "application/json", "User-Agent": "Qtangl-Webhook/2.0"}
    if signing_secret:
        timestamp = str(int(time.time()))
        sig = hmac.new(
            signing_secret.encode(),
            f"{timestamp}.{body.decode('utf-8')}".encode(),
            hashlib.sha256,
        ).hexdigest()
        headers["X-Qtangl-Timestamp"] = timestamp
        headers["X-Qtangl-Signature"] = f"sha256={sig}"

    last_reason = "unknown"
    for attempt in range(_MAX_RETRIES):
        if attempt > 0:
            time.sleep(_BACKOFF_SEC[min(attempt - 1, len(_BACKOFF_SEC) - 1)])
        request = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                return {"sent": True, "statusCode": response.status, "attempt": attempt + 1}
        except urllib.error.HTTPError as exc:
            last_reason = f"HTTP {exc.code}"
            logger.warning("Webhook HTTP error %s: %s (attempt %s)", url, exc.code, attempt + 1)
        except Exception as exc:
            last_reason = str(exc)
            logger.warning("Webhook failed %s: %s (attempt %s)", url, exc, attempt + 1)

    tid = tenant_id or str(payload.get("tenantId", "sandbox"))
    record_dead_letter(tenant_id=tid, url=url, payload=payload, reason=last_reason)
    return {"sent": False, "reason": last_reason}


def _slack_payload(payload: dict[str, Any]) -> dict[str, Any]:
    text = payload.get("message") or payload.get("event", "scan.complete")
    alerts = payload.get("alerts") or []
    if alerts:
        text = alerts[0].get("message", text)
    return {"text": f"Qtangl: {text} (scan {payload.get('scanId', '')})"}


def notify_scan_complete(
    *,
    webhooks: list[str],
    scan_id: str,
    target_domain: str,
    readiness_score: float,
    readiness_band: str,
    event: str = "scan.complete",
    signing_secret: str = "",
    tenant_id: str = "sandbox",
) -> list[dict[str, Any]]:
    payload = {
        "event": event,
        "scanId": scan_id,
        "targetDomain": target_domain,
        "readinessScore": readiness_score,
        "readinessBand": readiness_band,
        "tenantId": tenant_id,
    }
    return [
        deliver_webhook(url, payload, signing_secret=signing_secret, tenant_id=tenant_id)
        for url in webhooks
    ]


def notify_scan_complete_v2(
    *,
    webhooks: list[str],
    scan_id: str,
    target_domain: str,
    readiness_score: float,
    readiness_band: str,
    scan_diff: dict[str, Any] | None = None,
    alerts: list[dict[str, Any]] | None = None,
    verify_url: str = "",
    evidence_zip_url: str = "",
    tenant_id: str = "sandbox",
    event: str = "scan.complete",
    signing_secret: str = "",
) -> list[dict[str, Any]]:
    top_findings: list[dict[str, Any]] = []
    if scan_diff:
        top_findings.extend(scan_diff.get("newQuantumVulnerable") or [])
        top_findings.extend(scan_diff.get("degradedAlgorithms") or [])

    payload = {
        "schemaVersion": "qtangl-webhook-v2",
        "event": event,
        "tenantId": tenant_id,
        "scanId": scan_id,
        "targetDomain": target_domain,
        "readinessScore": readiness_score,
        "readinessBand": readiness_band,
        "verifyUrl": verify_url,
        "evidenceZipUrl": evidence_zip_url,
        "scanDiff": scan_diff,
        "alerts": alerts or [],
        "topFindings": top_findings[:10],
        "message": (alerts[0]["message"] if alerts else f"Scan complete for {target_domain}"),
    }
    return [
        deliver_webhook(url, payload, signing_secret=signing_secret, tenant_id=tenant_id)
        for url in webhooks
    ]


def replay_dead_letter(*, tenant_id: str, dead_letter_id: str, signing_secret: str = "") -> dict[str, Any]:
    row = get_dead_letter(tenant_id=tenant_id, dead_letter_id=dead_letter_id)
    if row is None:
        return {"sent": False, "reason": "dead_letter_not_found"}
    result = deliver_webhook(
        row.get("url", ""),
        row.get("payload") or {},
        signing_secret=signing_secret,
        tenant_id=tenant_id,
    )
    if result.get("sent"):
        mark_replayed(tenant_id=tenant_id, dead_letter_id=dead_letter_id)
    return result
