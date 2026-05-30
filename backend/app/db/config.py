from __future__ import annotations

import os


def database_url() -> str | None:
    return os.getenv("DATABASE_URL") or os.getenv("QTANGL_DATABASE_URL")


def redis_url() -> str | None:
    return os.getenv("REDIS_URL") or os.getenv("QTANGL_REDIS_URL")


def persistence_enabled() -> bool:
    return bool(database_url())


def redis_enabled() -> bool:
    return bool(redis_url())


def auto_migrate() -> bool:
    raw = os.getenv("QTANGL_DB_AUTO_MIGRATE", "true").lower()
    return raw in {"1", "true", "yes", "on"}
