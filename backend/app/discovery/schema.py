from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.discovery.constants import DISCOVERY_SCHEMA_VERSION, PRIVATE_KEY_MARKERS

_SCHEMA_PATH = Path(__file__).resolve().parents[2] / "contracts" / "discovery-finding-v1.schema.json"


def validate_finding(finding: dict[str, Any]) -> tuple[bool, str]:
    version = finding.get("schemaVersion")
    if version != DISCOVERY_SCHEMA_VERSION:
        return False, f"Unsupported schemaVersion: {version}"
    for field in ("findingId", "findingType", "hostId", "hostname", "os", "confidence"):
        if field not in finding:
            return False, f"Missing required field: {field}"
    raw = json.dumps(finding).upper()
    for marker in PRIVATE_KEY_MARKERS:
        if marker in raw:
            return False, "Private key material rejected"
    return True, "ok"


def negotiate_schema(header_value: str | None) -> int:
    if not header_value:
        return DISCOVERY_SCHEMA_VERSION
    try:
        version = int(header_value.strip())
    except ValueError:
        return DISCOVERY_SCHEMA_VERSION
    if version != DISCOVERY_SCHEMA_VERSION:
        raise ValueError(f"Unsupported discovery schema version: {version}")
    return version
