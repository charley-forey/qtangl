from __future__ import annotations

import logging
import os
from typing import Any

from app.monitoring.alerts import evaluate_scan_alerts, should_send_regression_email
from app.monitoring.diff import compare_scan_bundles
from app.notifications.email import send_report_email
from app.notifications.webhook_store import active_webhook_urls
from app.notifications.webhooks import notify_scan_complete_v2
from app.pqc.models import ScanBundle
from app.pqc.report import report_to_json
from app.pqc.signing import sign_report_payload
from app.pqc.serialize import serialize_bundle
from app.store.scan_jobs import find_previous_scan, load_scan_bundle

logger = logging.getLogger(__name__)


def enrich_completed_scan(scan_id: str, bundle: ScanBundle, *, tenant_id: str) -> ScanBundle:
    """Attach scan diff, re-sign report, and dispatch alerts/webhooks."""
    try:
        return _enrich_completed_scan(scan_id, bundle, tenant_id=tenant_id)
    except Exception:
        logger.exception(
            "post_scan_enrichment_failed scan_id=%s tenant_id=%s — returning unsigned bundle",
            scan_id,
            tenant_id,
        )
        json_payload = report_to_json(bundle.report)
        bundle.report.signature = sign_report_payload(json_payload)
        from app.pqc.transparency import safe_append_after_sign

        safe_append_after_sign(json_payload, bundle.report.signature or {}, tenant_id=tenant_id)
        return bundle


def _enrich_completed_scan(scan_id: str, bundle: ScanBundle, *, tenant_id: str) -> ScanBundle:
    target = bundle.report.target_domain
    scenario_id = bundle.scenario.id
    previous_id = find_previous_scan(
        tenant_id=tenant_id,
        target_domain=target,
        scenario_id=scenario_id,
        exclude_scan_id=scan_id,
    )

    scan_diff: dict[str, Any] | None = None
    if previous_id:
        previous_bundle = load_scan_bundle(previous_id, tenant_id=tenant_id)
        current_dict = serialize_bundle(bundle)
        if previous_bundle:
            scan_diff = compare_scan_bundles(
                current_dict,
                previous_bundle,
                previous_scan_id=previous_id,
            )
            bundle.report.previous_scan_id = previous_id
            bundle.report.scan_diff = scan_diff

    json_payload = report_to_json(bundle.report)
    try:
        from app.cbom.service import get_aggregate

        aggregate = get_aggregate(tenant_id=tenant_id, sync_scan=True)
        json_payload["aggregatedCbomSummary"] = {
            "componentCount": aggregate.get("componentCount"),
            "totalStored": aggregate.get("totalStored"),
            "verifiedPct": (aggregate.get("readiness") or {}).get("verifiedPct"),
            "sourceCount": len(aggregate.get("sources") or []),
            "openConflicts": aggregate.get("openConflicts"),
        }
    except Exception:
        logger.debug("aggregatedCbomSummary skipped for scan_id=%s", scan_id)

    from app.tenant.settings import get_tenant_settings_raw

    settings = get_tenant_settings_raw(tenant_id=tenant_id)
    if settings.get("benchmarkOptIn"):
        try:
            from app.data.benchmarks import compare_to_benchmark

            industry = str(settings.get("industry") or "financial")
            peer = compare_to_benchmark(score=bundle.report.readiness_score, industry=industry)
            if peer.get("available"):
                json_payload["peerComparison"] = peer
                if bundle.report.executive_summary is not None:
                    bundle.report.executive_summary["peerComparison"] = peer
        except Exception:
            logger.debug("peerComparison skipped for scan_id=%s", scan_id)

    bundle.report.signature = sign_report_payload(json_payload)
    from app.pqc.transparency import safe_append_after_sign

    safe_append_after_sign(json_payload, bundle.report.signature or {}, tenant_id=tenant_id)

    alerts = evaluate_scan_alerts(
        scan_diff=scan_diff,
        readiness_score=bundle.report.readiness_score,
        readiness_band=bundle.report.readiness_band,
        settings=settings,
        assets=bundle.report.assets,
    )

    notify_email = os.environ.get("QTANGL_ALERT_EMAIL")  # optional global ops inbox
    schedule_email = _schedule_notify_email(scan_id, tenant_id)
    recipient = schedule_email or notify_email

    if recipient and scan_diff and should_send_regression_email(alerts):
        base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
        send_report_email(
            to_email=recipient,
            scan_id=scan_id,
            target_domain=target,
            report_url=f"{base}/verify?scanId={scan_id}",
            readiness_band=bundle.report.readiness_band,
            subject_prefix="[Qtangl Alert]",
            body_extra=alerts[0]["message"] if alerts else None,
        )

    urls = active_webhook_urls(tenant_id=tenant_id)
    if urls:
        base = os.environ.get("QTANGL_PUBLIC_URL", "https://www.qtangl.com")
        notify_scan_complete_v2(
            webhooks=urls,
            scan_id=scan_id,
            target_domain=target,
            readiness_score=bundle.report.readiness_score,
            readiness_band=bundle.report.readiness_band,
            scan_diff=scan_diff,
            alerts=alerts,
            verify_url=f"{base}/verify?scanId={scan_id}",
            evidence_zip_url=f"{base}/dashboard",
            tenant_id=tenant_id,
            signing_secret=str(settings.get("webhookSigningSecret", "")),
        )

    if alerts:
        logger.info("Scan %s triggered %d alert(s)", scan_id, len(alerts))
        from app.telemetry.events import track_event

        for alert in alerts:
            if alert.get("severity") in {"high", "critical", "medium"}:
                track_event(
                    "alert_fired",
                    tenant_id=tenant_id,
                    properties={"scanId": scan_id, "rule": alert.get("rule")},
                )
                break

    from app.telemetry.events import track_event

    track_event(
        "scan_completed",
        tenant_id=tenant_id,
        properties={
            "scanId": scan_id,
            "readinessScore": bundle.report.readiness_score,
            "alertCount": len(alerts),
        },
    )

    if settings.get("autoRetainScans"):
        try:
            from app.evidence.vault import retain_scan_evidence

            content_hash = (bundle.report.signature or {}).get("contentHash", "")
            retain_scan_evidence(
                tenant_id=tenant_id,
                scan_id=scan_id,
                content_hash=str(content_hash),
            )
        except Exception:
            logger.debug("auto_retain skipped for scan_id=%s", scan_id)

    return bundle


def _schedule_notify_email(scan_id: str, tenant_id: str) -> str | None:
    from app.store.scan_jobs import get_job_payload

    payload = get_job_payload(scan_id, tenant_id=tenant_id)
    if payload and payload.get("notifyEmail"):
        return str(payload["notifyEmail"])
    return None
