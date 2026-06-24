"""Sync host sensor findings into remediation program items."""

from __future__ import annotations

from typing import Any

from app.discovery.host_normalize import finding_dedupe_key
from app.remediation.program import upsert_program_item
from app.tenant.settings import remediation_program_enabled


def sync_program_items_for_findings(
    *,
    tenant_id: str,
    findings: list[dict[str, Any]],
) -> list[dict[str, str]]:
    if not remediation_program_enabled(tenant_id=tenant_id):
        return []
    linked: list[dict[str, str]] = []
    for finding in findings:
        fid = finding_dedupe_key(finding)
        algorithm = str(finding.get("algorithm") or finding.get("libraryName") or "crypto")
        location = str(finding.get("location") or finding.get("hostname") or "host")
        title = f"{algorithm} @ {location}"
        item = upsert_program_item(
            tenant_id=tenant_id,
            source_type="host_finding",
            source_ref=fid,
            title=title,
            asset_id=str(finding.get("fingerprint") or fid)[:64] or None,
            actor="host-sensor",
        )
        program_id = str(item.get("id") or "")
        if program_id:
            upsert_program_item(
                tenant_id=tenant_id,
                source_type="host_finding",
                source_ref=fid,
                title=title,
                deep_link=f"/dashboard?tab=remediate&programItemId={program_id}",
                actor="host-sensor",
            )
            linked.append({"findingId": fid, "programItemId": program_id})
    return linked
