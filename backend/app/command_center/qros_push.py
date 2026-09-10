"""Deliver briefings only to explicitly selected tenant destinations."""

from __future__ import annotations

from typing import Any

from pydantic import TypeAdapter, ValidationError

from app.command_center.schemas import BriefingRecipient

from app.notifications.email import send_simple_email
from app.notifications.webhook_store import active_webhook_urls
from app.notifications.webhooks import deliver_webhook, is_slack_webhook

_EMAILS = TypeAdapter(list[BriefingRecipient])
_CHANNELS = {"email", "slack", "teams", "webhook"}


def briefing_destinations(*, tenant_id: str, channels: list[str] | None, recipients: list[str] | None = None) -> tuple[list[str], dict[str, str], list[str]]:
    selected = set(channels if channels is not None else ["webhook"])
    errors: list[str] = []
    if not selected or not selected <= _CHANNELS:
        return [], {}, ["Select supported delivery channels."]
    emails: list[str] = []
    if "email" in selected:
        try:
            emails = list(dict.fromkeys(str(email) for email in _EMAILS.validate_python(recipients or [])))
        except ValidationError:
            errors.append("Email recipients are invalid.")
        if not emails:
            errors.append("Email delivery requires explicit recipients.")

    destinations: dict[str, str] = {}
    legacy = active_webhook_urls(tenant_id=tenant_id, event="briefing") if selected - {"email"} else []
    for channel in sorted(selected - {"email"}):
        urls = active_webhook_urls(tenant_id=tenant_id, event=f"briefing.{channel}")
        if channel == "slack":
            urls += [url for url in legacy if is_slack_webhook(url)]
            if any(not is_slack_webhook(url) for url in urls):
                errors.append("Slack subscriptions must use a Slack webhook URL.")
        elif channel == "webhook":
            urls += [url for url in legacy if not is_slack_webhook(url)]
        if not urls:
            errors.append(f"No {channel} briefing destinations are configured.")
        for url in urls:
            if channel != "slack" and is_slack_webhook(url):
                errors.append("Slack webhook destinations require the Slack channel.")
            if url in destinations and destinations[url] != channel:
                errors.append("A destination is subscribed to multiple selected briefing channels.")
            destinations[url] = channel
    return emails, destinations, list(dict.fromkeys(errors))


def deliver_morning_briefing(
    *,
    tenant_id: str,
    briefing: dict[str, Any],
    channels: list[str] | None = None,
    recipients: list[str] | None = None,
    signing_secret: str = "",
    delivery_id: str | None = None,
) -> dict[str, Any]:
    emails, destinations, errors = briefing_destinations(tenant_id=tenant_id, channels=channels, recipients=recipients)
    if errors:
        reason = "invalid_channels" if not channels or not set(channels) <= _CHANNELS else "delivery_not_configured"
        return {"delivered": 0, "attempted": 0, "errors": errors, "reason": reason}

    payload = {
        "event": "qros_morning_briefing",
        "tenantId": tenant_id,
        "headline": briefing.get("headline"),
        "bullets": briefing.get("bullets", []),
        "methodNote": briefing.get("methodNote"),
        "text": briefing.get("headline"),
    }
    if delivery_id:
        payload["deliveryId"] = delivery_id
    lines = [str(briefing.get("headline") or "Qtangl morning briefing")]
    lines.extend(f"• {bullet}" for bullet in briefing.get("bullets") or [])
    if briefing.get("methodNote"):
        lines.append(str(briefing["methodNote"]))
    text = "\n".join(lines)
    delivered = 0
    for recipient in emails:
        result = send_simple_email(to_email=recipient, subject="Qtangl morning briefing", body=text)
        if result.get("sent"):
            delivered += 1
        else:
            errors.append(
                "Email delivery is unavailable until SMTP is configured."
                if result.get("reason") == "smtp_unconfigured"
                else "Email delivery failed. Check notification settings."
            )
    for url, channel in destinations.items():
        body = payload
        if channel == "teams":
            body = {
                **payload,
                "type": "message",
                "text": text,
                "attachments": [{
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "contentUrl": None,
                    "content": {
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "type": "AdaptiveCard", "version": "1.2",
                        "body": [{"type": "TextBlock", "text": line, "wrap": True} for line in lines],
                    },
                }],
            }
        result = deliver_webhook(url, body, tenant_id=tenant_id, signing_secret=signing_secret)
        if result.get("sent"):
            delivered += 1
        else:
            errors.append(f"{channel}: delivery failed. Check the destination configuration.")
    return {"delivered": delivered, "attempted": len(destinations) + len(emails), "errors": errors}


