"""Keyfactor bi-directional integration (read ingest + optional write-back)."""

from __future__ import annotations

from typing import Any


def pull_keyfactor_inventory(
    *,
    base_url: str,
    api_token: str,
    collection_id: str = "",
) -> dict[str, Any]:
    if not base_url or not api_token:
        return {
            "provider": "keyfactor",
            "status": "error",
            "certificates": [],
            "message": "base_url and api_token required",
        }
    try:
        import httpx

        headers = {"X-Keyfactor-Requested-With": "APIClient", "Authorization": f"Bearer {api_token}"}
        url = f"{base_url.rstrip('/')}/KeyfactorAPI/Certificates"
        if collection_id:
            url += f"?CollectionId={collection_id}"
        resp = httpx.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        certs = [
            {
                "id": c.get("Id"),
                "thumbprint": c.get("Thumbprint"),
                "subject": c.get("Subject"),
                "notAfter": c.get("NotAfter"),
            }
            for c in data.get("Certificates", data if isinstance(data, list) else [])[:200]
        ]
        return {"provider": "keyfactor", "status": "ok", "count": len(certs), "certificates": certs}
    except Exception as exc:
        return {"provider": "keyfactor", "status": "error", "certificates": [], "message": str(exc)}


def write_keyfactor_metadata(
    *,
    base_url: str,
    api_token: str,
    cert_id: str,
    metadata: dict[str, Any],
    enabled: bool = False,
) -> dict[str, Any]:
    if not enabled:
        return {"status": "disabled", "message": "Keyfactor write-back gated by tenant config"}
    try:
        import httpx

        headers = {"X-Keyfactor-Requested-With": "APIClient", "Authorization": f"Bearer {api_token}"}
        url = f"{base_url.rstrip('/')}/KeyfactorAPI/Certificates/{cert_id}/Metadata"
        resp = httpx.put(url, headers=headers, json=metadata, timeout=30)
        resp.raise_for_status()
        return {"status": "ok", "certId": cert_id}
    except Exception as exc:
        return {"status": "error", "message": str(exc)}
