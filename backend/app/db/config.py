from __future__ import annotations

import os


def normalize_database_url(url: str) -> str:
    """Railway/Heroku provide postgresql://; we use psycopg v3 (not psycopg2)."""
    if url.startswith("postgresql+psycopg://"):
        return url
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    return url


def database_url() -> str | None:
    raw = os.getenv("DATABASE_URL") or os.getenv("QTANGL_DATABASE_URL")
    if not raw:
        return None
    return normalize_database_url(raw)


def redis_url() -> str | None:
    return os.getenv("REDIS_URL") or os.getenv("QTANGL_REDIS_URL")


def persistence_enabled() -> bool:
    return bool(database_url())


def redis_enabled() -> bool:
    return bool(redis_url())


def auto_migrate() -> bool:
    raw = os.getenv("QTANGL_DB_AUTO_MIGRATE", "true").lower()
    return raw in {"1", "true", "yes", "on"}


def production_mode() -> bool:
    return os.getenv("QTANGL_ENV", "").lower() in {"production", "prod"}


def require_secrets_key() -> bool:
    raw = os.getenv("QTANGL_REQUIRE_SECRETS_KEY", "")
    if raw:
        return raw.lower() in {"1", "true", "yes", "on"}
    return production_mode()


def use_create_all_on_startup() -> bool:
    """Dev/test only — production must run `alembic upgrade head` on deploy."""
    return auto_migrate() and not production_mode()


def inline_jobs() -> bool:
    raw = os.getenv("QTANGL_INLINE_JOBS", "true").lower()
    return raw in {"1", "true", "yes", "on"}


def use_worker_queue() -> bool:
    return redis_enabled() and not inline_jobs()
