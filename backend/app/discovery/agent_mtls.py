"""Agent endpoint identity verification (mTLS cert or dev bypass)."""

from __future__ import annotations

import os

from fastapi import Header, HTTPException, status

from app.discovery.agent_certs import verify_agent_certificate

def _mtls_required() -> bool:
    return os.environ.get("DISCOVERY_MTLS_REQUIRED", "false").lower() in ("1", "true", "yes")


def require_agent_identity(
    *,
    agent_id: str,
    tenant_id: str,
    x_qtangl_agent_cert: str | None = None,
) -> None:
    if not agent_id or not tenant_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="agentId and tenantId required")
    if not _mtls_required():
        return
    if not x_qtangl_agent_cert:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Agent certificate required")
    if not verify_agent_certificate(agent_id=agent_id, tenant_id=tenant_id, cert_pem=x_qtangl_agent_cert):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or revoked agent certificate")


def agent_cert_header(
    x_qtangl_agent_cert: str | None = Header(default=None, alias="X-Qtangl-Agent-Cert"),
) -> str | None:
    return x_qtangl_agent_cert
