from __future__ import annotations

import json
import shutil
import subprocess
import uuid
from pathlib import Path
from typing import Any

from app.discovery.constants import SOURCE_METHODS
from app.discovery.host_normalize import finding_to_crypto_asset
from app.pqc.models import CryptoAsset

SCANNER_VERSIONS_PATH = Path(__file__).resolve().parents[2] / "scanner-versions.lock"


def _load_versions() -> dict[str, str]:
    if SCANNER_VERSIONS_PATH.exists():
        return json.loads(SCANNER_VERSIONS_PATH.read_text(encoding="utf-8"))
    return {"theia": "0.1.0"}


def run_binary_scan(*, image_ref: str, base_cbom: dict[str, Any] | None = None) -> dict[str, Any]:
    versions = _load_versions()
    engines: list[str] = []
    findings: list[dict[str, Any]] = []

    theia = shutil.which("cbomkit-theia") or shutil.which("theia")
    if theia:
        args = ["image", image_ref, "--output", "-"]
        if base_cbom:
            import tempfile

            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as tmp:
                json.dump(base_cbom, tmp)
                tmp_path = tmp.name
            args = ["image", image_ref, "--bom", tmp_path, "--output", "-"]
        try:
            proc = subprocess.run(
                [theia, *args],
                capture_output=True,
                text=True,
                timeout=1800,
                check=False,
            )
            if proc.returncode == 0 and proc.stdout.strip():
                doc = json.loads(proc.stdout)
                for comp in doc.get("components") or []:
                    findings.append(
                        {
                            "schemaVersion": 1,
                            "findingId": f"bin-{uuid.uuid4().hex[:16]}",
                            "findingType": "binary_artifact",
                            "hostId": str(uuid.uuid4()),
                            "hostname": image_ref,
                            "os": "linux",
                            "location": str(comp.get("name", image_ref)),
                            "algorithm": str(comp.get("version") or "unknown"),
                            "confidence": "high",
                            "metadata": {"bomRef": comp.get("bom-ref")},
                        }
                    )
                engines.append(f"theia@{versions.get('theia', '?')}")
        except (subprocess.TimeoutExpired, json.JSONDecodeError, OSError):
            pass

    if not findings:
        findings.append(
            {
                "schemaVersion": 1,
                "findingId": f"bin-{uuid.uuid4().hex[:16]}",
                "findingType": "binary_artifact",
                "hostId": str(uuid.uuid4()),
                "hostname": image_ref,
                "os": "linux",
                "location": image_ref,
                "algorithm": "pending-theia-scan",
                "confidence": "low",
                "metadata": {"note": "Install cbomkit-theia for full binary discovery"},
            }
        )
        engines.append("qtangl-stub")

    assets: list[CryptoAsset] = []
    for finding in findings:
        asset = finding_to_crypto_asset(finding, agent_hostname=image_ref)
        asset.kind = "binary_artifact"  # type: ignore[misc]
        assets.append(asset)

    return {
        "status": "ok" if "theia" in "".join(engines) else "partial",
        "imageRef": image_ref,
        "findingsCount": len(findings),
        "assetCount": len(assets),
        "assets": assets,
        "findings": findings,
        "sourceFindings": (base_cbom or {}).get("findings") or [],
        "engines": engines,
        "sourceMethod": SOURCE_METHODS["binary_scan"],
    }
