from __future__ import annotations

import html
import logging
import os
from typing import Any

from app.notifications.email import smtp_configured

logger = logging.getLogger(__name__)


def build_weekly_digest_html(
    *,
    tenant_id: str,
    digest: dict[str, Any],
    child_summaries: list[dict[str, Any]] | None = None,
) -> str:
    wins = digest.get("wins") or []
    risks = digest.get("risks") or []
    focus = digest.get("nextWeekFocus") or []
    top_risks = digest.get("topCryptoRisks") or []
    narrative = digest.get("narrative") or ""
    headline = digest.get("headline") or "Weekly executive digest"
    since_board = digest.get("sinceLastBoardMeeting") or ""

    def _list(items: list[str]) -> str:
        if not items:
            return "<p><em>None this period.</em></p>"
        return "<ul>" + "".join(f"<li>{html.escape(str(item))}</li>" for item in items) + "</ul>"

    child_block = ""
    if child_summaries:
        rows = "".join(
            (
                "<tr>"
                f"<td>{html.escape(str(row.get('childTenantName') or row.get('tenantName') or row.get('childTenantId', '')))}</td>"
                f"<td>{html.escape(str(row.get('latestReadiness', '—')))}</td>"
                f"<td>{html.escape(str(row.get('latestBand', '—')))}</td>"
                "</tr>"
            )
            for row in child_summaries
        )
        child_block = f"""
        <h2>Portfolio customers</h2>
        <table border="1" cellpadding="6" cellspacing="0">
          <tr><th>Customer</th><th>Readiness</th><th>Band</th></tr>
          {rows}
        </table>
        """

    return f"""<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; color: #111;">
  <h1>{html.escape(headline)}</h1>
  <p><strong>Tenant:</strong> {html.escape(tenant_id)}</p>
  <p>{html.escape(narrative)}</p>
  <p><em>{html.escape(since_board)}</em></p>
  <h2>Wins</h2>
  {_list([str(w) for w in wins])}
  <h2>Risks</h2>
  {_list([str(r) for r in risks])}
  <h2>Top crypto risks</h2>
  {_list([str(r) for r in top_risks])}
  <h2>Next week focus</h2>
  {_list([str(f) for f in focus])}
  {child_block}
  <p style="color:#666;font-size:12px;">Qtangl weekly executive digest — do not forward externally.</p>
</body>
</html>"""


