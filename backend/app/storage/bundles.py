from __future__ import annotations

import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)


def bundle_storage_root() -> Path | None:
    uri = os.getenv("QTANGL_BUNDLE_STORAGE_URI", "").strip()
    if uri.startswith("file://"):
        return Path(uri.removeprefix("file://"))
    if uri and not uri.startswith("s3://"):
        return Path(uri)
    return None


def store_bundle_blob(*, scan_id: str, tenant_id: str, payload: str) -> str | None:
    """Persist bundle JSON off-row when local file storage is configured."""
    root = bundle_storage_root()
    if root is None:
        return None
    tenant_dir = root / tenant_id
    tenant_dir.mkdir(parents=True, exist_ok=True)
    path = tenant_dir / f"{scan_id}.json"
    path.write_text(payload, encoding="utf-8")
    return str(path.relative_to(root))


def load_bundle_blob(*, storage_key: str) -> str | None:
    root = bundle_storage_root()
    if root is None:
        return None
    path = root / storage_key
    if not path.is_file():
        return None
    return path.read_text(encoding="utf-8")


def delete_bundle_blob(*, storage_key: str) -> None:
    root = bundle_storage_root()
    if root is None:
        return
    path = root / storage_key
    if path.is_file():
        path.unlink(missing_ok=True)
