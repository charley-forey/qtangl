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


def _sign_report_for_storage(bundle: ScanBundle) -> dict[str, Any]:
    """Sign the report body that will actually be persisted.

    The build step may already have attached a signature; clearing it first ensures the
    signed payload has no ``signature`` key, exactly matching what public verification
    reconstructs (stored report minus ``signature``). Returns the signed canonical payload
    for transparency-log anchoring.
    """
    bundle.report.signature = None
    json_payload = report_to_json(bundle.report)
    bundle.report.signature = sign_report_payload(json_payload)
    return json_payload


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
        json_payload = _sign_report_for_storage(bundle)
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

    try:
        from app.cbom.service import get_aggregate

        aggregate = get_aggregate(tenant_id=tenant_id, sync_scan=True)
        # Supplementary aggregate kept in the bundle envelope (details), NOT the signed
        # report body — otherwise the signed payload would diverge from the stored
        # report and public verification would fail with a content-hash mismatch.
        bundle.details["aggregatedCbomSummary"] = {
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
            if peer.get("available") and bundle.report.executive_summary is not None:
                # Folded into the report model so it is part of both the signed and
                # the persisted payload.
                bundle.report.executive_summary["peerComparison"] = peer
        except Exception:
            logger.debug("peerComparison skipped for scan_id=%s", scan_id)

    # Sign the exact payload that gets persisted, so public verify recomputes an
    # identical content hash (report_to_json(report) is the single source of truth).
    json_payload = _sign_report_for_storage(bundle)
    from app.pqc.transparency import safe_append_after_sign

    safe_append_after_sign(json_payload, bundle.report.signature or {}, tenant_id=tenant_id)

    try:
        from app.monitoring.drift_hooks import _dispatch_drift_alerts, record_external_drift_snapshot
        from app.monitoring.alerts import evaluate_drift_alerts
        from app.monitoring.unified_diff import UnifiedDiffService

        record_external_drift_snapshot(
            tenant_id=tenant_id,
            scan_id=scan_id,
            target_domain=target,
            report_dict=json_payload,
        )
        delta = UnifiedDiffService.compute_delta(
            tenant_id=tenant_id, source_type="external", scope_key=target
        )
        drift_alerts = evaluate_drift_alerts(delta=delta, source_type="external", settings=settings)
        if drift_alerts:
            _dispatch_drift_alerts(
                tenant_id=tenant_id,
                alerts=drift_alerts,
                delta=delta,
                scan_id=scan_id,
            )
    except Exception:
        logger.debug("external drift snapshot skipped for scan_id=%s", scan_id)

    try:
        from app.remediation.program import ingest_from_scan_bundle

        backlog = [
            {
                "id": item.id,
                "title": item.title,
                "assetId": item.asset_id,
            }
            for item in bundle.report.remediation_backlog
        ]
        ingest_from_scan_bundle(tenant_id=tenant_id, scan_id=scan_id, backlog=backlog)
    except Exception:
        logger.debug("program ingest skipped for scan_id=%s", scan_id)

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
        from app.store.tenant_alerts import _top_critical_remediation_id, persist_alert

        report_dict = serialize_bundle(bundle).get("report") or {}
        top_remediation_id = _top_critical_remediation_id(report_dict)
        for alert in alerts:
            if alert.get("severity") in {"high", "critical", "medium", "info"}:
                payload = {
                    "scanId": scan_id,
                    "remediationId": top_remediation_id,
                    **alert,
                }
                persist_alert(
                    tenant_id=tenant_id,
                    rule=str(alert.get("rule", "scan_alert")),
                    severity=str(alert.get("severity", "info")),
                    message=str(alert.get("message", "")),
                    source="scan",
                    payload=payload,
                )
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

    try:
        from app.coaching.milestones import record_milestone

        record_milestone(tenant_id=tenant_id, name="firstScanAt")
    except Exception:
        logger.debug("coaching milestone firstScanAt skipped scan_id=%s", scan_id)

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
