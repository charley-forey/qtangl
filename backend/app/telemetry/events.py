from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger("qtangl.telemetry")

DASHBOARD_EVENTS = frozenset(
    {
        "dashboard_loaded",
        "dashboard_ttfv",
        "dashboard_tab_changed",
        "recommendation_clicked",
        "recommendation_dismissed",
        "alert_clicked",
        "alert_resolved",
        "alert_dismissed",
        "verify_fix_started",
        "verify_fix_succeeded",
        "milestone_recorded",
        "tour_completed",
        "checkout_started",
        "scan_complete",
        "schedule_created",
        "board_export",
        "dashboard_bulk_export",
        "dashboard_export",
        "passport_created",
        "evidence_retained",
        "dashboard_tab_loaded",
        "dashboard_batch_scan_started",
        "dashboard_batch_scan_complete",
        "dashboard_portfolio_click",
        "copilot_prompt",
        "nps_submitted",
        "nps_dismissed",
    }
)

PRD_EVENTS = frozenset(
    {
        "schedule_created",
        "scan_completed",
        "alert_fired",
        "webhook_dlq_recorded",
        "remediation_verified",
        "tier_upgrade_clicked",
        "report_verified",
        "report_verified_third_party",
        "verify_cli_ping",
        "passport_opened",
        "passport_viewed",
        "cloud_pull_completed",
        "cbom_ingested",
        "cbom_merged",
        "cbom_conflict_opened",
        "cbom_conflict_resolved",
        "aggregated_cbom_exported",
        "integration_connected",
        "tenant_drip_sent",
    }
    | DASHBOARD_EVENTS
)


def is_allowed_event(event: str) -> bool:
    return event in PRD_EVENTS


def track_event(
    event: str,
    *,
    tenant_id: str | None = None,
    properties: dict[str, Any] | None = None,
) -> None:
    """Emit product analytics events (structured logs; wire PostHog when configured)."""
    if not is_allowed_event(event):
        logger.debug("Unknown telemetry event: %s", event)
        return
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
