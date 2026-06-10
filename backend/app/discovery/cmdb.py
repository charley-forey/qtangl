"""ServiceNow CMDB coverage vs enrolled discovery agents."""

from __future__ import annotations

import os
from typing import Any

from app.db.config import persistence_enabled
from app.discovery.fleet import list_agents
from app.integrations.broader_ingest import cmdb_host_coverage, pull_servicenow_cmdb


def cmdb_coverage_summary(*, tenant_id: str) -> dict[str, Any]:
    enrolled = list_agents(tenant_id=tenant_id)
    hostnames = [str(a.get("hostname") or "") for a in enrolled]
    instance = os.environ.get("SERVICENOW_INSTANCE", "").strip()
    user = os.environ.get("SERVICENOW_USER", "").strip()
    password = os.environ.get("SERVICENOW_PASSWORD", "").strip()
    cmdb_hosts: list[dict[str, Any]] = []
    if instance and user and password and persistence_enabled():
        pull = pull_servicenow_cmdb(instance=instance, user=user, password=password, enabled=True)
        if pull.get("status") == "ok":
            cmdb_hosts = [
                c for c in pull.get("components", []) if str(c.get("kind")) == "cmdb_host"
            ]
    coverage = cmdb_host_coverage(cmdb_hosts=cmdb_hosts, enrolled_hostnames=hostnames)
    return {
        "cmdbHostCount": coverage.get("total", 0),
        "coveredCount": coverage.get("matched", 0),
        "coveragePercent": coverage.get("coveragePercent", 0.0),
        "enrolledAgentCount": len(enrolled),
        "provider": "servicenow" if instance else "none",
    }
