"""Generate SDK types from canonical OpenAPI (backend/docs/openapi.json)."""
from __future__ import annotations

import json
import platform
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OPENAPI = ROOT / "backend" / "docs" / "openapi.json"
PY_OUT = ROOT / "sdk" / "python" / "qtangl" / "_generated_models.py"
TS_OUT = ROOT / "sdk" / "typescript" / "src" / "generated" / "schema.d.ts"

PYTHON_MODELS = (
    "PqcScanRequest",
    "ScheduleCreateRequest",
    "SchedulePatchRequest",
    "TenantSettingsRequest",
    "VerifyReportRequest",
    "CbomConflictResolveRequest",
    "RemediationUpdateRequest",
    "ProgramCreateRequest",
    "ProgramUpdateRequest",
    "ProgramVerifyRequest",
    "ErrorResponse",
)


def _openapi_type(prop: dict[str, Any]) -> str:  # type: ignore[name-defined]
    if "$ref" in prop:
        ref = prop["$ref"].rsplit("/", 1)[-1]
        return ref
    if "anyOf" in prop:
        non_null = [item for item in prop["anyOf"] if item.get("type") != "null"]
        if len(non_null) == 1 and any(item.get("type") == "null" for item in prop["anyOf"]):
            return f"{_openapi_type(non_null[0])} | None"
        if len(non_null) == 1:
            return _openapi_type(non_null[0])
        return "Any"
    if prop.get("type") == "array":
        items = prop.get("items") or {"type": "string"}
        return f"list[{_openapi_type(items)}]"
    mapping = {"string": "str", "integer": "int", "number": "float", "boolean": "bool", "object": "dict[str, Any]"}
    return mapping.get(str(prop.get("type", "Any")), "Any")


def _emit_python_models(openapi: dict) -> str:
    schemas = openapi.get("components", {}).get("schemas", {})
    lines = [
        '"""Auto-generated from backend/docs/openapi.json — do not edit."""',
        "from __future__ import annotations",
        "",
        "from typing import Any",
        "",
        "from pydantic import BaseModel, Field",
        "",
    ]
    for name in PYTHON_MODELS:
        schema = schemas.get(name)
        if not schema:
            raise SystemExit(f"Missing OpenAPI schema: {name}")
        required = set(schema.get("required") or [])
        lines.append(f"class {name}(BaseModel):")
        props = schema.get("properties") or {}
        if not props:
            lines.append("    pass")
            lines.append("")
            continue
        for field_name, field_schema in props.items():
            py_type = _openapi_type(field_schema)
            default = field_schema.get("default")
            extra: list[str] = []
            if field_schema.get("pattern"):
                extra.append(f'pattern=r"{field_schema["pattern"]}"')
            if field_schema.get("minimum") is not None:
                extra.append(f"ge={int(field_schema['minimum']) if py_type == 'int' else field_schema['minimum']}")
            if field_schema.get("maximum") is not None:
                extra.append(f"le={int(field_schema['maximum']) if py_type == 'int' else field_schema['maximum']}")
            field_args = ", ".join(extra)
            if field_name in required:
                if field_args:
                    lines.append(f"    {field_name}: {py_type} = Field({field_args})")
                else:
                    lines.append(f"    {field_name}: {py_type}")
            elif default is not None:
                default_repr = repr(default)
                if field_args:
                    lines.append(f"    {field_name}: {py_type} = Field(default={default_repr}, {field_args})")
                else:
                    lines.append(f"    {field_name}: {py_type} = Field(default={default_repr})")
            else:
                optional_type = py_type if " | None" in py_type else f"{py_type} | None"
                if field_args:
                    lines.append(f"    {field_name}: {optional_type} = Field(default=None, {field_args})")
                else:
                    lines.append(f"    {field_name}: {optional_type} = None")
        lines.append("")
    return "\n".join(lines) + "\n"


def generate_typescript() -> None:
    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["npx", "--yes", "openapi-typescript@7.6.1", str(OPENAPI), "-o", str(TS_OUT)]
    subprocess.run(cmd, check=True, cwd=ROOT, shell=platform.system() == "Windows")


def generate_python() -> None:
    openapi = json.loads(OPENAPI.read_text(encoding="utf-8"))
    PY_OUT.write_text(_emit_python_models(openapi), encoding="utf-8")


def main() -> None:
    if not OPENAPI.exists():
        raise SystemExit(f"Missing {OPENAPI}. Run: cd backend && python scripts/export_openapi.py")
    generate_python()
    generate_typescript()
    print(f"Generated {PY_OUT.relative_to(ROOT)} and {TS_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
