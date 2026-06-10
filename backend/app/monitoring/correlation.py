from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlparse

_FQDN_RE = re.compile(r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$", re.I)


def normalize_fqdn(value: str) -> str:
    v = (value or "").strip().lower()
    if "://" in v:
        parsed = urlparse(v)
        v = parsed.hostname or v
    return v.rstrip(".")


def normalize_repo_url(value: str) -> str:
    v = (value or "").strip().lower().rstrip("/")
    if v.endswith(".git"):
        v = v[:-4]
    return v


def correlation_key_for_asset(asset: dict[str, Any]) -> str | None:
    if asset.get("assetId"):
        return f"asset:{asset['assetId']}"
    host = normalize_fqdn(str(asset.get("host") or asset.get("hostname") or ""))
    if host and _FQDN_RE.match(host):
        return f"host:{host}"
    return None


def correlation_key_for_finding(finding: dict[str, Any]) -> str | None:
    if finding.get("assetId"):
        return f"asset:{finding['assetId']}"
    if finding.get("findingId"):
        return f"finding:{finding['findingId']}"
    host = normalize_fqdn(str(finding.get("host") or finding.get("hostname") or ""))
    if host:
        return f"host:{host}"
    repo = normalize_repo_url(str(finding.get("repoUrl") or finding.get("repository") or ""))
    if repo:
        return f"repo:{repo}"
    return None


def correlate_findings(
    findings_a: list[dict[str, Any]],
    findings_b: list[dict[str, Any]],
) -> dict[str, Any]:
    """Match findings across two sources by correlation key."""
    keys_a = {correlation_key_for_finding(f): f for f in findings_a if correlation_key_for_finding(f)}
    keys_b = {correlation_key_for_finding(f): f for f in findings_b if correlation_key_for_finding(f)}
    shared = sorted(set(keys_a) & set(keys_b))
    only_a = sorted(set(keys_a) - set(keys_b))
    only_b = sorted(set(keys_b) - set(keys_a))
    return {
        "sharedCount": len(shared),
        "onlyACount": len(only_a),
        "onlyBCount": len(only_b),
        "sharedKeys": shared[:50],
        "confidence": "high" if shared else "low",
    }
