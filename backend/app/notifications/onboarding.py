from __future__ import annotations

import logging
from typing import Any

from app.notifications.email import smtp_configured, send_report_email

logger = logging.getLogger(__name__)

# Mini-assessment drip sequence — subjects and copy live in docs/gtm/onboarding-drip.md
ONBOARDING_DRIP_SUBJECTS = [
    "Your Q-Day readiness snapshot",
    "Three assets to prioritize first",
    "How to verify a signed Qtangl report",
    "Schedule monitoring before drift hits",
    "Book a 20-minute readiness review",
]


def send_onboarding_email(
    *,
    to_email: str,
    step: int,
    assess_url: str = "https://www.qtangl.com/assess/mini",
    verify_url: str = "https://www.qtangl.com/verify",
) -> dict[str, Any]:
    """Send a mini-assessment onboarding drip email (stub — SMTP required for delivery).

    step: 1–5 matching ONBOARDING_DRIP_SUBJECTS index.
    """
    if step < 1 or step > len(ONBOARDING_DRIP_SUBJECTS):
        return {"sent": False, "reason": "invalid_step", "step": step}

    subject = ONBOARDING_DRIP_SUBJECTS[step - 1]
    bodies = {
        1: (
            f"Thanks for starting the Qtangl mini-assessment.\n\n"
            f"Continue your snapshot: {assess_url}\n\n"
            "You'll receive a readiness band and top remediation themes."
        ),
        2: (
            "Most teams start with TLS certificates on public-facing domains, "
            "long-lived signing keys, and VPN concentrators.\n\n"
            f"Re-run or deepen your scan: {assess_url}"
        ),
        3: (
            f"Every Qtangl report includes a content hash and signature. "
            f"Verify independently: {verify_url}\n\n"
            "See docs/verify-spec.md for the open verification algorithm."
        ),
        4: (
            "Cryptographic drift is silent until a compliance audit. "
            "Monitor tier supports weekly re-scans and webhook alerts.\n\n"
            "Explore Monitor: https://www.qtangl.com/pricing"
        ),
        5: (
            "Ready for a tailored walkthrough? Book 20 minutes with our team.\n\n"
            "https://www.qtangl.com/access"
        ),
    }
    body = bodies[step]

    if not smtp_configured():
        logger.info(
            "Onboarding drip no-op (SMTP unconfigured): step=%s to=%s subject=%s",
            step,
            to_email,
            subject,
        )
        return {"sent": False, "reason": "smtp_unconfigured", "step": step, "subject": subject}

    # Reuse transactional email transport with custom subject/body
    return send_report_email(
        to_email=to_email,
        scan_id=f"onboarding-step-{step}",
        target_domain="mini-assessment",
        report_url=assess_url,
        subject_prefix=f"[{step}/{len(ONBOARDING_DRIP_SUBJECTS)}]",
        body_extra=body,
    )
