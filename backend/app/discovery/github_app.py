"""GitHub App webhook handler — enqueue code_scan on push/PR."""

from __future__ import annotations

from typing import Any

from app.discovery.jobs import create_discovery_job


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
    job_id = create_discovery_job(
        tenant_id=tenant_id,
        job_type="code_scan",
        payload={"githubOwner": owner, "githubRepo": name, "ref": ref},
        target_id=f"{owner}/{name}",
    )
    return {"status": "enqueued", "jobId": job_id}


def summarize_pr_findings(*, base_count: int, head_count: int) -> str:
    delta = head_count - base_count
    if delta > 0:
        return f"⚠️ {delta} new cryptographic finding(s) vs base branch."
    if delta < 0:
        return f"✅ {abs(delta)} fewer finding(s) than base branch."
    return "No change in cryptographic findings vs base branch."
