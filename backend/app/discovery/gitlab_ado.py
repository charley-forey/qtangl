"""GitLab and Azure DevOps PAT/OAuth parity with GitHub App flow."""

from __future__ import annotations

import json
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session
from app.discovery.jobs import create_discovery_job


def store_provider_token(*, tenant_id: str, provider: str, token: str, metadata: dict[str, Any] | None = None) -> str:
    integ_id = f"{provider}-{tenant_id}"
    config = json.dumps({"token": token, **(metadata or {})})
    if persistence_enabled():
        try:
            from app.db.models import TenantIntegration

            with db_session() as session:
                row = session.get(TenantIntegration, integ_id)
                if row is None:
                    row = TenantIntegration(
                        id=integ_id,
                        tenant_id=tenant_id,
                        provider=provider,
                        name=provider.upper(),
                        config_json=config,
                    )
                    session.add(row)
                else:
                    row.config_json = config
                session.flush()
        except Exception:
            pass
    return integ_id


def enqueue_gitlab_scan(*, tenant_id: str, path_with_namespace: str, ref: str = "HEAD") -> dict[str, Any]:
    parts = path_with_namespace.split("/", 1)
    if len(parts) != 2:
        return {"status": "error", "reason": "invalid project path"}
    job_id = create_discovery_job(
        tenant_id=tenant_id,
        job_type="code_scan",
        payload={"githubOwner": parts[0], "githubRepo": parts[1], "ref": ref, "provider": "gitlab"},
        target_id=path_with_namespace,
    )
    return {"status": "enqueued", "jobId": job_id, "provider": "gitlab"}


def enqueue_ado_scan(*, tenant_id: str, project: str, repo: str, ref: str = "HEAD") -> dict[str, Any]:
    job_id = create_discovery_job(
        tenant_id=tenant_id,
        job_type="code_scan",
        payload={"githubOwner": project, "githubRepo": repo, "ref": ref, "provider": "ado"},
        target_id=f"{project}/{repo}",
    )
    return {"status": "enqueued", "jobId": job_id, "provider": "ado"}
