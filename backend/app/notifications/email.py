from __future__ import annotations

import logging
import os
import smtplib
from email.message import EmailMessage
from typing import Any

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(os.environ.get("QTANGL_SMTP_HOST"))


def send_report_email(
    *,
    to_email: str,
    scan_id: str,
    target_domain: str,
    report_url: str,
    readiness_band: str = "",
    subject_prefix: str = "",
    body_extra: str | None = None,
) -> dict[str, Any]:
    """Send scan completion email. No-op + log when SMTP is unconfigured."""
    host = os.environ.get("QTANGL_SMTP_HOST")
    if not host:
        logger.info(
            "Email no-op (SMTP unconfigured): scan=%s to=%s url=%s",
            scan_id,
            to_email,
            report_url,
        )
        return {"sent": False, "reason": "smtp_unconfigured", "scanId": scan_id}

    port = int(os.environ.get("QTANGL_SMTP_PORT", "587"))
    user = os.environ.get("QTANGL_SMTP_USER", "")
    password = os.environ.get("QTANGL_SMTP_PASSWORD", "")
    from_addr = os.environ.get("QTANGL_SMTP_FROM", user or "reports@qtangl.com")

    subject = f"{subject_prefix} Your Q-Day report is ready — {target_domain}".strip()
    body = (
        f"Your Qtangl Q-Day readiness scan ({scan_id}) for {target_domain} is complete.\n\n"
        f"Readiness band: {readiness_band or 'See report'}\n\n"
    )
    if body_extra:
        body += f"Alert: {body_extra}\n\n"
    body += (
        f"Download your report: {report_url}\n\n"
        "This link requires your tenant API key. Do not forward publicly.\n"
    )

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_addr
    message["To"] = to_email
    message.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            if user and password:
                server.login(user, password)
            server.send_message(message)
        logger.info("Report email sent scan=%s to=%s", scan_id, to_email)
        return {"sent": True, "scanId": scan_id, "to": to_email}
    except Exception as exc:
        logger.warning("Report email failed scan=%s: %s", scan_id, exc)
        return {"sent": False, "reason": str(exc), "scanId": scan_id}


def send_html_email(
    *,
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
) -> dict[str, Any]:
    """Send multipart HTML + plain-text email."""
    if not smtp_configured():
        logger.info("Email no-op (SMTP unconfigured): to=%s subject=%s", to_email, subject)
        return {"sent": False, "reason": "smtp_unconfigured"}

    host = os.environ.get("QTANGL_SMTP_HOST", "")
    port = int(os.environ.get("QTANGL_SMTP_PORT", "587"))
    user = os.environ.get("QTANGL_SMTP_USER", "")
    password = os.environ.get("QTANGL_SMTP_PASSWORD", "")
    from_addr = os.environ.get("QTANGL_SMTP_FROM", user or "reports@qtangl.com")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_addr
    message["To"] = to_email
    message.set_content(text_body or subject)
    message.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            if user and password:
                server.login(user, password)
            server.send_message(message)
        return {"sent": True, "to": to_email}
    except Exception as exc:
        logger.warning("HTML email failed to=%s: %s", to_email, exc)
        return {"sent": False, "reason": str(exc)}


def send_simple_email(*, to_email: str, subject: str, body: str) -> dict[str, Any]:
    """Send a plain-text notification email."""
    if not smtp_configured():
        logger.info("Email no-op (SMTP unconfigured): to=%s subject=%s", to_email, subject)
        return {"sent": False, "reason": "smtp_unconfigured"}

    host = os.environ.get("QTANGL_SMTP_HOST", "")
    port = int(os.environ.get("QTANGL_SMTP_PORT", "587"))
    user = os.environ.get("QTANGL_SMTP_USER", "")
    password = os.environ.get("QTANGL_SMTP_PASSWORD", "")
    from_addr = os.environ.get("QTANGL_SMTP_FROM", user or "reports@qtangl.com")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_addr
    message["To"] = to_email
    message.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            if user and password:
                server.login(user, password)
            server.send_message(message)
        return {"sent": True, "to": to_email}
    except Exception as exc:
        logger.warning("Simple email failed to=%s: %s", to_email, exc)
        return {"sent": False, "reason": str(exc)}
