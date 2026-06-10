"""GitHub App webhook handler — enqueue code_scan on push/PR."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.discovery.jobs import create_discovery_job

_INSTALLATIONS: dict[str, int] = {}


def github_install_url(*, tenant_id: str) -> str:
    app_slug = os.environ.get("GITHUB_APP_SLUG", "qtangl-discovery")
    state = hashlib.sha256(tenant_id.encode()).hexdigest()[:16]
    return f"https://github.com/apps/{app_slug}/installations/new?state={state}"


def store_github_installation(*, tenant_id: str, installation_id: int) -> None:
    _INSTALLATIONS[tenant_id] = installation_id
    if not persistence_enabled():
        return
    try:
        from app.db.models import TenantIntegration

        with db_session() as session:
            integ_id = f"github-app-{tenant_id}"
            row = session.get(TenantIntegration, integ_id)
            config = json.dumps({"installationId": installation_id, "provider": "github_app"})
            if row is None:
                row = TenantIntegration(
                    id=integ_id,
                    tenant_id=tenant_id,
                    provider="github_app",
                    name="GitHub App",
                    config_json=config,
                )
                session.add(row)
            else:
                row.config_json = config
            session.flush()
    except Exception:
        pass


def get_github_installation_id(*, tenant_id: str) -> int | None:
    if tenant_id in _INSTALLATIONS:
        return _INSTALLATIONS[tenant_id]
    if not persistence_enabled():
        return None
    try:
        from app.db.models import TenantIntegration

        with db_session() as session:
            row = (
                session.query(TenantIntegration)
                .filter(TenantIntegration.tenant_id == tenant_id, TenantIntegration.provider == "github_app")
                .first()
            )
            if row is None:
                return None
            cfg = json.loads(row.config_json or "{}")
            return int(cfg.get("installationId") or 0) or None
    except Exception:
        return None


def verify_github_webhook_signature(*, body: bytes, signature: str) -> bool:
    secret = os.environ.get("GITHUB_APP_WEBHOOK_SECRET", "").strip()
    if not secret:
        return True
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)


def handle_github_webhook(*, tenant_id: str, event: str, payload: dict[str, Any]) -> dict[str, Any]:
    if event not in ("push", "pull_request"):
        return {"status": "ignored", "reason": "unsupported_event"}
    repo = payload.get("repository") or {}
    owner = (repo.get("owner") or {}).get("login") or ""
    name = repo.get("name") or ""
    if not owner or not name:
        return {"status": "error", "reason": "missing_repository"}
    ref = "HEAD"
    if event == "push":
        ref = str(payload.get("after") or "HEAD")
    installation_id = get_github_installation_id(tenant_id=tenant_id)
    job_id = create_discovery_job(
        tenant_id=tenant_id,
        job_type="code_scan",
        payload={
            "githubOwner": owner,
            "githubRepo": name,
            "ref": ref,
            "installationId": installation_id,
        },
        target_id=f"{owner}/{name}",
    )
    return {"status": "enqueued", "jobId": job_id, "installationId": installation_id}


def summarize_pr_findings(*, base_count: int, head_count: int) -> str:
    delta = head_count - base_count
    if delta > 0:
        return f"⚠️ {delta} new cryptographic finding(s) vs base branch."
    if delta < 0:
        return f"✅ {abs(delta)} fewer finding(s) than base branch."
    return "No change in cryptographic findings vs base branch."
