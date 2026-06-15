from __future__ import annotations

import uuid


def new_idempotency_key() -> str:
    """Return a fresh Idempotency-Key value for safe mutation retries."""
    return str(uuid.uuid4())
