"""Read-only cloud integrations for CBOM ingestion (AWS ACM, Azure Key Vault)."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from app.coverage.cloud_pull import acm_rows_for_import, pull_aws_acm, pull_azure_keyvault
from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.db.models import TenantIntegration as IntegrationRow
from app.security.secrets import decrypt_config, encrypt_config

logger = logging.getLogger(__name__)

CLOUD_PROVIDERS = {"aws", "azure"}


def upsert_cloud_integration(
    *,
    tenant_id: str,
    provider: str,
    config: dict[str, Any],
) -> dict[str, Any]:
    if provider not in CLOUD_PROVIDERS:
        raise ValueError(f"Unsupported cloud provider: {provider}")
    if not persistence_enabled():
        return {"provider": provider, "configured": True}
    row_id = f"cloud-{uuid.uuid4().hex[:12]}"
    with db_session() as session:
        existing = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == provider)
            .one_or_none()
        )
        stored = encrypt_config(config)
        if existing:
            existing.config_json = stored
            existing.status = "active"
            row = existing
        else:
            row = IntegrationRow(
                id=row_id,
                tenant_id=tenant_id,
                provider=provider,
                config_json=stored,
                status="active",
            )
            session.add(row)
        session.flush()
        return _cloud_row_to_dict(row)


def test_cloud_connection(*, tenant_id: str, provider: str) -> dict[str, Any]:
    config = _load_cloud_config(tenant_id=tenant_id, provider=provider)
    if config is None:
        return {"ok": False, "reason": "integration_not_configured"}
    if provider == "aws":
        region = config.get("region", "us-east-1")
        result = pull_aws_acm(region=region)
        ok = result.get("status") == "ok"
        preview_count = int(result.get("count") or 0)
    elif provider == "azure":
        vault = config.get("vaultName", "")
        result = pull_azure_keyvault(vault_name=vault)
        ok = result.get("status") == "ok"
        preview_count = len(result.get("certificates") or [])
    else:
        return {"ok": False, "reason": "unsupported_provider"}
    _mark_test(tenant_id=tenant_id, provider=provider, status="ok" if ok else "failed")
    return {
        "ok": ok,
        "provider": provider,
        "previewCount": preview_count,
        "message": result.get("message"),
        "readOnlyValidated": ok,
    }


def pull_cloud_inventory(*, tenant_id: str, provider: str) -> dict[str, Any]:
    """Pull read-only cloud metadata and return CycloneDX-compatible document rows."""
    config = _load_cloud_config(tenant_id=tenant_id, provider=provider)
    if config is None:
        return {"ok": False, "reason": "integration_not_configured"}
    if provider == "aws":
        region = config.get("region", "us-east-1")
        rows_json = acm_rows_for_import(region=region)
        rows = json.loads(rows_json)
        pull_status = "ok"
    elif provider == "azure":
        vault = config.get("vaultName", "")
        result = pull_azure_keyvault(vault_name=vault)
        rows = [
            {
                "host": cert.get("name", "azure-cert"),
                "port": 443,
                "kind": "tls",
                "algorithm": cert.get("algorithm", "RSA"),
                "label": cert.get("name", "Azure Key Vault cert"),
                "source": "azure-keyvault",
            }
            for cert in result.get("certificates", [])
        ]
        pull_status = result.get("status", "partial")
    else:
        return {"ok": False, "reason": "unsupported_provider"}

    _mark_pull(tenant_id=tenant_id, provider=provider, status=pull_status)
    document = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "version": 1,
        "metadata": {
            "component": {
                "type": "application",
                "name": f"qtangl-cloud-{provider}",
            },
            "properties": [
                {"name": "qtangl:sourceMethod", "value": "cloud-readonly"},
                {"name": "qtangl:sourceType", "value": "cloud"},
            ],
        },
        "components": [
            {
                "type": "cryptographic-asset",
                "name": row.get("label") or row.get("host"),
                "bom-ref": f"cloud-{index}",
                "cryptoProperties": {
                    "assetType": "related-crypto-material",
                    "relatedCryptoMaterialProperties": {
                        "type": "certificate",
                        "algorithmRef": row.get("algorithm", "unknown"),
                    },
                },
                "properties": [
                    {"name": "qtangl:host", "value": str(row.get("host", ""))},
                    {"name": "qtangl:sourceMethod", "value": "cloud-readonly"},
                ],
            }
            for index, row in enumerate(rows)
        ],
    }
    return {"ok": True, "provider": provider, "componentCount": len(rows), "document": document}


def list_cloud_integrations(*, tenant_id: str) -> list[dict[str, Any]]:
    if not persistence_enabled():
        return []
    with db_session() as session:
        rows = (
            session.query(IntegrationRow)
            .filter(
                IntegrationRow.tenant_id == tenant_id,
                IntegrationRow.provider.in_(tuple(CLOUD_PROVIDERS)),
            )
            .all()
        )
        return [_cloud_row_to_dict(row) for row in rows]


def _load_cloud_config(*, tenant_id: str, provider: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return None
    with db_session() as session:
        row = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == provider)
            .one_or_none()
        )
        if row is None:
            return None
        return decrypt_config(row.config_json or "{}")


def _mark_test(*, tenant_id: str, provider: str, status: str) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        row = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == provider)
            .one_or_none()
        )
        if row:
            row.last_test_at = datetime.now(timezone.utc)
            row.last_pull_status = status


def _mark_pull(*, tenant_id: str, provider: str, status: str) -> None:
    if not persistence_enabled():
        return
    with db_session() as session:
        row = (
            session.query(IntegrationRow)
            .filter(IntegrationRow.tenant_id == tenant_id, IntegrationRow.provider == provider)
            .one_or_none()
        )
        if row:
            row.last_pull_at = datetime.now(timezone.utc)
            row.last_pull_status = status


def _cloud_row_to_dict(row: IntegrationRow) -> dict[str, Any]:
    config = decrypt_config(row.config_json or "{}")
    safe = {k: v for k, v in config.items() if "secret" not in k.lower() and "password" not in k.lower()}
    return {
        "id": row.id,
        "provider": row.provider,
        "configured": bool(config),
        "status": getattr(row, "status", "active"),
        "config": safe,
        "lastTestAt": row.last_test_at.isoformat() if getattr(row, "last_test_at", None) else None,
        "lastPullAt": row.last_pull_at.isoformat() if getattr(row, "last_pull_at", None) else None,
        "lastPullStatus": getattr(row, "last_pull_status", None),
    }
