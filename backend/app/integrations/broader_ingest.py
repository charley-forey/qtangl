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
    if not instance or not user or not password:
        return {"provider": "servicenow", "status": "error", "message": "instance, user, password required"}
    try:
        import httpx

        base = instance.rstrip("/")
        auth = (user, password)
        with httpx.Client(timeout=30, auth=auth) as client:
            resp = client.get(
                f"{base}/api/now/table/cmdb_ci_server",
                params={"sysparm_limit": 500, "sysparm_fields": "name,fqdn,ip_address,os"},
            )
            resp.raise_for_status()
            rows = resp.json().get("result") or []
            components = [
                {
                    "name": r.get("name") or r.get("fqdn"),
                    "fqdn": r.get("fqdn"),
                    "ip": r.get("ip_address"),
                    "os": r.get("os"),
                    "kind": "cmdb_host",
                }
                for r in rows
                if isinstance(r, dict)
            ]
            return {
                "provider": "servicenow",
                "status": "ok",
                "componentCount": len(components),
                "components": components,
            }
    except Exception as exc:
        return {"provider": "servicenow", "status": "error", "message": str(exc), "components": []}


def cmdb_host_coverage(
    *,
    cmdb_hosts: list[dict[str, Any]],
    enrolled_hostnames: list[str],
) -> dict[str, Any]:
    """CI→host correlation: % of CMDB servers with a enrolled sensor."""
    if not cmdb_hosts:
        return {"coveragePercent": 0.0, "matched": 0, "total": 0}
    names = {h.lower() for h in enrolled_hostnames if h}
    matched = 0
    for row in cmdb_hosts:
        label = str(row.get("fqdn") or row.get("name") or "").lower()
        if label and label in names:
            matched += 1
            continue
        for enrolled in names:
            if enrolled in label or label in enrolled:
                matched += 1
                break
    total = len(cmdb_hosts)
    pct = round(100.0 * matched / max(1, total), 1)
    return {"coveragePercent": pct, "matched": matched, "total": total}


def oss_scanner_preset(name: str) -> dict[str, Any]:
    presets = {
        "cbomkit": {"tool": "CBOMkit", "format": "cdx16"},
        "cryptoscan": {"tool": "CryptoScan", "format": "cdx16"},
    }
    return presets.get(name, {"tool": name, "format": "cdx16"})
