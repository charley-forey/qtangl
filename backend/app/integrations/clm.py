"""CLM connector adapters (read-only certificate inventory)."""

from __future__ import annotations

from typing import Any, Protocol


class ClmAdapter(Protocol):
    provider: str

    def list_certificates(self) -> dict[str, Any]: ...


class DigiCertClmAdapter:
    provider = "digicert"

    def __init__(self, *, api_key: str, base_url: str = "https://one.digicert.com") -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")

    def list_certificates(self) -> dict[str, Any]:
        if not self.api_key:
            return {"provider": self.provider, "status": "error", "certificates": [], "message": "api_key required"}
        try:
            import httpx

            resp = httpx.get(
                f"{self.base_url}/mpki/api/v1/certificate",
                headers={"X-API-KEY": self.api_key},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            items = data if isinstance(data, list) else data.get("certificates", [])
            certs = [
                {
                    "id": c.get("id"),
                    "commonName": c.get("common_name") or c.get("commonName"),
                    "status": c.get("status"),
                    "validTo": c.get("valid_to") or c.get("validTo"),
                }
                for c in items[:200]
            ]
            return {"provider": self.provider, "status": "ok", "count": len(certs), "certificates": certs}
        except Exception as exc:
            return {"provider": self.provider, "status": "error", "certificates": [], "message": str(exc)}


class AppViewXClmAdapter:
    provider = "appviewx"

    def __init__(self, *, host: str, token: str) -> None:
        self.host = host.rstrip("/")
        self.token = token

    def list_certificates(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "status": "stub",
            "certificates": [],
            "message": "Configure AppViewX API credentials; interface ready for integration.",
        }


class EntrustClmAdapter:
    provider = "entrust"

    def __init__(self, *, api_key: str, tenant: str) -> None:
        self.api_key = api_key
        self.tenant = tenant

    def list_certificates(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "status": "stub",
            "certificates": [],
            "message": "Configure Entrust CLM credentials; interface ready for integration.",
        }


def pull_clm(provider: str, **credentials: Any) -> dict[str, Any]:
    adapters: dict[str, ClmAdapter] = {
        "digicert": DigiCertClmAdapter(api_key=str(credentials.get("apiKey", ""))),
        "appviewx": AppViewXClmAdapter(host=str(credentials.get("host", "")), token=str(credentials.get("token", ""))),
        "entrust": EntrustClmAdapter(api_key=str(credentials.get("apiKey", "")), tenant=str(credentials.get("tenant", ""))),
    }
    adapter = adapters.get(provider.lower())
    if adapter is None:
        return {"provider": provider, "status": "error", "certificates": [], "message": "unknown CLM provider"}
    return adapter.list_certificates()
