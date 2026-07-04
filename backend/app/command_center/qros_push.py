"""Deliver QROS morning briefing via tenant webhooks (Slack-compatible)."""

from __future__ import annotations

from typing import Any

from app.notifications.webhook_store import active_webhook_urls
from app.notifications.webhooks import deliver_webhook


def deliver_morning_briefing(
    *,
    tenant_id: str,
    briefing: dict[str, Any],
    channels: list[str] | None = None,
) -> dict[str, Any]:
    """POST briefing to configured webhook URLs (Slack incoming webhooks supported)."""
    urls = active_webhook_urls(tenant_id=tenant_id, event="briefing")
    if not urls:
        urls = active_webhook_urls(tenant_id=tenant_id)
    if channels:
        # Filter to slack-like URLs when slack channel requested
        if "slack" in channels:
            urls = [u for u in urls if "hooks.slack.com" in u] or urls
    if not urls:
        return {"delivered": 0, "reason": "no_webhooks_configured"}

    payload = {
        "event": "qros_morning_briefing",
        "headline": briefing.get("headline"),
        "bullets": briefing.get("bullets", []),
        "methodNote": briefing.get("methodNote"),
        "text": briefing.get("headline"),
    }
    delivered = 0
    errors: list[str] = []
    for url in urls[:5]:
        result = deliver_webhook(url, payload, tenant_id=tenant_id)
        if result.get("ok"):
            delivered += 1
        else:
            errors.append(str(result.get("reason") or "delivery_failed"))
    return {"delivered": delivered, "attempted": len(urls[:5]), "errors": errors}
