"""Code and dependency crypto discovery."""

from __future__ import annotations

import base64
import json
import re
import urllib.error
import urllib.request
from typing import Any

_PATTERNS = [
    (re.compile(r"RSA|ECDSA|Ed25519", re.I), "asymmetric"),
    (re.compile(r"AES-256-GCM|ChaCha20", re.I), "symmetric"),
    (re.compile(r"ML-KEM|ML-DSA|Kyber|Dilithium", re.I), "pqc"),
    (re.compile(r"BEGIN (RSA |EC )?PRIVATE KEY", re.I), "private_key"),
]

_CRYPTO_EXTENSIONS = {".py", ".js", ".ts", ".go", ".java", ".rs", ".yaml", ".yml", ".json", ".toml"}


def scan_source_snippet(*, content: str, path: str = "snippet") -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for pattern, category in _PATTERNS:
        for match in pattern.finditer(content):
            findings.append(
                {
                    "path": path,
                    "match": match.group(0),
                    "category": category,
                    "line": content[: match.start()].count("\n") + 1,
                }
            )
    return findings[:100]


def scan_github_repository(
    *,
    owner: str,
    repo: str,
    token: str,
    ref: str = "HEAD",
    max_files: int = 200,
) -> dict[str, Any]:
    """Fetch repository tree via GitHub API and scan file blobs for crypto patterns."""
    if not token:
        return {"status": "error", "message": "GitHub PAT required", "findings": []}

    tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{ref}?recursive=1"
    request = urllib.request.Request(
        tree_url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "qtangl-coverage/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        return {"status": "error", "message": f"GitHub API error: {exc.code}", "findings": []}
    except Exception as exc:
        return {"status": "error", "message": str(exc), "findings": []}

    findings: list[dict[str, Any]] = []
    scanned = 0
    for item in payload.get("tree", []):
        if item.get("type") != "blob":
            continue
        path = str(item.get("path", ""))
        if not any(path.endswith(ext) for ext in _CRYPTO_EXTENSIONS):
            continue
        if scanned >= max_files:
            break
        blob_sha = item.get("sha")
        if not blob_sha:
            continue
        blob_url = f"https://api.github.com/repos/{owner}/{repo}/git/blobs/{blob_sha}"
        blob_req = urllib.request.Request(
            blob_url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "User-Agent": "qtangl-coverage/1.0",
            },
        )
        try:
            with urllib.request.urlopen(blob_req, timeout=20) as blob_resp:
                blob = json.loads(blob_resp.read().decode())
            content_b64 = blob.get("content", "")
            if blob.get("encoding") == "base64":
                content = base64.b64decode(content_b64).decode("utf-8", errors="ignore")
            else:
                content = content_b64
        except Exception:
            continue
        scanned += 1
        for finding in scan_source_snippet(content=content, path=path):
            findings.append(finding)
        if len(findings) >= 500:
            break

    return {
        "status": "ok",
        "owner": owner,
        "repo": repo,
        "filesScanned": scanned,
        "findings": findings[:500],
    }
