"""Discovery inventory summary for dashboard tabs."""

from __future__ import annotations

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import CodeScanTarget, DiscoveryJob, HostAgent, HostFinding, ImageScanTarget


def discovery_inventory_summary(*, tenant_id: str) -> dict[str, int]:
    if not persistence_enabled():
        return {"external": 0, "hosts": 0, "code": 0, "images": 0}
    with db_session() as session:
        hosts = session.query(HostAgent).filter(HostAgent.tenant_id == tenant_id).count()
        findings = session.query(HostFinding).filter(HostFinding.tenant_id == tenant_id).count()
        code_targets = session.query(CodeScanTarget).filter(CodeScanTarget.tenant_id == tenant_id).count()
        image_targets = session.query(ImageScanTarget).filter(ImageScanTarget.tenant_id == tenant_id).count()
        code_jobs = (
            session.query(DiscoveryJob)
            .filter(DiscoveryJob.tenant_id == tenant_id, DiscoveryJob.job_type == "code_scan")
            .count()
        )
        binary_jobs = (
            session.query(DiscoveryJob)
            .filter(DiscoveryJob.tenant_id == tenant_id, DiscoveryJob.job_type == "binary_scan")
            .count()
        )
    return {
        "external": 0,
        "hosts": hosts,
        "hostFindings": findings,
        "code": code_targets + code_jobs,
        "images": image_targets + binary_jobs,
    }
