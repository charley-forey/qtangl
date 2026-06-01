from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger("qtangl.telemetry")

PRD_EVENTS = frozenset(
    {
        "schedule_created",
        "scan_completed",
        "alert_fired",
        "webhook_dlq_recorded",
        "remediation_verified",
        "tier_upgrade_clicked",
    }
)


def track_event(
    event: str,
    *,
    tenant_id: str | None = None,
    properties: dict[str, Any] | None = None,
) -> None:
    """Emit product analytics events (structured logs; wire PostHog when configured)."""
    if event not in PRD_EVENTS:
        logger.debug("Unknown telemetry event: %s", event)
    payload = {
        "event": event,
        "tenantId": tenant_id,
        "properties": properties or {},
    }
    logger.info("telemetry %s", json.dumps(payload, default=str))
    posthog_key = os.environ.get("POSTHOG_API_KEY")
    if not posthog_key:
        return
    try:
        import urllib.request

        body = json.dumps(
            {
                "api_key": posthog_key,
                "event": event,
                "distinct_id": tenant_id or "anonymous",
                "properties": {**(properties or {}), "tenantId": tenant_id},
            }
        ).encode()
        req = urllib.request.Request(
            os.environ.get("POSTHOG_HOST", "https://us.i.posthog.com") + "/capture/",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception as exc:
        logger.debug("PostHog capture skipped: %s", exc)
