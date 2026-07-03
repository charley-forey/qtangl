from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

_TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"
_DRIP_TEMPLATES = {
    "day0": "tenant_drip_welcome.html",
    "day3": "tenant_drip_monitor.html",
    "day7": "tenant_drip_team.html",
}


def _load_template(name: str) -> str:
    path = _TEMPLATE_DIR / name
    return path.read_text(encoding="utf-8")


def _render_drip_html(*, key: str, body: str, dashboard_url: str, opt_out_url: str) -> str:
    template_name = _DRIP_TEMPLATES.get(key, "tenant_drip_welcome.html")
    template = _load_template(template_name)
    return (
        template.replace("{{ body }}", body)
        .replace("{{ dashboard_url }}", dashboard_url)
        .replace("{{ opt_out_url }}", opt_out_url)
    )


def _resolve_tenant_admin_email(*, tenant_id: str, settings: dict) -> str | None:
    recipients = settings.get("weeklyDigestRecipients") or []
    if recipients:
        return str(recipients[0])
    try:
        from app.db.config import persistence_enabled
        from app.db.engine import db_session
        from app.db.models import TenantMembership, User

        if not persistence_enabled():
            return None
        with db_session() as session:
            row = (
                session.query(User)
                .join(TenantMembership, TenantMembership.user_id == User.id)
                .filter(TenantMembership.tenant_id == tenant_id, TenantMembership.role == "admin")
                .order_by(TenantMembership.created_at.asc())
                .first()
            )
            if row and row.email:
                return str(row.email)
    except Exception:
        logger.debug("admin email lookup failed tenant=%s", tenant_id)
    return None


def process_due_tenant_drip_emails() -> int:
    """Send lifecycle emails to signed-in tenants (Day 0/3/7 milestones)."""
    if not os.environ.get("QTANGL_SMTP_HOST"):
        return 0

    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import Tenant as TenantRow
    from app.monitoring.service import list_schedules
    from app.notifications.email import send_html_email, send_simple_email
    from app.store.scan_jobs import list_jobs_for_tenant
    from app.telemetry.events import track_event
    from app.tenant.settings import get_tenant_settings_raw, upsert_tenant_settings

    if not persistence_enabled():
        return 0

    sent = 0
    now = datetime.now(timezone.utc)
    base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
    with db_session() as session:
        tenants = session.query(TenantRow).limit(500).all()

    for tenant in tenants:
        tenant_id = tenant.id
        settings = get_tenant_settings_raw(tenant_id=tenant_id)
        coaching = settings.get("coaching") or {}
        if coaching.get("dripOptOut"):
            continue

        to_email = _resolve_tenant_admin_email(tenant_id=tenant_id, settings=settings)
        if not to_email:
            continue

        created = tenant.created_at or now
        age_days = (now - created).days
        drip_sent = set(coaching.get("dripSent") or [])
        scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=5)
        has_scan = any(s.get("status") == "done" for s in scans)
        schedules = list_schedules(tenant_id=tenant_id)

        campaigns: list[tuple[str, int, str, str]] = [
            ("day0", 0, "Welcome — run your baseline scan", "Complete your first authorized scan to unlock readiness insights."),
            ("day3", 3, "Enable monitoring", "Schedule weekly re-scans to catch crypto drift before audits."),
            ("day7", 7, "Invite your team", "Add Executive and Operator teammates for accountability."),
        ]

        opt_out_url = f"{base}/command-center?tab=settings&action=drip-opt-out"

        for key, min_day, subject, body in campaigns:
            if age_days >= min_day and key not in drip_sent:
                if key == "day0" and has_scan:
                    drip_sent.add(key)
                    continue
                if key == "day3" and schedules:
                    drip_sent.add(key)
                    continue
                try:
                    dashboard_url = f"{base}/command-center"
                    html = _render_drip_html(
                        key=key,
                        body=body,
                        dashboard_url=dashboard_url,
                        opt_out_url=opt_out_url,
                    )
                    result = send_html_email(
                        to_email=to_email,
                        subject=f"[Qtangl] {subject}",
                        html_body=html,
                        text_body=f"{body}\n\nOpen dashboard: {dashboard_url}\n",
                    )
                    if not result.get("sent"):
                        send_simple_email(
                            to_email=to_email,
                            subject=f"[Qtangl] {subject}",
                            body=f"{body}\n\nOpen dashboard: {dashboard_url}\n",
                        )
                    drip_sent.add(key)
                    sent += 1
                    track_event(
                        "tenant_drip_sent",
                        tenant_id=tenant_id,
                        properties={"campaign": key, "to": to_email},
                    )
                except Exception:
                    logger.debug("tenant drip skipped tenant=%s key=%s", tenant_id, key)

        upsert_tenant_settings(
            tenant_id=tenant_id,
            settings={"coaching": {**coaching, "dripSent": list(drip_sent)}},
        )

    return sent


def process_daily_alert_digests() -> int:
    """Batch drift/scan alerts for tenants with alertMode=daily_digest."""
    if not os.environ.get("QTANGL_SMTP_HOST"):
        return 0

    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantSettings as TenantSettingsRow
    from app.notifications.email import send_simple_email
    from app.security.secrets import decrypt_json_blob
    from app.store.tenant_alerts import list_alerts
    from app.tenant.settings import upsert_tenant_settings

    if not persistence_enabled():
        return 0

    sent = 0
    with db_session() as session:
        rows = session.query(TenantSettingsRow).all()

    for row in rows:
        settings = decrypt_json_blob(row.settings_json or "{}")
        if settings.get("alertMode") != "daily_digest":
            continue
        recipients = settings.get("weeklyDigestRecipients") or []
        if not recipients:
            continue
        alerts = list_alerts(tenant_id=row.tenant_id, since_days=1, unread_only=True)
        if not alerts:
            continue
        lines = [f"- [{a.get('severity')}] {a.get('message')}" for a in alerts[:15]]
        try:
            send_simple_email(
                to_email=recipients[0],
                subject="[Qtangl] Daily monitor digest",
                body="Alerts in the last 24 hours:\n\n" + "\n".join(lines),
            )
            upsert_tenant_settings(
                tenant_id=row.tenant_id,
                settings={"lastDailyAlertDigestAt": datetime.now(timezone.utc).isoformat()},
            )
            sent += 1
        except Exception:
            logger.debug("daily alert digest failed tenant=%s", row.tenant_id)

    return sent
