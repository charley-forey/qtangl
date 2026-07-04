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

COMMAND_CENTER_EVENTS = frozenset(
    {
        "cc_tab_viewed",
        "cc_metric_drilled",
        "cc_chart_interacted",
        "cc_verify_opened",
        "cc_verify_result",
        "cc_onboarding_step",
        "cc_upgrade_cta_clicked",
        "cc_upgrade_started",
        "cc_schedule_created",
        "cc_alert_resolved",
        "cc_health_degraded_shown",
        "cc_forecast_viewed",
        "cc_cadence_recommended",
        "cc_cadence_applied",
        "cc_incident_expanded",
        "cc_anomaly_viewed",
        "cc_inbox_opened",
        "cc_inbox_item_clicked",
        "cc_comment_added",
        "cc_comment_deleted",
        "cc_war_room_created",
        "cc_transparency_viewed",
        "cc_auditor_packet_created",
        "cc_saved_view_applied",
        "cc_saved_view_saved",
        "cc_saved_view_deleted",
        "cc_widget_reordered",
        "cc_milestone_celebrated",
        "cc_drift_intel_viewed",
        "cc_notification_prefs_saved",
        "cc_mobile_triage_action",
        "cc_webhook_saved",
        "cc_nl_query_submitted",
        "cc_executive_narrative_viewed",
        "cc_trust_page_shared",
        "cc_partner_qbr_export",
        "cc_ai_pr_draft",
        "cc_agentic_plan_viewed",
        "cc_qros_nba_action",
        "cc_qros_lens_applied",
        "cc_qros_runway_scenario",
        "cc_qros_board_export",
        "cc_qros_agentic_approved",
        "cc_qros_marketplace_install",
    }
)

PARTNER_EVENTS = frozenset(
    {
        "partner_bulk_digest",
        "partner_bulk_schedule",
        "partner_deal_registered",
        "partner_portfolio_board_export",
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
    | COMMAND_CENTER_EVENTS
    | PARTNER_EVENTS
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
