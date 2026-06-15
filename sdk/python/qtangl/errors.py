from __future__ import annotations

from typing import Any


class QtanglApiError(Exception):
    """Raised when the API returns a non-success HTTP status."""

    def __init__(
        self,
        *,
        status_code: int,
        message: str,
        request_id: str | None = None,
        detail: Any = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.request_id = request_id
        self.detail = detail
