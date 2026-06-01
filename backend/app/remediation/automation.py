"""Remediation automation connectors (Venafi, ACME, hybrid TLS stubs)."""

from __future__ import annotations

from typing import Any


def request_acme_reissue(*, domain: str, pqc_preferred: bool = True) -> dict[str, Any]:
    return {
        "provider": "acme",
        "domain": domain,
        "status": "stub",
        "pqcPreferred": pqc_preferred,
        "message": "Wire QTANGL_ACME_DIRECTORY_URL for live certificate automation.",
    }


def venafi_policy_check(*, policy_id: str) -> dict[str, Any]:
    return {
        "provider": "venafi",
        "policyId": policy_id,
        "status": "stub",
        "pqcReady": False,
    }


def open_hybrid_tls_pr(*, repo: str, branch: str, title: str) -> dict[str, Any]:
    return {
        "provider": "github",
        "repo": repo,
        "branch": branch,
        "title": title,
        "status": "stub",
        "message": "Configure GITHUB_TOKEN for auto-PR remediation workflows.",
    }
