from __future__ import annotations

from app.db.engine import db_session
from app.db.models import (
    AuditLogEntry,
    PartnerChildTenant,
    PortfolioTarget,
    RemediationExternalSync,
    RemediationStatus,
    ScheduledScan,
    ScanJob,
    ShareLink,
    TenantIntegration,
    TenantSettings,
    TenantSubscription,
    UploadSession,
    WebhookDeadLetter,
    WebhookSubscription,
)
from app.storage.bundles import delete_bundle_blob
from app.store.scan_jobs import delete_job, list_jobs_for_tenant


def offboard_tenant(*, tenant_id: str) -> dict[str, int]:
    """Delete all tenant-owned rows across tables (GDPR / exit workflow)."""
    counts: dict[str, int] = {"scans": 0}

    scans = list_jobs_for_tenant(tenant_id=tenant_id, limit=10_000)
    for scan in scans:
        if delete_job(scan["scanId"], tenant_id=tenant_id):
            counts["scans"] += 1

    with db_session() as session:
        counts["scheduled_scans"] = (
            session.query(ScheduledScan).filter(ScheduledScan.tenant_id == tenant_id).delete()
        )
        counts["webhooks"] = (
            session.query(WebhookSubscription).filter(WebhookSubscription.tenant_id == tenant_id).delete()
        )
        counts["integrations"] = (
            session.query(TenantIntegration).filter(TenantIntegration.tenant_id == tenant_id).delete()
        )
        counts["portfolio"] = (
            session.query(PortfolioTarget).filter(PortfolioTarget.tenant_id == tenant_id).delete()
        )
        counts["audit_log"] = session.query(AuditLogEntry).filter(AuditLogEntry.tenant_id == tenant_id).delete()
        counts["dlq"] = (
            session.query(WebhookDeadLetter).filter(WebhookDeadLetter.tenant_id == tenant_id).delete()
        )
        counts["upload_sessions"] = (
            session.query(UploadSession).filter(UploadSession.tenant_id == tenant_id).delete()
        )
        counts["remediation_sync"] = (
            session.query(RemediationExternalSync)
            .filter(RemediationExternalSync.tenant_id == tenant_id)
            .delete()
        )
        counts["remediation_status"] = (
            session.query(RemediationStatus).filter(RemediationStatus.tenant_id == tenant_id).delete()
        )
        counts["share_links"] = session.query(ShareLink).filter(ShareLink.tenant_id == tenant_id).delete()
        settings = session.get(TenantSettings, tenant_id)
        if settings:
            session.delete(settings)
            counts["settings"] = 1
        else:
            counts["settings"] = 0
        sub = session.query(TenantSubscription).filter(TenantSubscription.tenant_id == tenant_id).one_or_none()
        if sub:
            session.delete(sub)
            counts["subscriptions"] = 1
        else:
            counts["subscriptions"] = 0
        counts["partner_links"] = (
            session.query(PartnerChildTenant)
            .filter(
                (PartnerChildTenant.parent_tenant_id == tenant_id)
                | (PartnerChildTenant.child_tenant_id == tenant_id)
            )
            .delete(synchronize_session=False)
        )
        orphan_scans = session.query(ScanJob).filter(ScanJob.tenant_id == tenant_id).all()
        for row in orphan_scans:
            if row.bundle_storage_key:
                delete_bundle_blob(storage_key=row.bundle_storage_key)
            session.delete(row)
        counts["orphan_scans"] = len(orphan_scans)

    return counts
