from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

logger = logging.getLogger(__name__)


def deliver_webhook(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    """POST JSON to tenant webhook URL. Best-effort; never raises."""
    body = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json", "User-Agent": "Qtangl-Webhook/2.0"}
    if "hooks.slack.com" in url:
        payload = _slack_payload(payload)
        body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return {"sent": True, "statusCode": response.status}
    except urllib.error.HTTPError as exc:
        logger.warning("Webhook HTTP error %s: %s", url, exc.code)
        return {"sent": False, "reason": f"HTTP {exc.code}"}
    except Exception as exc:
        logger.warning("Webhook failed %s: %s", url, exc)
        return {"sent": False, "reason": str(exc)}


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
) -> list[dict[str, Any]]:
    payload = {
        "event": event,
        "scanId": scan_id,
        "targetDomain": target_domain,
        "readinessScore": readiness_score,
        "readinessBand": readiness_band,
    }
    return [deliver_webhook(url, payload) for url in webhooks]


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
    event: str = "scan.complete",
) -> list[dict[str, Any]]:
    """Structured webhook payload v2 for SIEM/GRC integrations."""
    top_findings: list[dict[str, Any]] = []
    if scan_diff:
        top_findings.extend(scan_diff.get("newQuantumVulnerable") or [])
        top_findings.extend(scan_diff.get("degradedAlgorithms") or [])

    payload = {
        "schemaVersion": "qtangl-webhook-v2",
        "event": event,
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
    return [deliver_webhook(url, payload) for url in webhooks]
