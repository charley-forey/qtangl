"""Unified pull adapters for CBOM ingestion (cloud, k8s, CLM, Keyfactor)."""

from __future__ import annotations

import json
from typing import Any


def pull_inventory(*, tenant_id: str, provider: str) -> dict[str, Any]:
    """Pull read-only inventory and return CycloneDX-compatible document."""
    provider = provider.lower()
    if provider in {"aws", "azure", "gcp", "kubernetes"}:
        from app.integrations.cloud import pull_cloud_inventory

        return pull_cloud_inventory(tenant_id=tenant_id, provider=provider)
    if provider == "keyfactor":
        return _pull_keyfactor(tenant_id=tenant_id)
    if provider.startswith("clm-"):
        return _pull_clm(tenant_id=tenant_id, clm_provider=provider.removeprefix("clm-"))
    if provider in {"digicert", "appviewx", "entrust"}:
        return _pull_clm(tenant_id=tenant_id, clm_provider=provider)
    return {"ok": False, "reason": f"unsupported_provider:{provider}"}


def _load_integration_config(*, tenant_id: str, provider: str) -> dict[str, Any] | None:
    from app.integrations.cloud import _load_cloud_config

    if provider in {"aws", "azure", "gcp", "kubernetes"}:
        return _load_cloud_config(tenant_id=tenant_id, provider=provider)
    try:
        from app.db.engine import db_session
        from app.db.models import TenantIntegration
        from app.security.secrets import decrypt_config
    except Exception:
        return None
    with db_session() as session:
        row = (
            session.query(TenantIntegration)
            .filter(TenantIntegration.tenant_id == tenant_id, TenantIntegration.provider == provider)
            .one_or_none()
        )
        if row is None:
            return None
        return decrypt_config(row.config_json or "{}")


def _pull_keyfactor(*, tenant_id: str) -> dict[str, Any]:
    from app.integrations.keyfactor import pull_keyfactor_inventory

    config = _load_integration_config(tenant_id=tenant_id, provider="keyfactor") or {}
    result = pull_keyfactor_inventory(
        base_url=str(config.get("baseUrl") or ""),
        api_token=str(config.get("apiToken") or ""),
        collection_id=str(config.get("collectionId") or ""),
    )
    if result.get("status") != "ok":
        return {"ok": False, "reason": result.get("message") or result.get("status")}
    rows = [
        {
            "host": cert.get("subject") or cert.get("id", "keyfactor-cert"),
            "port": 443,
            "kind": "tls",
            "algorithm": "RSA",
            "label": cert.get("subject") or "Keyfactor cert",
            "source": "keyfactor",
        }
        for cert in result.get("certificates", [])
    ]
    return _rows_to_pull_result(provider="keyfactor", rows=rows)


def _pull_clm(*, tenant_id: str, clm_provider: str) -> dict[str, Any]:
    from app.integrations.clm import pull_clm

    config = _load_integration_config(tenant_id=tenant_id, provider=f"clm-{clm_provider}") or {}
    if not config:
        config = _load_integration_config(tenant_id=tenant_id, provider=clm_provider) or {}
    result = pull_clm(clm_provider, **config)
    if result.get("status") not in {"ok", "stub"}:
        return {"ok": False, "reason": result.get("message") or result.get("status")}
    rows = [
        {
            "host": cert.get("commonName") or cert.get("id", "clm-cert"),
            "port": 443,
            "kind": "tls",
            "algorithm": "RSA",
            "label": cert.get("commonName") or "CLM cert",
            "source": f"clm-{clm_provider}",
        }
        for cert in result.get("certificates", [])
    ]
    return _rows_to_pull_result(provider=f"clm-{clm_provider}", rows=rows, partial=result.get("status") == "stub")


def _rows_to_pull_result(*, provider: str, rows: list[dict[str, Any]], partial: bool = False) -> dict[str, Any]:
    document = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "version": 1,
        "metadata": {
            "component": {"type": "application", "name": f"qtangl-{provider}"},
            "properties": [
                {"name": "qtangl:sourceMethod", "value": "integration-readonly"},
                {"name": "qtangl:sourceType", "value": provider},
            ],
        },
        "components": [
            {
                "type": "cryptographic-asset",
                "name": row.get("label") or row.get("host"),
                "bom-ref": f"{provider}-{index}",
                "cryptoProperties": {
                    "assetType": "related-crypto-material",
                    "relatedCryptoMaterialProperties": {
                        "type": "certificate",
                        "algorithmRef": row.get("algorithm", "unknown"),
                    },
                },
                "properties": [{"name": "qtangl:host", "value": str(row.get("host", ""))}],
            }
            for index, row in enumerate(rows)
        ],
    }
    return {
        "ok": True,
        "provider": provider,
        "componentCount": len(rows),
        "document": document,
        "status": "partial" if partial else "ok",
    }
