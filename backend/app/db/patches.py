"""Schema evolution via Alembic only.

Runtime ALTER TABLE patches are deprecated — use `alembic revision --autogenerate`.
"""

from __future__ import annotations

import logging

from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)


def apply_schema_patches(engine: Engine) -> None:
    """No-op: legacy column patches removed in favor of Alembic migrations."""
    logger.debug("apply_schema_patches is deprecated; run alembic upgrade head instead.")
