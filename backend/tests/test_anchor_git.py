"""Tests for Git anchor publishing (mocked)."""

from __future__ import annotations

import json
from unittest.mock import patch
from urllib.error import HTTPError

from app.pqc.anchor_git import publish_git_anchor


def test_git_anchor_skipped_without_config(monkeypatch):
    monkeypatch.delenv("QTANGL_ANCHOR_GIT_REPO", raising=False)
    monkeypatch.delenv("QTANGL_ANCHOR_GIT_TOKEN", raising=False)
    assert publish_git_anchor({"rootHash": "a" * 64}) is None


def test_git_anchor_success_mocked(monkeypatch):
    monkeypatch.setenv("QTANGL_ANCHOR_GIT_REPO", "org/anchors")
    monkeypatch.setenv("QTANGL_ANCHOR_GIT_TOKEN", "test-github-token-not-a-secret")

    class FakeResp:
        def __init__(self, data: bytes):
            self._data = data

        def read(self):
            return self._data

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

    put_payload = json.dumps(
        {"commit": {"sha": "abc123"}, "content": {"html_url": "https://github.com/org/anchors"}}
    ).encode()

    def urlopen_side_effect(req, timeout=30):
        url = req.full_url
        method = getattr(req, "method", None) or req.get_method()
        if method == "GET" and url.endswith("/contents/anchors/latest.json"):
            return FakeResp(b'{"sha":"old"}')
        if method == "PUT" and url.endswith("/contents/anchors/latest.json"):
            return FakeResp(put_payload)
        if method == "GET" and url.endswith("/contents/anchors/log.jsonl"):
            raise HTTPError(url, 404, "Not Found", hdrs=None, fp=None)
        if method == "PUT" and url.endswith("/contents/anchors/log.jsonl"):
            return FakeResp(b'{}')
        raise AssertionError(f"unexpected request: {method} {url}")

    with patch("app.pqc.anchor_git.urlopen", side_effect=urlopen_side_effect):
        result = publish_git_anchor({"rootHash": "b" * 64, "seq": 1})
    assert result is not None
    assert result.get("commitSha") == "abc123"
