"""Export OpenAPI JSON and Postman collection from FastAPI for CI and static hosting."""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent

sys.path.insert(0, str(ROOT))

from app.main import app  # noqa: E402


def _postman_path(path: str) -> str:
    import re

    return re.sub(r"\{[^}]+\}", "example", path)


def _postman_collection(openapi: dict[str, Any]) -> dict[str, Any]:
    server_url = "https://api.qtangl.com"
    servers = openapi.get("servers") or []
    if servers and isinstance(servers[0], dict):
        server_url = str(servers[0].get("url") or server_url)

    items: list[dict[str, Any]] = []
    for path, methods in sorted((openapi.get("paths") or {}).items()):
        if not isinstance(methods, dict):
            continue
        for method, operation in sorted(methods.items()):
            if method.startswith("x-") or not isinstance(operation, dict):
                continue
            summary = operation.get("summary") or operation.get("operationId") or path
            items.append(
                {
                    "name": f"{method.upper()} {path}",
                    "request": {
                        "method": method.upper(),
                        "header": [{"key": "Authorization", "value": "Bearer {{QTANGL_API_KEY}}"}],
                        "url": f"{{{{baseUrl}}}}{_postman_path(path)}",
                        "description": summary,
                    },
                }
            )

    return {
        "info": {
            "name": "Qtangl API",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "item": items,
        "variable": [
            {"key": "baseUrl", "value": server_url},
            {"key": "QTANGL_API_KEY", "value": "your-api-key"},
        ],
    }


def export_artifacts(*, dry_run: bool = False) -> tuple[str, str]:
    payload = app.openapi()
    openapi_text = json.dumps(payload, indent=2) + "\n"
    postman_text = json.dumps(_postman_collection(payload), indent=2) + "\n"

    if dry_run:
        return openapi_text, postman_text

    out_web = REPO / "web" / "public" / "openapi.json"
    out_backend = ROOT / "docs" / "openapi.json"
    out_postman = REPO / "web" / "public" / "postman" / "qtangl-api.json"

    out_web.parent.mkdir(parents=True, exist_ok=True)
    out_backend.parent.mkdir(parents=True, exist_ok=True)
    out_postman.parent.mkdir(parents=True, exist_ok=True)

    out_web.write_text(openapi_text, encoding="utf-8")
    out_backend.write_text(openapi_text, encoding="utf-8")
    out_postman.write_text(postman_text, encoding="utf-8")

    return openapi_text, postman_text


def main() -> None:
    export_artifacts()
    payload = app.openapi()
    print(
        f"Wrote backend/docs/openapi.json, web/public/openapi.json, "
        f"web/public/postman/qtangl-api.json ({len(payload.get('paths', {}))} paths)"
    )


if __name__ == "__main__":
    main()
