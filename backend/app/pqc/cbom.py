"""CycloneDX-aligned CBOM helpers for Qtangl PQC exports."""

from __future__ import annotations

from typing import Any

# Qtangl CBOM profile — maps to CycloneDX 1.6 cryptographic-asset components.
CBOM_SCHEMA_ID = "qtangl-cbom-v1"
CBOM_SPEC_VERSION = "1.6"
CBOM_FORMAT = "CycloneDX"

_REQUIRED_TOP_LEVEL = ("bomFormat", "specVersion", "version", "metadata", "components")
_REQUIRED_METADATA_PROPS = ("qtangl:cbomSchemaId", "qtangl:scanId", "qtangl:targetDomain")
_REQUIRED_ASSET_PROPS = (
    "qtangl:algorithm",
    "qtangl:keySize",
    "qtangl:vulnerabilityStatus",
    "qtangl:severity",
    "qtangl:moscaPriority",
    "qtangl:pqcReplacement",
)


def validate_cbom(document: dict[str, Any]) -> list[str]:
    """Return validation errors; empty list means the document passes Qtangl CBOM checks."""
    errors: list[str] = []

    for key in _REQUIRED_TOP_LEVEL:
        if key not in document:
            errors.append(f"missing top-level field: {key}")

    if document.get("bomFormat") != CBOM_FORMAT:
        errors.append("bomFormat must be CycloneDX")

    if document.get("specVersion") != CBOM_SPEC_VERSION:
        errors.append(f"specVersion must be {CBOM_SPEC_VERSION}")

    metadata = document.get("metadata")
    if isinstance(metadata, dict):
        props = {item["name"]: item["value"] for item in metadata.get("properties", []) if "name" in item}
        for name in _REQUIRED_METADATA_PROPS:
            if name not in props:
                errors.append(f"missing metadata property: {name}")
        if props.get("qtangl:cbomSchemaId") != CBOM_SCHEMA_ID:
            errors.append(f"qtangl:cbomSchemaId must be {CBOM_SCHEMA_ID}")
    else:
        errors.append("metadata must be an object")

    components = document.get("components")
    if not isinstance(components, list):
        errors.append("components must be a list")
    elif not components:
        errors.append("components must not be empty")
    else:
        for index, component in enumerate(components):
            if component.get("type") != "cryptographic-asset":
                errors.append(f"components[{index}].type must be cryptographic-asset")
            props = {
                item["name"]: item["value"]
                for item in component.get("properties", [])
                if isinstance(item, dict) and "name" in item
            }
            for name in _REQUIRED_ASSET_PROPS:
                if name not in props:
                    errors.append(f"components[{index}] missing property: {name}")

    return errors