def qros_summary_snapshot(*, tenant_id: str, role: str = "operator") -> dict[str, Any]:
    from app.store.scan_jobs import list_jobs_for_tenant, load_scan_bundle
    from app.store.tenant_alerts import list_alerts
    from app.monitoring.anomaly import forecast_readiness
    from app.recommendations.service import build_recommendations
    from app.remediation.service import remediation_velocity

    jobs = list_jobs_for_tenant(tenant_id=tenant_id, limit=20)
    latest = next((j for j in jobs if j.get("readinessScore") is not None), None)
    prior = next(
        (j for j in jobs if j.get("readinessScore") is not None and j != latest),
        None,
    )
    delta = None
    if latest and prior:
        delta = int(latest["readinessScore"]) - int(prior["readinessScore"])
    open_critical = 0
    if latest:
        bundle = load_scan_bundle(latest["scanId"], tenant_id=tenant_id)
        report = (bundle or {}).get("report") or {}
        open_critical = int(report.get("openCriticalCount") or 0)
    scores = [float(job["readinessScore"]) for job in list_jobs_for_tenant(tenant_id=tenant_id, limit=50) if job.get("readinessScore") is not None]
    scores.reverse()
    forecast = forecast_readiness(scores=scores) if scores else {}
    alerts = list_alerts(tenant_id=tenant_id, since_days=14, include_resolved=False)
    velocity = remediation_velocity(tenant_id=tenant_id)
    recommendations = build_recommendations(tenant_id=tenant_id, role=role)
    return {
        "kpis": {
            "latestReadiness": latest.get("readinessScore") if latest else None,
            "delta": delta,
            "openCritical": open_critical,
        },
        "alerts": alerts,
        "recommendations": recommendations,
        "remediationVelocity": velocity,
        "forecast": forecast,
        "maturity": {},
        "latestScanId": latest.get("scanId") if latest else None,
    }



def build_briefing_for_tenant(*, tenant_id: str) -> dict[str, Any]:
    from app.command_center.qros import build_morning_briefing

    return build_morning_briefing(
        tenant_id=tenant_id, persona="operator", owner="operator",
        summary=qros_summary_snapshot(tenant_id=tenant_id),
    )


def save_briefing_preferences(*, tenant_id: str, preferences: dict[str, Any]) -> dict[str, Any]:
    from datetime import datetime, timedelta, timezone
    from uuid import uuid4

    from app.db.engine import db_session
    from app.db.models import TenantSettings
    from app.security.secrets import decrypt_json_blob, encrypt_json_blob

    now = datetime.now(timezone.utc)
    with db_session() as session:
        row = session.query(TenantSettings).filter_by(tenant_id=tenant_id).with_for_update().one_or_none()
        settings = decrypt_json_blob(row.settings_json or "{}") if row else {}
        prior = settings.get("pushBriefing") or {}
        saved = dict(preferences)
        if all(prior.get(key) == value for key, value in preferences.items()) and prior.get("revision") and prior.get("firstRunAt"):
            saved.update(revision=prior["revision"], firstRunAt=prior["firstRunAt"])
        else:
            saved.update(revision=str(uuid4()), firstRunAt=(now + timedelta(hours=preferences["cadenceHours"])).isoformat())
        settings["pushBriefing"] = saved
        if row is None:
            session.add(TenantSettings(tenant_id=tenant_id, settings_json=encrypt_json_blob(settings), updated_at=now))
        else:
            row.settings_json = encrypt_json_blob(settings)
            row.updated_at = now
    return saved
