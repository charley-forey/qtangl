from __future__ import annotations

import random
import time
import uuid
from typing import Any, Mapping

import httpx

from qtangl.errors import QtanglApiError

_RETRYABLE = {429, 500, 502, 503, 504}


class Transport:
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        timeout: float = 120.0,
        max_retries: int = 3,
        client: httpx.Client | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max(0, max_retries)
        self._client = client or httpx.Client(timeout=timeout)

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> Transport:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def request(
        self,
        method: str,
        path: str,
        *,
        json: Mapping[str, Any] | None = None,
        params: Mapping[str, str | int | float | bool | None] | None = None,
        auth: bool = True,
        idempotency_key: str | None = None,
        request_id: str | None = None,
    ) -> Any:
        headers: dict[str, str] = {"Accept": "application/json"}
        if auth:
            headers["Authorization"] = f"Bearer {self.api_key}"
        if json is not None:
            headers["Content-Type"] = "application/json"
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        headers["X-Request-Id"] = request_id or str(uuid.uuid4())

        url = f"{self.base_url}{path}"
        attempt = 0
        while True:
            response = self._client.request(
                method,
                url,
                headers=headers,
                json=json,
                params=params,
            )
            if response.status_code < 400 or response.status_code not in _RETRYABLE or attempt >= self.max_retries:
                return self._parse_response(response)

            delay = min(2**attempt, 8) + random.uniform(0, 0.25)
            time.sleep(delay)
            attempt += 1

    def _parse_response(self, response: httpx.Response) -> Any:
        request_id = response.headers.get("X-Request-Id")
        if response.status_code >= 400:
            detail: Any
            text = response.text
            try:
                detail = response.json()
            except ValueError:
                detail = text
            message = text
            if isinstance(detail, dict) and "detail" in detail:
                message = str(detail["detail"])
            raise QtanglApiError(
                status_code=response.status_code,
                message=message or f"HTTP {response.status_code}",
                request_id=request_id,
                detail=detail,
            )
        if response.status_code == 204 or not response.content:
            return {}
        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type:
            return response.json()
        return response.content
