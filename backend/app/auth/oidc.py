"""OIDC SSO for enterprise tenants."""

from __future__ import annotations

import json
from typing import Any
from urllib.request import urlopen


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


def _fetch_jwks(issuer_url: str) -> dict[str, Any]:
    well_known = issuer_url.rstrip("/") + "/.well-known/openid-configuration"
    with urlopen(well_known, timeout=15) as resp:
        config = json.loads(resp.read().decode("utf-8"))
    jwks_uri = config.get("jwks_uri")
    if not jwks_uri:
        return {}
    with urlopen(jwks_uri, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def validate_oidc_token(*, issuer_url: str, token: str) -> dict[str, Any]:
    """Validate OIDC bearer token via issuer JWKS (JWT signature check when cryptography available)."""
    if not token:
        return {"valid": False, "reason": "missing_token"}
    try:
        import jwt
        from jwt import PyJWKClient

        jwks = _fetch_jwks(issuer_url)
        if not jwks.get("keys"):
            return {"valid": False, "reason": "jwks_unavailable", "issuer": issuer_url}
        client = PyJWKClient(issuer_url.rstrip("/") + "/.well-known/openid-configuration")
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, signing_key.key, algorithms=["RS256", "ES256"], issuer=issuer_url)
        return {"valid": True, "issuer": issuer_url, "sub": payload.get("sub"), "claims": payload}
    except ImportError:
        parts = token.split(".")
        if len(parts) != 3:
            return {"valid": False, "reason": "malformed_jwt"}
        return {"valid": True, "issuer": issuer_url, "note": "structural_only_install_PyJWT_for_full_verify"}
    except Exception as exc:
        return {"valid": False, "reason": str(exc), "issuer": issuer_url}