def send_weekly_digest_email(
    *,
    to_email: str,
    tenant_id: str,
    digest: dict[str, Any],
    child_summaries: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    import smtplib
    from email.message import EmailMessage

    host = os.environ.get("QTANGL_SMTP_HOST")
    if not host:
        logger.info("Digest email no-op (SMTP unconfigured): tenant=%s to=%s", tenant_id, to_email)
        return {"sent": False, "reason": "smtp_unconfigured", "to": to_email}

    html_body = build_weekly_digest_html(
        tenant_id=tenant_id,
        digest=digest,
        child_summaries=child_summaries,
    )
    port = int(os.environ.get("QTANGL_SMTP_PORT", "587"))
    user = os.environ.get("QTANGL_SMTP_USER", "")
    password = os.environ.get("QTANGL_SMTP_PASSWORD", "")
    from_addr = os.environ.get("QTANGL_SMTP_FROM", user or "reports@qtangl.com")
    subject = f"Qtangl weekly digest — {digest.get('headline', tenant_id)}"

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_addr
    message["To"] = to_email
    message.set_content("Your Qtangl weekly digest is available in HTML format.")
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            if user and password:
                server.login(user, password)
            server.send_message(message)
        logger.info("Digest email sent tenant=%s to=%s", tenant_id, to_email)
        return {"sent": True, "to": to_email}
    except Exception as exc:
        logger.warning("Digest email failed tenant=%s: %s", tenant_id, exc)
        return {"sent": False, "reason": str(exc), "to": to_email}


def process_due_weekly_digests() -> int:
    """Send weekly digests for tenants with weeklyDigestEnabled. Returns count sent."""
    if not smtp_configured():
        return 0
    from datetime import datetime, timezone

    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantSettings as TenantSettingsRow
    from app.partner.service import list_child_tenants
    from app.portfolio.service import weekly_executive_digest
    from app.security.secrets import decrypt_json_blob
    from app.tenant.settings import DEFAULT_SETTINGS, upsert_tenant_settings

    if not persistence_enabled():
        return 0

    now = datetime.now(timezone.utc)
    target_dow = now.weekday()
    sent = 0
    with db_session() as session:
        rows = session.query(TenantSettingsRow).all()
        for row in rows:
            settings = dict(DEFAULT_SETTINGS)
            settings.update(decrypt_json_blob(row.settings_json or "{}"))
            if not settings.get("weeklyDigestEnabled"):
                continue
            if int(settings.get("weeklyDigestDayOfWeek", 1)) != target_dow:
                continue
            recipients = settings.get("weeklyDigestRecipients") or []
            if not recipients:
                continue
            digest = weekly_executive_digest(tenant_id=row.tenant_id)
            children = list_child_tenants(parent_tenant_id=row.tenant_id)
            child_summaries: list[dict[str, Any]] = []
            if children:
                from app.store.scan_jobs import list_jobs_for_tenant as list_scans

                for child in children:
                    child_id = str(child.get("childTenantId", ""))
                    if not child_id:
                        continue
                    metrics_scans = list_scans(tenant_id=child_id, limit=5)
                    latest = next((s for s in metrics_scans if s.get("readinessScore") is not None), None)
                    child_summaries.append(
                        {
                            "childTenantId": child_id,
                            "childTenantName": child.get("childTenantName"),
                            "latestReadiness": latest.get("readinessScore") if latest else None,
                            "latestBand": latest.get("readinessBand") if latest else None,
                        }
                    )
            for recipient in recipients[:10]:
                result = send_weekly_digest_email(
                    to_email=str(recipient),
                    tenant_id=row.tenant_id,
                    digest=digest,
                    child_summaries=child_summaries,
                )
                if result.get("sent"):
                    sent += 1
            upsert_tenant_settings(
                tenant_id=row.tenant_id,
                settings={"lastWeeklyDigestAt": now.isoformat()},
            )
    return sent


def process_due_board_exports() -> int:
    """Send scheduled board pack emails when boardExportSchedule.enabled."""
    if not smtp_configured():
        return 0
    from datetime import datetime, timedelta, timezone

    from app.db.config import persistence_enabled
    from app.db.engine import db_session
    from app.db.models import TenantSettings as TenantSettingsRow
    from app.notifications.email import send_report_email
    from app.security.secrets import decrypt_json_blob
    from app.store.scan_jobs import list_jobs_for_tenant
    from app.tenant.settings import DEFAULT_SETTINGS, upsert_tenant_settings

    if not persistence_enabled():
        return 0

    now = datetime.now(timezone.utc)
    sent = 0
    with db_session() as session:
        rows = session.query(TenantSettingsRow).all()
        for row in rows:
            settings = dict(DEFAULT_SETTINGS)
            settings.update(decrypt_json_blob(row.settings_json or "{}"))
            schedule = settings.get("boardExportSchedule") or {}
            if not schedule.get("enabled"):
                continue
            cadence_days = int(schedule.get("cadenceDays") or 7)
            last_at_raw = settings.get("lastBoardExportAt")
            if last_at_raw:
                try:
                    last_at = datetime.fromisoformat(str(last_at_raw).replace("Z", "+00:00"))
                    if now - last_at < timedelta(days=cadence_days):
                        continue
                except ValueError:
                    pass
            recipients = schedule.get("recipients") or []
            if not recipients:
                continue
            latest = next(
                (s for s in list_jobs_for_tenant(tenant_id=row.tenant_id, limit=10) if s.get("status") == "done"),
                None,
            )
            if not latest:
                continue
            scan_id = str(latest["scanId"])
            report_url = f"/tenant/scans/{scan_id}/report?format=board"
            for recipient in recipients[:5]:
                result = send_report_email(
                    to_email=str(recipient),
                    scan_id=scan_id,
                    target_domain=str(latest.get("targetDomain") or scan_id),
                    report_url=report_url,
                    readiness_band=str(latest.get("readinessBand") or ""),
                    subject_prefix="[Scheduled board pack]",
                )
                if result.get("sent"):
                    sent += 1
            upsert_tenant_settings(
                tenant_id=row.tenant_id,
                settings={"lastBoardExportAt": now.isoformat()},
            )
    return sent
