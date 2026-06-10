"""Container registry credential pull for binary discovery."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from typing import Any

from app.db.config import persistence_enabled
from app.db.engine import db_session


def _integration_secret(tenant_id: str, integration_id: str) -> dict[str, Any] | None:
    if not persistence_enabled():
        return {"registry": "ecr", "username": "AWS", "password": os.environ.get("AWS_ECR_TOKEN", "")}
    try:
        from app.db.models import TenantIntegration

        with db_session() as session:
            row = session.get(TenantIntegration, integration_id)
            if row is None or row.tenant_id != tenant_id:
                return None
            return json.loads(row.config_json or "{}")
    except Exception:
        return None


def pull_image_to_dir(*, tenant_id: str, integration_id: str | None, image_ref: str) -> str | None:
    """Return temp directory with pulled image layers or None on failure."""
    if not image_ref.strip():
        return None
    creds = _integration_secret(tenant_id, integration_id) if integration_id else {}
    registry = str((creds or {}).get("registry") or "docker")
    crane = shutil.which("crane") or shutil.which("skopeo")
    if not crane:
        return None
    tmp = tempfile.mkdtemp(prefix="qtangl-img-")
    if shutil.which("crane"):
        login_args: list[str] = []
        if creds and creds.get("username") and creds.get("password"):
            subprocess.run(
                ["crane", "auth", "login", str(creds.get("host", "index.docker.io")), "-u", creds["username"], "-p", creds["password"]],
                check=False,
                capture_output=True,
            )
        proc = subprocess.run(
            ["crane", "export", image_ref, f"{tmp}/image.tar"],
            capture_output=True,
            text=True,
            timeout=600,
            check=False,
        )
        if proc.returncode != 0:
            return None
        return tmp
    proc = subprocess.run(
        ["skopeo", "copy", f"docker://{image_ref}", f"oci:{tmp}:latest"],
        capture_output=True,
        text=True,
        timeout=600,
        check=False,
    )
    return tmp if proc.returncode == 0 else None


def test_registry_pull(*, tenant_id: str, integration_id: str, image_ref: str) -> tuple[bool, str]:
    creds = _integration_secret(tenant_id, integration_id)
    if creds is None:
        return False, "Integration not found"
    pulled = pull_image_to_dir(tenant_id=tenant_id, integration_id=integration_id, image_ref=image_ref)
    if pulled:
        return True, "Pull succeeded"
    if not shutil.which("crane") and not shutil.which("skopeo"):
        return False, "crane or skopeo not installed on worker"
    return False, f"Pull failed for {image_ref} via {creds.get('registry', 'unknown')}"
