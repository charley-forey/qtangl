from __future__ import annotations

import httpx
from starlette.testclient import TestClient


class StarletteTestTransport(httpx.BaseTransport):
    """Sync httpx transport backed by Starlette TestClient (dogfood tests)."""

    def __init__(self, test_client: TestClient) -> None:
        self._client = test_client

    def handle_request(self, request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if request.url.query:
            path = f"{path}?{request.url.query.decode('ascii')}"
        response = self._client.request(
            request.method,
            path,
            headers={key: value for key, value in request.headers.items()},
            content=request.content,
        )
        raw_headers = [(key.encode("ascii"), value.encode("ascii")) for key, value in response.headers.items()]
        return httpx.Response(
            status_code=response.status_code,
            headers=raw_headers,
            content=response.content,
        )
