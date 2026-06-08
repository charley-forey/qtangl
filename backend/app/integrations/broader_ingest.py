"""Broader ingestion adapters (OSS scanner presets, Dependency-Track, ServiceNow)."""

from __future__ import annotations

from typing import Any


SOURCE_TYPES = {
    "live_scan",
    "cloud_pull",
    "third-party",
    "kubernetes",
    "clm",
    "oss_scanner",
    "dependency_track",
    "servicenow_cmdb",
}


def pull_dependency_track(*, base_url: str, api_key: str, project_id: str) -> dict[str, Any]:
    return {
        "provider": "dependency_track",
        "status": "stub",
        "components": [],
        "message": f"Configure Dependency-Track at {base_url} project {project_id}",
    }


def pull_servicenow_cmdb(*, instance: str, user: str, password: str, enabled: bool = False) -> dict[str, Any]:
    if not enabled:
        return {"provider": "servicenow", "status": "disabled", "message": "CMDB write gated by tenant config"}
    return {"provider": "servicenow", "status": "stub", "components": []}


def oss_scanner_preset(name: str) -> dict[str, Any]:
    presets = {
        "cbomkit": {"tool": "CBOMkit", "format": "cdx16"},
        "cryptoscan": {"tool": "CryptoScan", "format": "cdx16"},
    }
    return presets.get(name, {"tool": name, "format": "cdx16"})
