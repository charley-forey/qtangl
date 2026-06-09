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
    if not base_url or not api_key:
        return {
            "provider": "dependency_track",
            "status": "error",
            "components": [],
            "message": "DEPENDENCY_TRACK_BASE_URL and DEPENDENCY_TRACK_API_KEY required",
        }
    try:
        import httpx

        root = base_url.rstrip("/")
        headers = {"X-Api-Key": api_key, "Accept": "application/json"}
        with httpx.Client(timeout=30) as client:
            project_resp = client.get(f"{root}/api/v1/project/{project_id}", headers=headers)
            project_resp.raise_for_status()
            project = project_resp.json()
            comp_resp = client.get(
                f"{root}/api/v1/component/project/{project_id}",
                headers=headers,
            )
            comp_resp.raise_for_status()
            raw_components = comp_resp.json()
            components = [
                {
                    "uuid": c.get("uuid"),
                    "name": c.get("name"),
                    "version": c.get("version"),
                    "purl": c.get("purl"),
                    "group": c.get("group"),
                }
                for c in (raw_components if isinstance(raw_components, list) else [])[:500]
            ]
            return {
                "provider": "dependency_track",
                "status": "ok",
                "projectId": project_id,
                "projectName": project.get("name"),
                "componentCount": len(components),
                "components": components,
            }
    except Exception as exc:
        return {
            "provider": "dependency_track",
            "status": "error",
            "components": [],
            "message": str(exc),
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
