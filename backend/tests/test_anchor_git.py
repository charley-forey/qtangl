"""Tests for Git anchor publishing (mocked)."""

from __future__ import annotations

from unittest.mock import patch

from app.pqc.anchor_git import publish_git_anchor


def test_git_anchor_skipped_without_config(monkeypatch):
    monkeypatch.delenv("QTANGL_ANCHOR_GIT_REPO", raising=False)
    monkeypatch.delenv("QTANGL_ANCHOR_GIT_TOKEN", raising=False)
    assert publish_git_anchor({"rootHash": "a" * 64}) is None


def test_git_anchor_success_mocked(monkeypatch):
    monkeypatch.setenv("QTANGL_ANCHOR_GIT_REPO", "org/anchors")
    monkeypatch.setenv("QTANGL_ANCHOR_GIT_TOKEN", "ghp_test")

    class FakeResp:
        def __init__(self, data: bytes):
            self._data = data

        def read(self):
            return self._data

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

    import json

    put_payload = json.dumps({"commit": {"sha": "abc123"}, "content": {"html_url": "https://github.com/org/anchors"}}).encode()

    with patch("app.pqc.anchor_git.urlopen", side_effect=[FakeResp(b'{"sha":"old"}'), FakeResp(put_payload)]):
        result = publish_git_anchor({"rootHash": "b" * 64, "seq": 1})
    assert result is not None
    assert result.get("commitSha") == "abc123"
