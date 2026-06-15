from __future__ import annotations

import contextvars
from contextlib import contextmanager
from typing import Iterator

_scan_tenant_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("scan_tenant_id", default=None)


def current_scan_tenant_id() -> str | None:
    return _scan_tenant_id.get()


@contextmanager
def scan_tenant_context(tenant_id: str | None) -> Iterator[None]:
    token = _scan_tenant_id.set(tenant_id)
    try:
        yield
    finally:
        _scan_tenant_id.reset(token)
