"""OIDC SSO for enterprise tenants."""

from __future__ import annotations

from typing import Any


def get_oidc_config(*, tenant_id: str) -> dict[str, Any] | None:
    try:
        from app.db.engine import db_session
        from app.db.models import TenantOidcConfig
    except Exception:
        return None

    with db_session() as session:
        row = session.get(TenantOidcConfig, tenant_id)
        if row is None or not row.enabled:
            return None
        return {
            "issuerUrl": row.issuer_url,
            "clientId": row.client_id,
            "enabled": row.enabled,
        }


def upsert_oidc_config(
    *,
    tenant_id: str,
    issuer_url: str,
    client_id: str,
    client_secret: str = "",
    enabled: bool = False,
) -> dict[str, Any]:
    from datetime import datetime, timezone

    from app.db.engine import db_session
    from app.db.models import TenantOidcConfig
    from app.security.secrets import encrypt_json_blob

    now = datetime.now(timezone.utc)
    secret_enc = encrypt_json_blob({"secret": client_secret}) if client_secret else ""
    with db_session() as session:
        row = session.get(TenantOidcConfig, tenant_id)
        if row is None:
            row = TenantOidcConfig(
                tenant_id=tenant_id,
                issuer_url=issuer_url,
                client_id=client_id,
                client_secret_enc=secret_enc,
                enabled=enabled,
                updated_at=now,
            )
            session.add(row)
        else:
            row.issuer_url = issuer_url
            row.client_id = client_id
            if client_secret:
                row.client_secret_enc = secret_enc
            row.enabled = enabled
            row.updated_at = now
        return {"tenantId": tenant_id, "enabled": enabled, "issuerUrl": issuer_url}


def validate_oidc_token(*, issuer_url: str, token: str) -> dict[str, Any]:
    """Validate OIDC bearer token (stub — wire to issuer JWKS in production)."""
    if not token:
        return {"valid": False, "reason": "missing_token"}
    return {"valid": True, "issuer": issuer_url, "note": "JWKS validation required in production"}
