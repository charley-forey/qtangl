"""Publish transparency log roots to a public Git repository."""

from __future__ import annotations

import base64
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

_REPO_ENV = "QTANGL_ANCHOR_GIT_REPO"
_TOKEN_ENV = "QTANGL_ANCHOR_GIT_TOKEN"
_BRANCH_ENV = "QTANGL_ANCHOR_GIT_BRANCH"


def _github_api(path: str) -> str:
    return f"https://api.github.com{path}"


def publish_git_anchor(record: dict[str, Any]) -> dict[str, Any] | None:
    repo = os.getenv(_REPO_ENV, "").strip()
    token = os.getenv(_TOKEN_ENV, "").strip()
    branch = os.getenv(_BRANCH_ENV, "main").strip() or "main"
    if not repo or not token:
        return None

    owner, name = repo.split("/", 1) if "/" in repo else ("", repo)
    if not owner or not name:
        return None

    content = json.dumps(record, indent=2, sort_keys=True)
    content_b64 = base64.b64encode(content.encode("utf-8")).decode("ascii")
    path = "anchors/latest.json"
    api_path = f"/repos/{owner}/{name}/contents/{path}"

    sha: str | None = None
    try:
        get_req = Request(
            _github_api(api_path),
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "User-Agent": "qtangl-anchor",
            },
        )
        with urlopen(get_req, timeout=20) as resp:
            existing = json.loads(resp.read().decode("utf-8"))
            sha = existing.get("sha")
    except HTTPError as exc:
        if exc.code != 404:
            logger.warning("git anchor GET failed: %s", exc)
            return None
    except (URLError, TimeoutError) as exc:
        logger.warning("git anchor GET failed: %s", exc)
        return None

    body: dict[str, Any] = {
        "message": f"anchor root {record.get('rootHash', '')[:12]}",
        "content": content_b64,
        "branch": branch,
    }
    if sha:
        body["sha"] = sha

    try:
        put_req = Request(
            _github_api(api_path),
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "User-Agent": "qtangl-anchor",
            },
            method="PUT",
        )
        with urlopen(put_req, timeout=30) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
            commit_sha = payload.get("commit", {}).get("sha", "")
            html_url = payload.get("content", {}).get("html_url") or f"https://github.com/{repo}/blob/{branch}/{path}"
            result = {
                "commitSha": commit_sha,
                "url": html_url,
                "branch": branch,
                "publishedAt": datetime.now(timezone.utc).isoformat(),
            }
            _append_log_jsonl(record, commit_sha=commit_sha)
            return result
    except (HTTPError, URLError, TimeoutError) as exc:
        logger.warning("git anchor PUT failed: %s", exc)
        return None


def _append_log_jsonl(record: dict[str, Any], *, commit_sha: str) -> None:
    repo = os.getenv(_REPO_ENV, "").strip()
    token = os.getenv(_TOKEN_ENV, "").strip()
    branch = os.getenv(_BRANCH_ENV, "main").strip() or "main"
    if not repo or not token:
        return
    owner, name = repo.split("/", 1) if "/" in repo else ("", repo)
    if not owner or not name:
        return
    line = json.dumps({**record, "commitSha": commit_sha}, sort_keys=True) + "\n"
    path = "anchors/log.jsonl"
    api_path = f"/repos/{owner}/{name}/contents/{path}"
    existing_content = ""
    sha: str | None = None
    try:
        get_req = Request(
            _github_api(api_path),
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json", "User-Agent": "qtangl-anchor"},
        )
        with urlopen(get_req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
            sha = payload.get("sha")
            existing_content = base64.b64decode(payload.get("content", "")).decode("utf-8")
    except HTTPError as exc:
        if exc.code != 404:
            return
    except (URLError, TimeoutError):
        return
    merged = existing_content + line
    body = {
        "message": f"append anchor log {record.get('rootHash', '')[:12]}",
        "content": base64.b64encode(merged.encode("utf-8")).decode("ascii"),
        "branch": branch,
    }
    if sha:
        body["sha"] = sha
    try:
        put_req = Request(
            _github_api(api_path),
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "Content-Type": "application/json",
                "User-Agent": "qtangl-anchor",
            },
            method="PUT",
        )
        with urlopen(put_req, timeout=30):
            pass
    except (HTTPError, URLError, TimeoutError) as exc:
        logger.debug("git log.jsonl append skipped: %s", exc)
