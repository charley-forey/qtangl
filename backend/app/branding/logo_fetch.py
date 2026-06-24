from __future__ import annotations

import logging
import re

from app.pqc.safety import ScanSafetyError, safe_urlopen

logger = logging.getLogger(__name__)

MAX_LOGO_BYTES = 512 * 1024
LOGO_FETCH_TIMEOUT = 10.0
ALLOWED_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp",
    "image/gif",
}


def _content_type_allowed(content_type: str) -> bool:
    normalized = content_type.split(";", 1)[0].strip().lower()
    return normalized in ALLOWED_CONTENT_TYPES


def fetch_logo_bytes(url: str, *, max_bytes: int = MAX_LOGO_BYTES) -> bytes | None:
    """Fetch logo bytes over HTTPS with SSRF guard, timeout, and size cap."""
    trimmed = (url or "").strip()
    if not trimmed:
        return None
    if not re.match(r"^https://", trimmed, flags=re.IGNORECASE):
        logger.info("Logo fetch rejected (HTTPS required): %s", trimmed)
        return None

    try:
        with safe_urlopen(trimmed, timeout=LOGO_FETCH_TIMEOUT) as response:
            content_type = response.headers.get("content-type", "")
            if content_type and not _content_type_allowed(content_type):
                logger.info("Logo fetch rejected (content-type): %s type=%s", trimmed, content_type)
                return None
            body = response.read()
            if len(body) > max_bytes:
                logger.info("Logo fetch rejected (size cap): %s", trimmed)
                return None
            if body and not content_type:
                # Allow missing content-type when payload looks like a binary image.
                if not body.startswith((b"\x89PNG", b"\xff\xd8\xff", b"GIF8", b"RIFF", b"<svg", b"<?xml")):
                    logger.info("Logo fetch rejected (unknown payload): %s", trimmed)
                    return None
            return body or None
    except ScanSafetyError as exc:
        logger.info("Logo fetch blocked: %s (%s)", trimmed, exc)
        return None
    except Exception as exc:
        logger.warning("Logo fetch failed: %s (%s)", trimmed, exc)
        return None
