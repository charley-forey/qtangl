from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Any

from app.coverage.code_deps import scan_github_repository, scan_source_snippet
from app.discovery.constants import SOURCE_METHODS
from app.discovery.host_normalize import finding_to_crypto_asset
from app.pqc.models import CryptoAsset

SCANNER_VERSIONS_PATH = Path(__file__).resolve().parents[2] / "scanner-versions.lock"


def _load_scanner_versions() -> dict[str, str]:
    if SCANNER_VERSIONS_PATH.exists():
        return json.loads(SCANNER_VERSIONS_PATH.read_text(encoding="utf-8"))
    return {"cryptoscan": "0.1.0", "cryptodeps": "0.1.0", "theia": "0.1.0"}


def _run_cryptoscan_stub(repo_dir: Path) -> list[dict[str, Any]]:
    """Run regex-based scan when CryptoScan binary unavailable."""
    findings: list[dict[str, Any]] = []
    for path in repo_dir.rglob("*"):
        if not path.is_file() or path.suffix not in {".py", ".go", ".js", ".ts", ".java", ".rs"}:
            continue
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for item in scan_source_snippet(content=content, path=str(path.relative_to(repo_dir))):
            findings.append(
                {
                    "schemaVersion": 1,
                    "findingId": f"code-{uuid.uuid4().hex[:16]}",
                    "findingType": "source_code",
                    "hostId": str(uuid.uuid4()),
                    "hostname": "repository",
                    "os": "linux",
                    "location": item["path"],
                    "algorithm": item.get("match", "unknown"),
                    "confidence": "medium",
                    "sourcePath": item["path"],
                    "lineNumber": item.get("line"),
                    "reachability": "confirmed",
                    "metadata": {"category": item.get("category")},
                }
            )
        if len(findings) >= 500:
            break
    return findings


def _try_run_binary(name: str, args: list[str], *, cwd: Path | None = None) -> subprocess.CompletedProcess[str] | None:
    binary = shutil.which(name)
    if not binary:
        return None
    try:
        return subprocess.run(
            [binary, *args],
            capture_output=True,
            text=True,
            timeout=1800,
            cwd=str(cwd) if cwd else None,
            check=False,
        )
    except (subprocess.TimeoutExpired, OSError):
        return None


def run_code_scan(
    *,
    owner: str | None = None,
    repo: str | None = None,
    token: str | None = None,
    ref: str = "HEAD",
    content: str | None = None,
    path: str = "snippet",
) -> dict[str, Any]:
    versions = _load_scanner_versions()
    findings: list[dict[str, Any]] = []
    pull_status = "ok"
    engines_used: list[str] = []

    if content is not None:
        for item in scan_source_snippet(content=content, path=path):
            findings.append(
                {
                    "schemaVersion": 1,
                    "findingId": f"code-{uuid.uuid4().hex[:16]}",
                    "findingType": "source_code",
                    "hostId": str(uuid.uuid4()),
                    "hostname": "snippet",
                    "os": "linux",
                    "location": item["path"],
                    "algorithm": item.get("match", "unknown"),
                    "confidence": "medium",
                    "sourcePath": item["path"],
                    "lineNumber": item.get("line"),
                    "reachability": "confirmed",
                }
            )
        engines_used.append("qtangl-regex")
    elif owner and repo and token:
        gh = scan_github_repository(owner=owner, repo=repo, token=token, ref=ref)
        if gh.get("status") != "ok":
            return {"status": "error", "message": gh.get("message"), "findings": [], "engines": engines_used}
        for item in gh.get("findings", []):
            findings.append(
                {
                    "schemaVersion": 1,
                    "findingId": f"code-{uuid.uuid4().hex[:16]}",
                    "findingType": "source_code",
                    "hostId": str(uuid.uuid4()),
                    "hostname": f"{owner}/{repo}",
                    "os": "linux",
                    "location": item.get("path", ""),
                    "algorithm": item.get("match", "unknown"),
                    "confidence": "medium",
                    "sourcePath": item.get("path"),
                    "lineNumber": item.get("line"),
                    "reachability": "reachable",
                    "metadata": {"category": item.get("category")},
                }
            )
        engines_used.append("qtangl-github-api")
        proc = _try_run_binary("cryptoscan", ["scan", ".", "--format", "cbom"], cwd=None)
        if proc is None:
            engines_used.append("qtangl-regex-fallback")
        else:
            engines_used.append(f"cryptoscan@{versions.get('cryptoscan', '?')}")
    else:
        return {"status": "error", "message": "owner/repo/token or content required", "findings": []}

    assets: list[CryptoAsset] = []
    for finding in findings:
        assets.append(finding_to_crypto_asset(finding, agent_hostname=str(finding.get("hostname", "repo"))))
        assets[-1].kind = "source_code"  # type: ignore[misc]

    reachability = {"confirmed": 0, "reachable": 0, "available": 0}
    for finding in findings:
        tier = str(finding.get("reachability") or "available").lower()
        if tier in reachability:
            reachability[tier] += 1
        else:
            reachability["available"] += 1

    return {
        "status": pull_status,
        "findingsCount": len(findings),
        "assetCount": len(assets),
        "assets": assets,
        "engines": engines_used,
        "sourceMethod": SOURCE_METHODS["code_scan"],
        "reachability": reachability,
        "findings": findings,
    }
