"""Offline verify helpers — thin wrapper around qtangl-verify."""

from __future__ import annotations

from typing import Any, Mapping

from qtangl_verify.content_hash import content_hash_for_payload
from qtangl_verify.verify import verify_report

__all__ = ["content_hash_for_payload", "verify_report_offline"]


def verify_report_offline(
    report_json: Mapping[str, Any],
    signature: Mapping[str, Any],
    *,
    api_base: str | None = None,
    published_root: str | None = None,
) -> dict[str, Any]:
    """Verify a signed report offline, optionally checking transparency log inclusion."""
    return verify_report(
        dict(report_json),
        dict(signature),
        api_base=api_base,
        published_root=published_root,
    )
